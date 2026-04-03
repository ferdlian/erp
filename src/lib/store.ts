import { create } from 'zustand';
import { 
  FinanceOverview, InventoryOverview, HROverview, CRMOverview, SupplyChainOverview,
  Transaction, Product, Employee, Deal, PurchaseOrder, Invoice, AppNotification, AppMessage
} from './types';
import { financeData } from './mock-data/finance';
import { inventoryData } from './mock-data/inventory';
import { hrData } from './mock-data/hr';
import { crmData } from './mock-data/crm';
import { supplyChainData } from './mock-data/supply-chain';
import { companyMetrics, recentActivity, globalInsights, moduleHealthScores } from './mock-data/ai-insights';

const API_BASE_URL = 'http://localhost:8000';

interface ERPStore {
  // Auth State
  user: { id: number; username: string; full_name: string; role: string } | null;
  token: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;

  // Data State
  finance: FinanceOverview;
  inventory: InventoryOverview;
  hr: HROverview;
  crm: CRMOverview;
  supplyChain: SupplyChainOverview;
  metrics: typeof companyMetrics;
  activity: typeof recentActivity;
  globalInsights: typeof globalInsights;
  moduleHealthScores: typeof moduleHealthScores;
  
  // TopBar State
  notifications: AppNotification[];
  messages: AppMessage[];
  markAllNotificationsRead: () => Promise<void>;

  isLoading: boolean;

  // Global Actions
  initializeStore: () => Promise<void>;

  // Finance Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id'>) => Promise<void>;

  // Inventory Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
  updateStock: (productId: string, newStock: number) => void;

  // HR Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;

  // CRM Actions
  addDeal: (deal: Omit<Deal, 'id'>) => void;
  updateDealStage: (id: string, stage: Deal['stage']) => void;

  // Global Actions
  updateMetrics: () => void;
  resetDatabase: () => Promise<boolean>;
}

export const useERPStore = create<ERPStore>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null,

  login: async (token: string) => {
    localStorage.setItem('nexus_token', token);
    set({ token });
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        set({ user });
        await get().initializeStore();
        return true;
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('nexus_token');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  finance: financeData,
  inventory: inventoryData,
  hr: hrData,
  crm: crmData,
  supplyChain: supplyChainData,
  metrics: companyMetrics,
  activity: recentActivity,
  globalInsights: globalInsights,
  moduleHealthScores: moduleHealthScores,
  notifications: [],
  messages: [],
  isLoading: false,

  initializeStore: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [txRes, prodRes, empRes, dealRes, invRes, notifRes, msgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/finance/transactions`, { headers }),
        fetch(`${API_BASE_URL}/inventory/products`, { headers }),
        fetch(`${API_BASE_URL}/hr/employees`, { headers }),
        fetch(`${API_BASE_URL}/crm/deals`, { headers }),
        fetch(`${API_BASE_URL}/finance/invoices`, { headers }),
        fetch(`${API_BASE_URL}/notifications`, { headers }),
        fetch(`${API_BASE_URL}/messages`, { headers }),
      ]);

      const transactions = await txRes.json();
      const products = await prodRes.json();
      const employees = await empRes.json();
      const deals = await dealRes.json();
      const invoices = await invRes.json();
      
      const notifications = await notifRes.json();
      const messages = await msgRes.json();

      set((state) => {
        // Calculate finance metrics
        const totalRevenue = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
        const totalExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
        
        // Calculate inventory metrics
        const totalValue = products.reduce((acc: number, p: any) => acc + (p.current_stock * p.cost_price), 0);
        const lowStockCount = products.filter((p: any) => p.current_stock <= p.min_stock).length;

        return {
          finance: {
            ...state.finance,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            recentTransactions: transactions.map((t: any) => ({ ...t, id: String(t.id), aiCategory: t.ai_category })),
            invoices: invoices.map((inv: any) => ({ ...inv, id: String(inv.id), dueDate: inv.due_date })),
          },
          inventory: {
            ...state.inventory,
            totalProducts: products.length,
            totalValue,
            lowStockCount,
            products: products.map((p: any) => ({ 
              ...p, 
              id: String(p.id), 
              currentStock: p.current_stock, 
              minStock: p.min_stock, 
              maxStock: p.max_stock,
              unitPrice: p.unit_price,
              costPrice: p.cost_price
            })),
          },
          hr: {
            ...state.hr,
            totalEmployees: employees.length,
            employees: employees.map((e: any) => ({ ...e, id: String(e.id), performanceScore: e.performance, hireDate: e.join_date })),
          },
          crm: {
            ...state.crm,
            totalDeals: deals.length,
            pipelineValue: deals.reduce((acc: number, d: any) => acc + d.value, 0),
            deals: deals.map((d: any) => ({ ...d, id: String(d.id), expectedClose: d.expected_close })),
          },
          notifications: notifications,
          messages: messages,
          isLoading: false
        };
      });
      get().updateMetrics();
    } catch (error) {
      console.error("Gagal inisialisasi store:", error);
      set({ isLoading: false });
    }
  },

  // Finance Actions
  addTransaction: async (tx) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...tx, ai_category: tx.aiCategory }),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal tambah transaksi:", error);
    }
  },

  deleteTransaction: async (id) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal hapus transaksi:", error);
    }
  },

  addInvoice: async (inv) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/finance/invoices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...inv, due_date: inv.dueDate }),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal tambah faktur:", error);
    }
  },

  // Inventory Actions
  addProduct: async (product) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...product, 
          current_stock: product.currentStock,
          min_stock: product.minStock,
          max_stock: product.maxStock,
          unit_price: product.unitPrice,
          cost_price: product.costPrice
        }),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal tambah produk:", error);
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal hapus produk:", error);
    }
  },

  updateProduct: async (id, product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...product, 
          current_stock: product.currentStock,
          min_stock: product.minStock,
          max_stock: product.maxStock,
          unit_price: product.unitPrice,
          cost_price: product.costPrice
        }),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal update produk:", error);
    }
  },

  updateStock: (productId, newStock) => {
    set((state) => {
      const products = state.inventory.products.map((p) => 
        p.id === productId ? { ...p, currentStock: newStock } : p
      );
      
      // Recalculate total value
      const newValue = products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);

      return {
        inventory: {
          ...state.inventory,
          products,
          totalValue: newValue,
        }
      };
    });
    get().updateMetrics();
  },

  // HR Actions
  addEmployee: async (emp) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/hr/employees`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...emp, 
          performance: emp.performanceScore,
          join_date: emp.hireDate
        }),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal tambah karyawan:", error);
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hr/employees/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal hapus karyawan:", error);
    }
  },

  // CRM Actions
  addDeal: async (deal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      });
      if (response.ok) {
        await get().initializeStore();
      }
    } catch (error) {
      console.error("Gagal tambah deal:", error);
    }
  },

  updateDealStage: (id, stage) => {
    set((state) => ({
      crm: {
        ...state.crm,
        deals: state.crm.deals.map((d) => d.id === id ? { ...d, stage } : d),
      }
    }));
  },

  // System
  resetDatabase: async () => {
    const token = get().token;
    try {
      const response = await fetch(`${API_BASE_URL}/system/reset`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await get().initializeStore();
        return true;
      }
    } catch (error) {
      console.error("Gagal reset database:", error);
    }
    return false;
  },

  // TopBar
  markAllNotificationsRead: async () => {
    const token = get().token;
    if (!token) return;
    
    // Optimistic UI Update
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: 1 }))
    }));

    try {
      await fetch(`${API_BASE_URL}/notifications/read_all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to mark notifications. Refresh page.");
    }
  },

  // Global Sync
  updateMetrics: () => {
    const state = get();
    set({
      metrics: {
        ...state.metrics,
        revenue: { ...state.metrics.revenue, value: state.finance.totalRevenue },
        activeDeals: { ...state.metrics.activeDeals, value: state.crm.totalDeals },
        employeeCount: { ...state.metrics.employeeCount, value: state.hr.totalEmployees },
        inventoryValue: { ...state.metrics.inventoryValue, value: state.inventory.totalValue },
      }
    });
  },
}));
