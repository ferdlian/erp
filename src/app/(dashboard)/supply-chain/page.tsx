'use client';

import { Truck, Clock, CheckCircle, DollarSign, Star, Sparkles, ArrowRight, AlertTriangle, Lightbulb, BarChart3, Activity, MapPin, Package } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supplyChainData } from '@/lib/mock-data/supply-chain';

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

const poStatusConfig: Record<string, { badge: string; label: string }> = {
  pending: { badge: 'badge-warning', label: 'Menunggu' },
  confirmed: { badge: 'badge-info', label: 'Dikonfirmasi' },
  shipped: { badge: 'badge-info', label: 'Dikirim' },
  delivered: { badge: 'badge-success', label: 'Diterima' },
  cancelled: { badge: 'badge-danger', label: 'Dibatalkan' },
};

export default function SupplyChainPage() {
  const data = supplyChainData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Modul <span className="text-cyan-400">Rantai Pasok</span> (Supply Chain)
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manajemen logistik & pengadaan yang dioptimalkan AI</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { label: 'Total Pemasok', value: data.totalSuppliers.toString(), icon: Truck, color: '#06b6d4' },
          { label: 'Pesanan Aktif', value: data.activeOrders.toString(), icon: Package, color: '#f59e0b' },
          { label: 'Rata-rata Waktu', value: `${data.avgLeadTime} hari`, icon: Clock, color: '#8b5cf6' },
          { label: 'Tepat Waktu', value: `${data.onTimeRate}%`, icon: CheckCircle, color: '#10b981' },
          { label: 'Total Belanja', value: formatCurrency(data.totalSpend), icon: DollarSign, color: '#f43f5e' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 glow-supply">
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

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4">
        {/* Cost Optimization */}
        <div className="col-span-12 lg:col-span-7 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Biaya vs Optimalisasi AI</h2>
            <span className="badge badge-success">
              <Sparkles className="w-3 h-3 mr-1" />
              Potensi hemat ~20%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.costTrend}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v: number) => `Rp${(v / 1000000).toFixed(0)}J`} />
              <Tooltip formatter={(value) => value ? formatCurrency(Number(value)) : ''} contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cost" stroke="#f43f5e" fill="url(#costGrad)" strokeWidth={2} name="Biaya Saat Ini" />
              <Area type="monotone" dataKey="optimized" stroke="#06b6d4" fill="url(#optGrad)" strokeWidth={2} name="Optimalisasi AI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Performance */}
        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Performa Pemasok Teratas</h2>
          <div className="space-y-4">
            {data.supplierPerformance.map((sup, i) => (
              <div key={sup.name} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-4 text-right font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">{sup.name}</span>
                    <span className="text-xs font-semibold" style={{ color: sup.color }}>{sup.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sup.score}%`, background: sup.color }} />
                  </div>
                  <span className="text-[10px] text-slate-500">{sup.orders} pesanan selesai</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suppliers Table + POs + Insights */}
      <div className="grid grid-cols-12 gap-4">
        {/* Suppliers */}
        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Daftar Pemasok</h2>
            <button className="text-xs text-cyan-400 flex items-center gap-1">Lihat semua <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2">
            {data.suppliers.slice(0, 5).map((supplier) => (
              <div key={supplier.id} className="p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">{supplier.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-semibold">{supplier.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{supplier.location}</span>
                  <span>{supplier.category}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px]">
                  <span className="text-slate-400">Tempo: <span className="text-white font-semibold">{supplier.leadTime} hari</span></span>
                  <span className="text-slate-400">Tepat Waktu: <span className="text-emerald-400 font-semibold">{supplier.onTimeDelivery}%</span></span>
                  <span className="text-slate-400">Total: <span className="text-white font-semibold">{supplier.totalOrders} PO</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Pesanan Pembelian (PO)</h2>
          <div className="space-y-2">
            {data.purchaseOrders.map((po) => {
              const status = poStatusConfig[po.status];
              return (
                <div key={po.id} className="p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-500">{po.id.toUpperCase()}</span>
                    <span className={`badge ${status.badge}`}>{status.label}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 truncate">{po.supplierName}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-bold text-white">{formatCurrency(po.total)}</span>
                    <span className="text-[10px] text-slate-500">{po.items} item · ETA {po.expectedDelivery}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="col-span-12 lg:col-span-3 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Wawasan Logistik AI</h2>
          </div>
          <div className="space-y-3">
            {data.aiInsights.map((insight) => {
              const InsightIcon = insightIcons[insight.type];
              return (
                <div key={insight.id} className="p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06] transition-all cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <InsightIcon className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-0.5">{insight.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-1.5 text-[11px] font-medium text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
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
    </div>
  );
}
