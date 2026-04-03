from sqlalchemy.orm import Session
import models, schemas
import auth

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
def get_workflows(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Workflow).offset(skip).limit(limit).all()

def get_workflow(db: Session, workflow_id: int):
    return db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()

def create_workflow(db: Session, workflow: schemas.WorkflowCreate):
    # Create the main workflow record
    db_workflow = models.Workflow(
        name=workflow.name,
        description=workflow.description,
        is_active=workflow.is_active
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
    
    # Update main info
    db_workflow.name = workflow.name
    db_workflow.description = workflow.description
    db_workflow.is_active = workflow.is_active
    
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
    db.query(models.Workflow).delete()
    db.commit()
    return True
