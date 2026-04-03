'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, Receipt, CreditCard, Wallet, PiggyBank, Sparkles, AlertTriangle, Lightbulb, BarChart3, Activity, Plus, X, Trash2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useERPStore } from '@/lib/store';
import { Invoice } from '@/lib/types';

const insightIcons: Record<string, React.ElementType> = {
  recommendation: Lightbulb,
  alert: AlertTriangle,
  prediction: BarChart3,
  anomaly: Activity,
};

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `Rp${(num / 1000000000).toFixed(1)} Miliar`;
  if (num >= 1000000) return `Rp${(num / 1000000).toFixed(0)} Juta`;
  return `Rp${num.toLocaleString('id-ID')}`;
}

function StatCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change?: number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-card p-5 glow-finance">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="tooltip">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name === 'revenue' ? 'Pendapatan' : p.name === 'expenses' ? 'Pengeluaran' : p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export default function FinancePage() {
  const { finance, addTransaction, deleteTransaction, addInvoice } = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    description: '',
    amount: 0,
    type: 'income' as 'income' | 'expense',
    category: 'Penjualan',
    aiCategory: 'Operasional',
    account: 'Bank BCA',
    status: 'completed' as 'completed',
  });
  const [newInv, setNewInv] = useState<Omit<Invoice, 'id'>>({
    number: `INV-${Date.now().toString().slice(-6)}`,
    customer: '',
    amount: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuedDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      ...newTx,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setIsModalOpen(false);
    setNewTx({ description: '', amount: 0, type: 'income', category: 'Penjualan', aiCategory: 'Operasional', account: 'Bank BCA', status: 'completed' });
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    addInvoice(newInv);
      setIsInvoiceModalOpen(false);
      setNewInv({
        number: `INV-${Date.now().toString().slice(-6)}`,
        customer: '',
        amount: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issuedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Modul <span className="text-emerald-400">Keuangan</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manajemen & wawasan keuangan berbasis AI</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary h-9 px-4 flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Transaksi
          </button>
          <span className="badge badge-success hidden md:flex">
            <Sparkles className="w-3 h-3 mr-1" />
            Kesehatan: {finance.healthScore}/100
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Pendapatan" value={formatCurrency(finance.totalRevenue)} change={12.5} icon={Wallet} color="#10b981" />
        <StatCard label="Total Pengeluaran" value={formatCurrency(finance.totalExpenses)} change={-3.2} icon={CreditCard} color="#f43f5e" />
        <StatCard label="Laba Bersih" value={formatCurrency(finance.netProfit)} change={18.7} icon={PiggyBank} color="#8b5cf6" />
        <StatCard label="Arus Kas" value={formatCurrency(finance.cashFlow)} change={8.3} icon={DollarSign} color="#06b6d4" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Revenue Chart */}
        <div className="col-span-12 lg:col-span-8 glass-card-static p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Pendapatan vs Pengeluaran</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={finance.monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v: number) => `Rp${(v / 1000000).toFixed(0)}J`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#expGrad)" strokeWidth={2} name="expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Pendapatan per Kategori</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={finance.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                {finance.categoryBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value ? formatCurrency(Number(value)) : ''} contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {finance.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-slate-400">{cat.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions + Invoices + AI Insights */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Transaksi Terkini</h2>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {finance.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{tx.description}</p>
                  <p className="text-[10px] text-slate-500">{tx.aiCategory} · {tx.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="col-span-12 lg:col-span-3 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Faktur (Tagihan)</h2>
            <button 
              onClick={() => setIsInvoiceModalOpen(true)}
              className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {finance.invoices.map((inv) => {
              const statusColors: Record<string, string> = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger', draft: 'badge-neutral' };
              const statusLabel: Record<string, string> = { paid: 'Lunas', pending: 'Menunggu', overdue: 'Terlambat', draft: 'Draft' };
              return (
                <div key={inv.id} className="p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-slate-400">{inv.number}</span>
                    <span className={`badge ${statusColors[inv.status]}`}>{statusLabel[inv.status]}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{inv.customer}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-bold text-white">{formatCurrency(inv.amount)}</span>
                    <span className="text-[10px] text-slate-500">Jatuh Tempo {inv.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Wawasan Keuangan AI</h2>
          </div>
          <div className="space-y-3">
            {finance.aiInsights.map((insight) => {
              const InsightIcon = insightIcons[insight.type];
              return (
                <div key={insight.id} className="p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] transition-all cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <InsightIcon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-0.5">{insight.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-1.5 text-[11px] font-medium text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                          {insight.action} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-card border-emerald-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Tambah Transaksi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Deskripsi</label>
                <input 
                  required
                  type="text" 
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="Contoh: Pembayaran Lisensi Software"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Jenis</label>
                  <select 
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="income" className="bg-slate-900">Pendapatan</option>
                    <option value="expense" className="bg-slate-900">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Kategori AI</label>
                  <select 
                    value={newTx.aiCategory}
                    onChange={(e) => setNewTx({ ...newTx, aiCategory: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="Operasional" className="bg-slate-900">Operasional</option>
                    <option value="Infrastruktur" className="bg-slate-900">Infrastruktur</option>
                    <option value="Pemasaran" className="bg-slate-900">Pemasaran</option>
                    <option value="Gaji" className="bg-slate-900">Gaji</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Jumlah (Rp)</label>
                <input 
                  required
                  type="number" 
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Tambah Faktur */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
          <div className="relative glass-card border-emerald-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Buat Faktur Baru</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nomor Faktur</label>
                <input 
                  disabled
                  type="text" 
                  value={newInv.number}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm text-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nama Pelanggan / Vendor</label>
                <input 
                  required
                  type="text" 
                  value={newInv.customer}
                  onChange={(e) => setNewInv({ ...newInv, customer: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="Contoh: PT. Maju Jaya"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Jumlah (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={newInv.amount}
                    onChange={(e) => setNewInv({ ...newInv, amount: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Jatuh Tempo</label>
                  <input 
                    required
                    type="date" 
                    value={newInv.dueDate}
                    onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Buat Faktur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
