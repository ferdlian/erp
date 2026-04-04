from sqlalchemy.orm import Session
import datetime
import models, schemas
import auth

WORKFLOW_STATUSES = {"draft", "published", "archived"}


def _utc_now_iso() -> str:
    return datetime.datetime.utcnow().isoformat()

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
    if db_workflow.status == "archived":
        raise ValueError("Archived workflow cannot be published")

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
