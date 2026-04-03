from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    date = Column(String) # For simplicity matching frontend string date
    type = Column(String) # income/expense
    category = Column(String)
    ai_category = Column(String)
    account = Column(String)
    status = Column(String)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    customer = Column(String)
    amount = Column(Float)
    due_date = Column(String)
    status = Column(String) # paid, pending, overdue, draft

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String)
    warehouse = Column(String)
    current_stock = Column(Integer)
    min_stock = Column(Integer)
    max_stock = Column(Integer)
    unit_price = Column(Float)
    cost_price = Column(Float)
    status = Column(String) # in-stock, low-stock, etc.

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    department = Column(String)
    status = Column(String) # Active, etc.
    performance = Column(Float)
    join_date = Column(String)
    salary = Column(Float)
    avatar = Column(String, nullable=True)

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String, index=True)
    company = Column(String)
    value = Column(Float)
    stage = Column(String) # lead, contact, proposal, negotiation, closed
    probability = Column(Integer)
    expected_close = Column(String)
    avatar = Column(String, nullable=True)

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    is_active = Column(Integer, default=1) # 1=active, 0=inactive
    nodes = relationship("WorkflowNode", back_populates="workflow", cascade="all, delete-orphan")
    edges = relationship("WorkflowEdge", back_populates="workflow", cascade="all, delete-orphan")

class WorkflowNode(Base):
    __tablename__ = "workflow_nodes"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String) # For React Flow ID
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    type = Column(String)
    position = Column(JSON) # {x: 0, y: 0}
    data = Column(JSON)
    workflow = relationship("Workflow", back_populates="nodes")

class WorkflowEdge(Base):
    __tablename__ = "workflow_edges"
    id = Column(Integer, primary_key=True, index=True)
    edge_id = Column(String)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    source = Column(String)
    target = Column(String)
    animated = Column(Integer, default=1)
    style = Column(JSON, nullable=True)
    workflow = relationship("Workflow", back_populates="edges")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String) # ADMIN, FINANCE, INVENTORY, HR, SALES, MANAGER
    is_active = Column(Integer, default=1)
