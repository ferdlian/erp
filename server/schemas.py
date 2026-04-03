from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Transactions
class TransactionBase(BaseModel):
    description: str
    amount: float
    date: str
    type: str
    category: str
    ai_category: str
    account: str
    status: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    class Config:
        from_attributes = True

# Invoices
class InvoiceBase(BaseModel):
    number: str
    customer: str
    amount: float
    due_date: str
    status: str

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    class Config:
        from_attributes = True

# Products
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    warehouse: str
    current_stock: int
    min_stock: int
    max_stock: int
    unit_price: float
    cost_price: float
    status: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# Employees
class EmployeeBase(BaseModel):
    name: str
    role: str
    department: str
    status: str
    performance: float
    join_date: str
    salary: float
    avatar: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

# Deals
class DealBase(BaseModel):
    customer: str
    company: str
    value: float
    stage: str
    probability: int
    expected_close: str
    avatar: Optional[str] = None

class DealCreate(DealBase):
    pass

class Deal(DealBase):
    id: int
    class Config:
        from_attributes = True

# Workflows
class WorkflowNodeBase(BaseModel):
    node_id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class WorkflowNodeCreate(WorkflowNodeBase):
    pass

class WorkflowNode(WorkflowNodeBase):
    id: int
    workflow_id: int
    class Config:
        from_attributes = True

class WorkflowEdgeBase(BaseModel):
    edge_id: str
    source: str
    target: str
    animated: Optional[int] = 1
    style: Optional[Dict[str, Any]] = None

class WorkflowEdgeCreate(WorkflowEdgeBase):
    pass

class WorkflowEdge(WorkflowEdgeBase):
    id: int
    workflow_id: int
    class Config:
        from_attributes = True

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[int] = 1

class WorkflowCreate(WorkflowBase):
    nodes: List[WorkflowNodeCreate]
    edges: List[WorkflowEdgeCreate]

class Workflow(WorkflowBase):
    id: int
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    class Config:
        orm_mode = True

# --- Auth Schemas ---
class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
