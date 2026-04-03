from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

import crud, models, schemas, auth
from database import SessionLocal, engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize Admin on startup
with SessionLocal() as db:
    crud.init_admin(db)
    crud.init_topbar_mock_data(db)

app = FastAPI(title="NexusERP API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Endpoints ---
@app.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "NexusERP API Is Running"}

# Transactions
@app.get("/finance/transactions", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transactions(db, skip=skip, limit=limit)

@app.post("/finance/transactions", response_model=schemas.Transaction)
def create_finance_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@app.delete("/finance/transactions/{transaction_id}")
def delete_finance_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = crud.delete_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted"}

# Inventory
@app.get("/inventory/products", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/inventory/products", response_model=schemas.Product)
def create_inventory_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.delete("/inventory/products/{product_id}")
def delete_inventory_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.delete_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@app.put("/inventory/products/{product_id}", response_model=schemas.Product)
def update_erp_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.update_product(db, product_id=product_id, product=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

# HR
@app.get("/hr/employees", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_employees(db, skip=skip, limit=limit)

@app.post("/hr/employees", response_model=schemas.Employee)
def create_hr_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db=db, employee=employee)

@app.delete("/hr/employees/{employee_id}")
def delete_hr_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud.delete_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

# Workflows
@app.get("/workflows", response_model=List[schemas.Workflow])
def read_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_workflows(db, skip=skip, limit=limit)

@app.post("/workflows", response_model=schemas.Workflow)
def create_erp_workflow(workflow: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    return crud.create_workflow(db=db, workflow=workflow)

@app.put("/workflows/{workflow_id}", response_model=schemas.Workflow)
def update_erp_workflow(workflow_id: int, workflow: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = crud.update_workflow(db, workflow_id=workflow_id, workflow=workflow)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow

@app.delete("/workflows/{workflow_id}")
def delete_erp_workflow(workflow_id: int, db: Session = Depends(get_db)):
    db_workflow = crud.delete_workflow(db, workflow_id=workflow_id)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted"}

# Deals (CRM)
@app.get("/crm/deals", response_model=List[schemas.Deal])
def read_deals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_deals(db, skip=skip, limit=limit)

@app.post("/crm/deals", response_model=schemas.Deal)
def create_erp_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    return crud.create_deal(db=db, deal=deal)

@app.delete("/crm/deals/{deal_id}")
def delete_erp_deal(deal_id: int, db: Session = Depends(get_db)):
    db_deal = crud.delete_deal(db, deal_id=deal_id)
    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal deleted"}

# Invoices
@app.get("/finance/invoices", response_model=List[schemas.Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_invoices(db, skip=skip, limit=limit)

@app.post("/finance/invoices", response_model=schemas.Invoice)
def create_erp_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return crud.create_invoice(db=db, invoice=invoice)

# TopBar (Notifications & Messages)
@app.get("/notifications", response_model=List[schemas.Notification])
def read_notifications(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_notifications(db, skip=skip, limit=limit)

@app.post("/notifications/read_all")
def mark_notifications_read(db: Session = Depends(get_db)):
    crud.mark_all_notifications_read(db)
    return {"message": "All notifications marked as read"}

@app.get("/messages", response_model=List[schemas.MessageSchema])
def read_messages(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_messages(db, skip=skip, limit=limit)

# System Admin
@app.post("/system/reset")
def reset_erp_database(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("ADMIN"))):
    crud.reset_database(db)
    # Re-init admin after reset
    crud.init_admin(db)
    crud.init_topbar_mock_data(db)
    return {"message": "Database cleared and admin re-initialized"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
