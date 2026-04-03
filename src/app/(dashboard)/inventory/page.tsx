'use client';

import { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, ArrowRight, MapPin, BarChart3, Activity, Sparkles, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useERPStore } from '@/lib/store';

const insightIcons: Record<string, React.ElementType> = {
  recommendation: Brain,
  alert: AlertTriangle,
  prediction: BarChart3,
  anomaly: Activity,
};

function Brain({ ...props }: any) {
  return <Sparkles {...props} />;
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `Rp${(num / 1000000000).toFixed(1)} Miliar`;
  if (num >= 1000000) return `Rp${(num / 1000000).toFixed(0)} Juta`;
  return `Rp${num.toLocaleString('id-ID')}`;
}

const statusConfig: Record<string, { badge: string; label: string }> = {
  'in-stock': { badge: 'badge-success', label: 'Tersedia' },
  'low-stock': { badge: 'badge-warning', label: 'Hampir Habis' },
  'out-of-stock': { badge: 'badge-danger', label: 'Habis' },
  'overstock': { badge: 'badge-info', label: 'Kelebihan' },
};

export default function InventoryPage() {
  const { inventory, addProduct, deleteProduct, updateProduct } = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Elektronik',
    warehouse: 'Gudang Jakarta',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    unitPrice: 0,
    costPrice: 0,
    sku: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      ...newProduct,
      status: newProduct.currentStock <= newProduct.minStock ? 'low-stock' : 'in-stock' as any,
    });
    setIsModalOpen(false);
    setNewProduct({ name: '', category: 'Elektronik', warehouse: 'Gudang Jakarta', currentStock: 0, minStock: 10, maxStock: 100, unitPrice: 0, costPrice: 0, sku: '' });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...editingProduct,
        status: editingProduct.currentStock <= editingProduct.minStock ? 'low-stock' : 'in-stock' as any,
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Modul <span className="text-amber-400">Inventaris</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Stok & prediksi permintaan berbasis AI</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9 px-3 flex items-center gap-2 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white h-9 px-4 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Produk Baru
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { label: 'Total Produk', value: inventory.totalProducts.toString(), icon: Package, color: '#f59e0b' },
          { label: 'Nilai Stok', value: formatCurrency(inventory.totalValue), icon: Activity, color: '#10b981' },
          { label: 'Stok Menipis', value: inventory.lowStockCount.toString(), icon: AlertTriangle, color: '#f43f5e' },
          { label: 'Habis Stok', value: inventory.outOfStockCount.toString(), icon: AlertTriangle, color: '#ef4444' },
          { label: 'Perputaran Stok', value: `${inventory.turnoverRate}x`, icon: TrendingUp, color: '#8b5cf6' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 glow-inventory">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart */}
      <div className="grid grid-cols-12 gap-4">
        {/* Demand Forecasting */}
        <div className="col-span-12 lg:col-span-8 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Prakiraan Permintaan Mingguan</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-amber-400" />
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Prediksi AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-slate-600" />
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Aktual</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={inventory.demandForecast}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} name="Prediksi AI" />
              <Line type="monotone" dataKey="actual" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" name="Aktual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Reorder Suggestions */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Saran Pemesanan Ulang</h2>
          </div>
          <div className="space-y-3">
            {inventory.reorderSuggestions.map((item) => (
              <div key={item.productId} className="p-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">{item.productName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.urgency === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.urgency === 'critical' ? 'KRITIS' : 'TINGGI'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{item.reason}</p>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Saran: <span className="text-white font-semibold">{item.suggestedQty} unit</span>
                  </div>
                  <button className="text-[10px] font-bold text-amber-400 hover:text-amber-300">PESAN SEKARANG</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="glass-card-static p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Daftar Inventaris</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" placeholder="Cari produk..." className="h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-amber-500/30 w-48" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Gudang</th>
                <th>Stok Saat Ini</th>
                <th>Harga Satuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {inventory.products.map((p) => {
                const status = statusConfig[p.status];
                return (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <div className="text-xs font-medium text-slate-200">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.sku}</div>
                      </div>
                    </td>
                    <td><span className="text-xs text-slate-400">{p.category}</span></td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> {p.warehouse}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-semibold text-white">{p.currentStock} unit</div>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.currentStock <= p.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((p.currentStock / p.maxStock) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs text-slate-300 font-medium">{formatCurrency(p.unitPrice)}</span></td>
                    <td><span className={`badge ${status.badge}`}>{status.label}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produk Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-card border-amber-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Tambah Produk Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nama Produk</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    placeholder="Contoh: Laptop Pro X1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Kategori</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Perabot">Perabot</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">SKU</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    placeholder="PRD-001"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Stok Awal</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.currentStock}
                    onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Harga (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseInt(e.target.value), costPrice: Math.floor(parseInt(e.target.value) * 0.7) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Produk */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative glass-card border-amber-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Edit Produk</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nama Produk</label>
                  <input 
                    required
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Stok</label>
                  <input 
                    required
                    type="number" 
                    value={editingProduct.currentStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Harga (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
