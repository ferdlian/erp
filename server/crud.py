from sqlalchemy.orm import Session
import datetime
from typing import Any, Dict, List, Optional, Tuple
import models, schemas
import auth

WORKFLOW_STATUSES = {"draft", "published", "archived"}
WORKFLOW_RUN_FINAL_STATUSES = {"completed", "failed", "rejected"}


def _utc_now_iso() -> str:
    return datetime.datetime.utcnow().isoformat()

def _log_workflow_run(
    db: Session,
    run: models.WorkflowRun,
    level: str,
    message: str,
    node_id: Optional[str] = None,
    node_type: Optional[str] = None,
    log_data: Optional[Dict[str, Any]] = None,
):
    log_row = models.WorkflowRunLog(
        run_id=run.id,
        workflow_id=run.workflow_id,
        node_id=node_id,
        node_type=node_type,
        level=level,
        message=message,
        log_data=log_data,
        created_at=_utc_now_iso(),
    )
    db.add(log_row)

def _edge_branch_name(edge: Dict[str, Any]) -> Optional[str]:
    style = edge.get("style") if isinstance(edge.get("style"), dict) else {}
    if isinstance(style, dict):
        branch = style.get("branch") or style.get("label")
        if isinstance(branch, str):
            return branch.strip().lower()
    return None

def _build_graph(definition: Dict[str, Any]) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, List[Dict[str, Any]]]]:
    nodes = definition.get("nodes") or []
    edges = definition.get("edges") or []
    node_map = {node.get("node_id"): node for node in nodes if node.get("node_id")}
    outgoing: Dict[str, List[Dict[str, Any]]] = {}
    for edge in edges:
        source = edge.get("source")
        if not source:
            continue
        outgoing.setdefault(source, []).append(edge)
    return node_map, outgoing

def _pick_next_node_id(
    current_node_id: str,
    outgoing: Dict[str, List[Dict[str, Any]]],
    branch_priority: Optional[List[str]] = None,
) -> Optional[str]:
    branch_priority = branch_priority or ["default"]
    edges = outgoing.get(current_node_id, [])
    if not edges:
        return None

    for branch in branch_priority:
        match = next((edge for edge in edges if _edge_branch_name(edge) == branch.lower()), None)
        if match:
            return match.get("target")

    # fallback: edge without branch metadata
    plain = next((edge for edge in edges if not _edge_branch_name(edge)), None)
    if plain:
        return plain.get("target")
    return edges[0].get("target")

def _evaluate_condition(config: Dict[str, Any], context_payload: Dict[str, Any]) -> bool:
    field = config.get("field")
    operator = config.get("operator")
    expected = config.get("value")
    if not isinstance(field, str) or not isinstance(operator, str):
        return False

    actual = context_payload.get(field)
    try:
        if operator == "==":
            return actual == expected
        if operator == "!=":
            return actual != expected
        if operator == ">":
            return actual is not None and actual > expected
        if operator == "<":
            return actual is not None and actual < expected
        if operator == ">=":
            return actual is not None and actual >= expected
        if operator == "<=":
            return actual is not None and actual <= expected
    except TypeError:
        return False
    return False

def _render_template(template: str, values: Dict[str, Any]) -> str:
    rendered = template
    for key, value in values.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
    return rendered

def _execute_task_node(
    db: Session,
    run: models.WorkflowRun,
    node_id: str,
    config: Dict[str, Any],
    context_payload: Dict[str, Any],
    node_data: Optional[Dict[str, Any]] = None,
):
    action_type = str(config.get("action_type") or "notification.create").strip().lower()

    # Keep action type flexible across all modules:
    # - notification.create
    # - <module>.notification.create  (e.g. inventory.notification.create)
    action_parts = action_type.split(".")
    canonical_action_type = action_type
    if len(action_parts) >= 2 and action_parts[-2:] == ["notification", "create"]:
        canonical_action_type = "notification.create"

    # Generic condition gate for any task action.
    when = config.get("when")
    if isinstance(when, dict):
        should_run = _evaluate_condition(when, context_payload)
        if not should_run:
            _log_workflow_run(
                db,
                run,
                "info",
                "Task skipped (when condition = false)",
                node_id=node_id,
                node_type="task",
                log_data={"when": when, "payload": context_payload},
            )
            return

    if canonical_action_type == "notification.create":
        notification_cfg = config.get("notification") if isinstance(config.get("notification"), dict) else {}
        node_data = node_data or {}
        node_label = str(node_data.get("label") or "").strip()
        node_description = str(node_data.get("description") or "").strip()
        data_scope = {
            **(context_payload or {}),
            "event_name": (run.context_json or {}).get("event_name"),
            "node_label": node_label,
            "node_description": node_description,
        }
        title_tmpl = str(notification_cfg.get("title") or node_label or "Notifikasi Workflow")
        message_tmpl = str(
            notification_cfg.get("message_template")
            or node_description
            or "Workflow event: {{event_name}}"
        )
        notif_type = str(notification_cfg.get("type") or "info")

        db.add(
            models.Notification(
                title=_render_template(title_tmpl, data_scope),
                message=_render_template(message_tmpl, data_scope),
                type=notif_type,
                time_label="Baru saja",
                is_read=0,
                timestamp=_utc_now_iso(),
            )
        )
        _log_workflow_run(
            db,
            run,
            "info",
            "Task executed: notification created",
            node_id=node_id,
            node_type="task",
            log_data={"action_type": action_type, "canonical_action_type": canonical_action_type, "config": config},
        )
        return

    _log_workflow_run(
        db,
        run,
        "warning",
        "Task action type not recognized, skipped",
        node_id=node_id,
        node_type="task",
        log_data={"action_type": action_type, "canonical_action_type": canonical_action_type, "config": config},
    )

def _run_engine_from_node(
    db: Session,
    run: models.WorkflowRun,
    definition: Dict[str, Any],
    start_node_id: str,
):
    node_map, outgoing = _build_graph(definition)
    context = run.context_json or {}
    current_node_id = start_node_id
    safety_counter = 0

    while current_node_id:
        safety_counter += 1
        if safety_counter > 200:
            run.status = "failed"
            run.finished_at = _utc_now_iso()
            _log_workflow_run(db, run, "error", "Engine stopped due to safety limit", current_node_id)
            return

        node = node_map.get(current_node_id)
        if not node:
            run.status = "failed"
            run.finished_at = _utc_now_iso()
            _log_workflow_run(db, run, "error", "Node definition not found", current_node_id)
            return

        node_type = (node.get("type") or "").lower()
        node_config = node.get("config") if isinstance(node.get("config"), dict) else {}
        node_data = node.get("data") if isinstance(node.get("data"), dict) else {}
        run.current_node_id = current_node_id

        _log_workflow_run(
            db,
            run,
            "info",
            f"Executing node [{node_type}]",
            node_id=current_node_id,
            node_type=node_type,
            log_data={"config": node_config},
        )

        if node_type == "end":
            run.status = "completed"
            run.finished_at = _utc_now_iso()
            _log_workflow_run(db, run, "info", "Workflow run completed", current_node_id, node_type)
            return

        if node_type == "approval":
            pending = (
                db.query(models.WorkflowApproval)
                .filter(
                    models.WorkflowApproval.run_id == run.id,
                    models.WorkflowApproval.node_id == current_node_id,
                    models.WorkflowApproval.status == "pending",
                )
                .first()
            )
            if not pending:
                db.add(
                    models.WorkflowApproval(
                        run_id=run.id,
                        workflow_id=run.workflow_id,
                        node_id=current_node_id,
                        status="pending",
                        requested_at=_utc_now_iso(),
                    )
                )
            run.status = "waiting_approval"
            _log_workflow_run(db, run, "info", "Waiting approval", current_node_id, node_type)
            return

        if node_type in {"task", "action"}:
            payload = context.get("payload") if isinstance(context.get("payload"), dict) else {}
            _execute_task_node(db, run, current_node_id, node_config or {}, payload, node_data=node_data)

        branch_preference = ["default"]
        if node_type == "condition":
            condition_result = _evaluate_condition(node_config or {}, context.get("payload") or {})
            branch_preference = ["true" if condition_result else "false", "default"]
            _log_workflow_run(
                db,
                run,
                "info",
                "Condition evaluated",
                current_node_id,
                node_type,
                {"result": condition_result},
            )

        next_node_id = _pick_next_node_id(current_node_id, outgoing, branch_preference)
        if not next_node_id:
            run.status = "completed"
            run.finished_at = _utc_now_iso()
            _log_workflow_run(db, run, "info", "No outgoing edge, run completed", current_node_id, node_type)
            return

        current_node_id = next_node_id

def trigger_event_and_run_workflows(db: Session, event_name: str, payload: Optional[Dict[str, Any]] = None):
    payload = payload or {}
    event_name = event_name.strip()
    if not event_name:
        raise ValueError("event_name is required")

    published_workflows = (
        db.query(models.Workflow)
        .filter(models.Workflow.status == "published", models.Workflow.active_version_id.isnot(None))
        .all()
    )

    created_runs: List[models.WorkflowRun] = []
    for workflow in published_workflows:
        version = workflow.active_version
        if not version or not isinstance(version.definition_json, dict):
            continue

        definition = version.definition_json
        trigger_nodes = [
            node for node in (definition.get("nodes") or [])
            if (node.get("type") or "").lower() == "trigger"
        ]
        matched_trigger = next(
            (
                node for node in trigger_nodes
                if ((node.get("config") or {}).get("event_name") == event_name)
            ),
            None,
        )
        if not matched_trigger:
            continue
        trigger_node_id = matched_trigger.get("node_id")
        if not isinstance(trigger_node_id, str) or not trigger_node_id:
            continue

        run = models.WorkflowRun(
            workflow_id=workflow.id,
            workflow_version_id=version.id,
            trigger_event=event_name,
            status="running",
            current_node_id=trigger_node_id,
            context_json={"payload": payload, "event_name": event_name},
            started_at=_utc_now_iso(),
        )
        db.add(run)
        db.flush()

        _log_workflow_run(
            db,
            run,
            "info",
            "Workflow run started by event",
            node_id=trigger_node_id,
            node_type="trigger",
            log_data={"event_name": event_name},
        )
        _run_engine_from_node(db, run, definition, trigger_node_id)
        created_runs.append(run)

    db.commit()
    for run in created_runs:
        db.refresh(run)
    return created_runs

def list_workflow_runs(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.WorkflowRun)
        .order_by(models.WorkflowRun.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_workflow_run(db: Session, run_id: int):
    return db.query(models.WorkflowRun).filter(models.WorkflowRun.id == run_id).first()

def get_workflow_run_logs(db: Session, run_id: int):
    return (
        db.query(models.WorkflowRunLog)
        .filter(models.WorkflowRunLog.run_id == run_id)
        .order_by(models.WorkflowRunLog.id.asc())
        .all()
    )

def list_pending_approvals(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.WorkflowApproval)
        .filter(models.WorkflowApproval.status == "pending")
        .order_by(models.WorkflowApproval.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def _resume_run_after_approval(
    db: Session,
    run: models.WorkflowRun,
    approved: bool,
    payload: Optional[Dict[str, Any]] = None,
):
    version = db.query(models.WorkflowVersion).filter(models.WorkflowVersion.id == run.workflow_version_id).first()
    if not version or not isinstance(version.definition_json, dict):
        run.status = "failed"
        run.finished_at = _utc_now_iso()
        _log_workflow_run(db, run, "error", "Workflow version not found during resume")
        return

    definition = version.definition_json
    _, outgoing = _build_graph(definition)
    current_node_id = run.current_node_id
    if not current_node_id:
        run.status = "failed"
        run.finished_at = _utc_now_iso()
        _log_workflow_run(db, run, "error", "Run has no current approval node")
        return

    branch_pref = ["approve", "default"] if approved else ["reject"]
    next_node_id = _pick_next_node_id(current_node_id, outgoing, branch_pref)

    if not approved and not next_node_id:
        run.status = "rejected"
        run.finished_at = _utc_now_iso()
        _log_workflow_run(db, run, "warning", "Run rejected and stopped", current_node_id, "approval")
        return

    if not next_node_id:
        run.status = "completed"
        run.finished_at = _utc_now_iso()
        _log_workflow_run(db, run, "info", "Approval done without next node, run completed", current_node_id, "approval")
        return

    run.status = "running"
    run.current_node_id = next_node_id
    if payload:
        context = run.context_json or {}
        context["approval_payload"] = payload
        run.context_json = context
    _run_engine_from_node(db, run, definition, next_node_id)

def decide_workflow_approval(
    db: Session,
    run_id: int,
    approve: bool,
    acted_by: Optional[str] = None,
    comment: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
):
    run = db.query(models.WorkflowRun).filter(models.WorkflowRun.id == run_id).first()
    if not run:
        return None
    if run.status in WORKFLOW_RUN_FINAL_STATUSES:
        raise ValueError("Workflow run is already finished")
    if run.status != "waiting_approval":
        raise ValueError("Workflow run is not waiting approval")

    approval = (
        db.query(models.WorkflowApproval)
        .filter(models.WorkflowApproval.run_id == run_id, models.WorkflowApproval.status == "pending")
        .order_by(models.WorkflowApproval.id.asc())
        .first()
    )
    if not approval:
        raise ValueError("Pending approval not found")

    approval.status = "approved" if approve else "rejected"
    approval.acted_at = _utc_now_iso()
    approval.acted_by = acted_by
    approval.comment = comment
    approval.decision_payload = payload

    _log_workflow_run(
        db,
        run,
        "info",
        "Approval decision received",
        node_id=approval.node_id,
        node_type="approval",
        log_data={"decision": approval.status, "acted_by": acted_by, "comment": comment},
    )
    _resume_run_after_approval(db, run, approved=approve, payload=payload)
    db.commit()
    db.refresh(run)
    return run

# --- User Auth CRUD ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def init_admin(db: Session):
    admin_exists = get_user_by_username(db, "admin")
    if not admin_exists:
        admin_data = schemas.UserCreate(
            username="admin",
            password="adminpassword", # Should be changed immediately
            full_name="Super Administrator",
            role="ADMIN"
        )
        create_user(db, admin_data)
        
        # Also create a few mock users for different roles
        create_user(db, schemas.UserCreate(username="finance", password="password123", full_name="Finance Staff", role="FINANCE"))
        create_user(db, schemas.UserCreate(username="inventory", password="password123", full_name="Inventory Staff", role="INVENTORY"))
        create_user(db, schemas.UserCreate(username="staff", password="password123", full_name="General Staff", role="SALES"))

# Transactions
def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
    return db_transaction

# Products
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductCreate):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        for key, value in product.dict().items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

# Employees
def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
    return db_employee

# Workflows
def get_workflows(db: Session, skip: int = 0, limit: int = 100, include_archived: bool = False):
    query = db.query(models.Workflow)
    if not include_archived:
        query = query.filter(models.Workflow.status != "archived")
    return query.order_by(models.Workflow.id).offset(skip).limit(limit).all()

def get_workflow(db: Session, workflow_id: int):
    return db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()

def create_workflow(db: Session, workflow: schemas.WorkflowCreate):
    status = (workflow.status or "draft").lower()
    if status not in WORKFLOW_STATUSES:
        raise ValueError("Invalid workflow status")

    now_iso = _utc_now_iso()

    # New workflow must start as draft.
    status = "draft"

    # Create the main workflow record
    db_workflow = models.Workflow(
        name=workflow.name,
        description=workflow.description,
        is_active=workflow.is_active,
        status=status,
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    
    # Add nodes
    for node in workflow.nodes:
        db_node = models.WorkflowNode(**node.dict(), workflow_id=db_workflow.id)
        db.add(db_node)
        
    # Add edges
    for edge in workflow.edges:
        db_edge = models.WorkflowEdge(**edge.dict(), workflow_id=db_workflow.id)
        db.add(db_edge)
        
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def delete_workflow(db: Session, workflow_id: int):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow:
        db.delete(db_workflow)
        db.commit()
    return db_workflow

def update_workflow(db: Session, workflow_id: int, workflow: schemas.WorkflowCreate):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not db_workflow:
        return None

    if db_workflow.status == "published":
        raise ValueError("Published workflow cannot be edited directly")

    next_status = (workflow.status or db_workflow.status or "draft").lower()
    if next_status not in WORKFLOW_STATUSES:
        raise ValueError("Invalid workflow status")
    if next_status == "published":
        raise ValueError("Use publish endpoint to publish workflow")

    # Update main info
    db_workflow.name = workflow.name
    db_workflow.description = workflow.description
    db_workflow.is_active = workflow.is_active
    db_workflow.status = next_status
    db_workflow.updated_at = _utc_now_iso()

    # Clear old nodes and edges (Cascade delete-orphan should handle this)
    # We clear the collections to trigger the deletion in SQLAlchemy
    db_workflow.nodes = []
    db_workflow.edges = []
    db.commit() # Commit deletion first
    
    # Add new nodes
    for node in workflow.nodes:
        db_node = models.WorkflowNode(**node.dict(), workflow_id=workflow_id)
        db.add(db_node)
        
    # Add new edges
    for edge in workflow.edges:
        db_edge = models.WorkflowEdge(**edge.dict(), workflow_id=workflow_id)
        db.add(db_edge)
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def publish_workflow(db: Session, workflow_id: int):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not db_workflow:
        return None

    now_iso = _utc_now_iso()
    current_version = (
        db.query(models.WorkflowVersion)
        .filter(models.WorkflowVersion.workflow_id == workflow_id)
        .order_by(models.WorkflowVersion.version_number.desc())
        .first()
    )
    next_version = (current_version.version_number + 1) if current_version else 1

    for version in db_workflow.versions:
        version.is_active = 0

    snapshot = {
        "workflow_id": db_workflow.id,
        "name": db_workflow.name,
        "description": db_workflow.description,
        "is_active": db_workflow.is_active,
        "status": "published",
        "nodes": [
            {
                "node_id": node.node_id,
                "type": node.type,
                "position": node.position,
                "data": node.data,
                "config": node.config or {},
            }
            for node in db_workflow.nodes
        ],
        "edges": [
            {
                "edge_id": edge.edge_id,
                "source": edge.source,
                "target": edge.target,
                "animated": edge.animated,
                "style": edge.style,
            }
            for edge in db_workflow.edges
        ],
    }

    version = models.WorkflowVersion(
        workflow_id=workflow_id,
        version_number=next_version,
        is_active=1,
        definition_json=snapshot,
        published_at=now_iso,
        created_at=now_iso,
    )
    db.add(version)
    db.flush()

    db_workflow.status = "published"
    db_workflow.active_version_id = version.id
    db_workflow.updated_at = now_iso
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def archive_workflow(db: Session, workflow_id: int):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not db_workflow:
        return None
    db_workflow.status = "archived"
    db_workflow.updated_at = _utc_now_iso()
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


def duplicate_workflow(db: Session, workflow_id: int):
    source_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not source_workflow:
        return None

    now_iso = _utc_now_iso()
    cloned = models.Workflow(
        name=f"{source_workflow.name} (Copy)",
        description=source_workflow.description,
        is_active=source_workflow.is_active,
        status="draft",
        created_at=now_iso,
        updated_at=now_iso,
    )
    db.add(cloned)
    db.flush()

    for node in source_workflow.nodes:
        db.add(
            models.WorkflowNode(
                node_id=node.node_id,
                workflow_id=cloned.id,
                type=node.type,
                position=node.position,
                data=node.data,
                config=node.config,
            )
        )

    for edge in source_workflow.edges:
        db.add(
            models.WorkflowEdge(
                edge_id=edge.edge_id,
                workflow_id=cloned.id,
                source=edge.source,
                target=edge.target,
                animated=edge.animated,
                style=edge.style,
            )
        )

    db.commit()
    db.refresh(cloned)
    return cloned

# Deals
def get_deals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Deal).offset(skip).limit(limit).all()

def create_deal(db: Session, deal: schemas.DealCreate):
    db_deal = models.Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

def delete_deal(db: Session, deal_id: int):
    db_deal = db.query(models.Deal).filter(models.Deal.id == deal_id).first()
    if db_deal:
        db.delete(db_deal)
        db.commit()
    return db_deal

# Invoices
def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    db_invoice = models.Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# System Reset
def reset_database(db: Session):
    db.query(models.Transaction).delete()
    db.query(models.Invoice).delete()
    db.query(models.Product).delete()
    db.query(models.Employee).delete()
    db.query(models.Deal).delete()
    db.query(models.WorkflowApproval).delete()
    db.query(models.WorkflowRunLog).delete()
    db.query(models.WorkflowRun).delete()
    db.query(models.WorkflowNode).delete()
    db.query(models.WorkflowEdge).delete()
    db.query(models.WorkflowVersion).delete()
    db.query(models.Workflow).delete()
    # Also delete notifications and messages if full reset is wanted
    db.query(models.Notification).delete()
    db.query(models.Message).delete()
    db.commit()
    return True

# --- TopBar ---
def get_notifications(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Notification).order_by(models.Notification.id.desc()).offset(skip).limit(limit).all()

def get_messages(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Message).order_by(models.Message.id.desc()).offset(skip).limit(limit).all()

def mark_all_notifications_read(db: Session):
    db.query(models.Notification).filter(models.Notification.is_read == 0).update({models.Notification.is_read: 1}, synchronize_session=False)
    db.commit()
    return True

def init_topbar_mock_data(db: Session):
    notif_count = db.query(models.Notification).count()
    if notif_count == 0:
        db.add_all([
            models.Notification(title="Stok Kritis", message="Laptop XPS 13 hanya tersisa 2 unit di gudang.", type="alert", time_label="10 menit yang lalu", is_read=0, timestamp="2026-04-03T10:00:00"),
            models.Notification(title="Faktur Jatuh Tempo", message="Invoice INV-2026-041 belum dibayar (Rp 45.000.000).", type="warning", time_label="1 jam yang lalu", is_read=0, timestamp="2026-04-03T09:00:00"),
            models.Notification(title="Server AI Selesai", message="Pelatihan model analitik Q1 telah rampung.", type="success", time_label="2 jam yang lalu", is_read=0, timestamp="2026-04-03T08:00:00"),
            models.Notification(title="Pencapaian Kuartal", message="Target penjualan Q2 telah mencapai 80%.", type="info", time_label="Kemarin", is_read=1, timestamp="2026-04-02T15:00:00")
        ])
    
    msg_count = db.query(models.Message).count()
    if msg_count == 0:
        db.add_all([
            models.Message(sender="Budi (Finance)", avatar="B", message_content="Tolong approvenya untuk invoice Q2.", time_label="10:30 AM", is_unread=1, timestamp="2026-04-03T10:30:00"),
            models.Message(sender="Sinta (HR)", avatar="S", message_content="Dokumen cuti karyawan sudah dikirim.", time_label="Kemarin", is_unread=1, timestamp="2026-04-02T09:00:00"),
            models.Message(sender="NEXUS AI Bot", avatar="🤖", message_content="Insight baru: Prediksi penjualan turun 5% minggu depan.", time_label="Selasa", is_unread=0, timestamp="2026-04-01T14:00:00")
        ])
    
    if notif_count == 0 or msg_count == 0:
        db.commit()
