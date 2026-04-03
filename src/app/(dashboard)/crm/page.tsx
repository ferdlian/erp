'use client';

import { useState } from 'react';
import { Handshake, TrendingUp, DollarSign, Target, BarChart3, Sparkles, ArrowRight, AlertTriangle, Lightbulb, Activity, Users, ArrowUpRight, ArrowDownRight, Plus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useERPStore } from '@/lib/store';

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

const stageColors: Record<string, string> = {
  'lead': '#64748b',
  'qualified': '#3b82f6',
  'proposal': '#8b5cf6',
  'negotiation': '#f59e0b',
  'closed-won': '#10b981',
  'closed-lost': '#ef4444',
};

const stageLabels: Record<string, string> = {
  'lead': 'Prospek',
  'qualified': 'Kualifikasi',
  'proposal': 'Proposal',
  'negotiation': 'Negosiasi',
  'closed-won': 'Berhasil',
  'closed-lost': 'Gagal',
};

export default function CRMPage() {
  const { crm, addDeal } = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    customer: '',
    company: '',
    value: 0,
    stage: 'lead' as any,
    probability: 50,
    expected_close: new Date().toISOString().split('T')[0],
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addDeal({
      ...newDeal,
      expectedClose: newDeal.expected_close,
      aiProbability: newDeal.probability,
    } as any);
    setIsModalOpen(false);
    setNewDeal({ customer: '', company: '', value: 0, stage: 'lead', probability: 50, expected_close: new Date().toISOString().split('T')[0] });
  };

  // Group deals by stage for pipeline
  const stages = ['lead', 'qualified', 'proposal', 'negotiation'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Modul <span className="text-rose-400">Penjualan</span> (CRM)
          </h1>
          <p className="text-sm text-slate-400 mt-1">Alur penjualan & intelijen pelanggan berbasis AI</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white h-9 px-4 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Deal Baru
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { label: 'Total Kesepakatan', value: crm.totalDeals.toString(), icon: Handshake, color: '#f43f5e' },
          { label: 'Nilai Pipeline', value: formatCurrency(crm.pipelineValue), icon: DollarSign, color: '#10b981' },
          { label: 'Berhasil Bulan Ini', value: crm.wonThisMonth.toString(), icon: Target, color: '#8b5cf6' },
          { label: 'Tingkat Konversi', value: `${crm.conversionRate}%`, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Rata-rata Nilai', value: formatCurrency(crm.avgDealSize), icon: BarChart3, color: '#06b6d4' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 glow-crm">
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

      {/* Sales Trend Chart */}
      <div className="glass-card-static p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Tren Penjualan</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={crm.salesTrend}>
            <defs>
              <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(v: number) => `Rp${(v / 1000000).toFixed(0)}J`} />
            <Tooltip formatter={(value) => value ? formatCurrency(Number(value)) : ''} contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="pipeline" stroke="#6366f1" fill="url(#pipeGrad)" strokeWidth={2} name="Pipeline" />
            <Area type="monotone" dataKey="won" stroke="#10b981" fill="url(#wonGrad)" strokeWidth={2} name="Berhasil" />
            <Area type="monotone" dataKey="lost" stroke="#ef4444" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Gagal" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Papan Pipeline Penjualan</h2>
          <div className="flex items-center gap-3">
            {stages.map((stage) => (
              <div key={stage} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: stageColors[stage] }} />
                {stageLabels[stage]}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {stages.map((stage) => {
            const stageDeals = crm.deals.filter(d => d.stage === stage);
            const stageColor = stageColors[stage];
            return (
              <div key={stage} className="pipeline-stage">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: stageColor }}>
                    {stageLabels[stage]}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="pipeline-card">
                      <p className="text-xs font-semibold text-white mb-1 truncate">{deal.customer}</p>
                      <p className="text-[10px] text-slate-500 truncate">{deal.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold" style={{ color: stageColor }}>{formatCurrency(deal.value)}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-semibold text-slate-400">Prob: {deal.probability}%</span>
                        </div>
                      </div>
                      <div className="mt-1.5 w-full h-1 bg-white/5 rounded-full">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${deal.probability}%`, background: stageColor }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contacts + AI Insights */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Kontak Utama</h2>
            <button className="text-xs text-rose-400 flex items-center gap-1">Lihat semua <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kontak</th>
                  <th>Perusahaan</th>
                  <th>Segmen</th>
                  <th>Nilai Lifetime</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {crm.contacts.map((contact) => {
                  const segColors: Record<string, string> = { enterprise: '#8b5cf6', 'mid-market': '#3b82f6', smb: '#10b981', startup: '#f59e0b' };
                  return (
                    <tr key={contact.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 text-[10px] font-bold">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-200">{contact.name}</p>
                            <p className="text-[10px] text-slate-500">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-xs text-slate-300">{contact.company}</span></td>
                      <td>
                        <span className="badge" style={{ background: `${segColors[contact.segment]}20`, color: segColors[contact.segment] }}>
                          {contact.segment}
                        </span>
                      </td>
                      <td><span className="text-xs text-slate-300 font-medium">{formatCurrency(contact.lifetimeValue)}</span></td>
                      <td>
                        <span className={`badge ${contact.status === 'active' ? 'badge-success' : contact.status === 'prospect' ? 'badge-info' : 'badge-neutral'}`}>
                          {contact.status === 'active' ? 'Aktif' : contact.status === 'prospect' ? 'Prospek' : contact.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Wawasan Penjualan AI</h2>
          </div>
          <div className="space-y-3">
            {crm.aiInsights.map((insight) => {
              const InsightIcon = insightIcons[insight.type];
              return (
                <div key={insight.id} className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.03] hover:bg-rose-500/[0.06] transition-all cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <InsightIcon className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-0.5">{insight.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-1.5 text-[11px] font-medium text-rose-400 flex items-center gap-1 group-hover:gap-2 transition-all">
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

      {/* Modal Deal Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-card border-rose-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Tambah Deal Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nama Pelanggan</label>
                <input 
                  required
                  type="text" 
                  value={newDeal.customer}
                  onChange={(e) => setNewDeal({ ...newDeal, customer: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Perusahaan</label>
                <input 
                  required
                  type="text" 
                  value={newDeal.company}
                  onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nilai (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Probabilitas (%)</label>
                  <input 
                    required
                    type="number" 
                    value={newDeal.probability}
                    min="0" max="100"
                    onChange={(e) => setNewDeal({ ...newDeal, probability: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-medium"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Simpan Deal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
