// ===== NexusERP Type Definitions =====

// ===== Common =====
export interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'prediction' | 'anomaly';
  module: ModuleName;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: string;
  actionable: boolean;
  action?: string;
}

export type ModuleName = 'finance' | 'inventory' | 'hr' | 'crm' | 'supply-chain' | 'dashboard';

export interface ModuleHealth {
  module: ModuleName;
  score: number;
  trend: 'up' | 'down' | 'stable';
  issues: number;
  label: string;
}

// ===== Finance =====
export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  aiCategory: string;
  description: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  issuedDate: string;
}

export interface FinanceOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  revenueGrowth: number;
  healthScore: number;
  monthlyRevenue: { month: string; revenue: number; expenses: number; profit: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  recentTransactions: Transaction[];
  invoices: Invoice[];
  aiInsights: AIInsight[];
}

// ===== Inventory =====
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  date: string;
  reference: string;
  warehouse: string;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQty: number;
  confidence: number;
  reason: string;
  estimatedCost: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface InventoryOverview {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  turnoverRate: number;
  stockByCategory: { name: string; value: number; color: string }[];
  demandForecast: { day: string; predicted: number; actual: number }[];
  products: Product[];
  movements: StockMovement[];
  reorderSuggestions: ReorderSuggestion[];
  aiInsights: AIInsight[];
}

// ===== HR =====
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'on-leave' | 'probation' | 'terminated';
  performanceScore: number;
  aiScore: number;
  avatar: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  score: number;
  aiScore: number;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export interface Recruitment {
  id: string;
  position: string;
  department: string;
  candidates: number;
  stage: 'open' | 'screening' | 'interview' | 'offer' | 'closed';
  aiTopMatch: string;
  matchScore: number;
  postedDate: string;
}

export interface HROverview {
  totalEmployees: number;
  avgPerformance: number;
  openPositions: number;
  turnoverRate: number;
  attendanceRate: number;
  departmentDistribution: { name: string; value: number; color: string }[];
  performanceTrend: { month: string; score: number; aiPrediction: number }[];
  employees: Employee[];
  reviews: PerformanceReview[];
  recruitment: Recruitment[];
  aiInsights: AIInsight[];
}

// ===== CRM =====
export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: 'enterprise' | 'mid-market' | 'smb' | 'startup';
  lifetimeValue: number;
  lastContact: string;
  status: 'active' | 'inactive' | 'prospect';
}

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  company: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  aiProbability: number;
  expectedClose: string;
  assignee: string;
}

export interface CRMOverview {
  totalDeals: number;
  pipelineValue: number;
  wonThisMonth: number;
  conversionRate: number;
  avgDealSize: number;
  salesTrend: { month: string; won: number; lost: number; pipeline: number }[];
  stageDistribution: { name: string; value: number; count: number; color: string }[];
  deals: Deal[];
  contacts: Contact[];
  aiInsights: AIInsight[];
}

// ===== Supply Chain =====
export interface Supplier {
  id: string;
  name: string;
  rating: number;
  leadTime: number;
  reliabilityScore: number;
  totalOrders: number;
  onTimeDelivery: number;
  category: string;
  location: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
}

export interface SupplyChainOverview {
  totalSuppliers: number;
  activeOrders: number;
  avgLeadTime: number;
  onTimeRate: number;
  totalSpend: number;
  costTrend: { month: string; cost: number; optimized: number }[];
  supplierPerformance: { name: string; score: number; orders: number; color: string }[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  aiInsights: AIInsight[];
}

// ===== AI Chat =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  data?: Record<string, unknown>;
  chart?: {
    type: 'bar' | 'line' | 'pie';
    data: Record<string, unknown>[];
  };
}
