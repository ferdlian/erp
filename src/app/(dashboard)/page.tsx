'use client';

import {
  DollarSign, Package, Users, Handshake, Truck, Brain,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb,
  BarChart3, Activity, ArrowRight, Sparkles, Clock, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useERPStore } from '@/lib/store';

const moduleIcons: Record<string, React.ElementType> = {
  finance: DollarSign,
  inventory: Package,
  hr: Users,
  crm: Handshake,
  'supply-chain': Truck,
  dashboard: Brain,
};

const moduleColors: Record<string, string> = {
  finance: '#10b981',
  inventory: '#f59e0b',
  hr: '#8b5cf6',
  crm: '#f43f5e',
  'supply-chain': '#06b6d4',
  dashboard: '#6366f1',
};

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

function TrendBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-400' : isNeutral ? 'text-slate-400' : 'text-rose-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  );
}

function HealthScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { metrics, globalInsights, activity, moduleHealthScores } = useERPStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Pusat Komando AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kecerdasan bisnis waktu nyata di semua modul
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Langsung — Baru saja diperbarui
        </div>
      </div>

      {/* Top Section: Health Score + KPIs */}
      <div className="grid grid-cols-12 gap-4 stagger-children">
        {/* Overall Health */}
        <div className="col-span-12 lg:col-span-3 glass-card p-6 glow-ai flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Kesehatan Perusahaan</span>
          </div>
          <HealthScoreRing score={metrics.overallHealth} />
          <div className="mt-3 flex items-center gap-1">
            <TrendBadge value={3.2} />
            <span className="text-xs text-slate-500">vs bulan lalu</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Pendapatan', value: formatCurrency(metrics.revenue.value), change: metrics.revenue.change, icon: DollarSign, color: '#10b981' },
            { label: 'Kesepakatan Aktif', value: metrics.activeDeals.value.toString(), change: metrics.activeDeals.change, icon: Handshake, color: '#f43f5e' },
            { label: 'Karyawan', value: metrics.employeeCount.value.toString(), change: metrics.employeeCount.change, icon: Users, color: '#8b5cf6' },
            { label: 'Nilai Inventaris', value: formatCurrency(metrics.inventoryValue.value), change: metrics.inventoryValue.change, icon: Package, color: '#f59e0b' },
            { label: 'Kepuasan Pelanggan', value: `${metrics.customerSatisfaction.value}%`, change: metrics.customerSatisfaction.change, icon: Zap, color: '#06b6d4' },
            { label: 'Pesanan Terbuka (PO)', value: metrics.openOrders.value.toString(), change: metrics.openOrders.change, icon: Truck, color: '#6366f1' },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="glass-card p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <TrendBadge value={kpi.change} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {kpi.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Health Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Status Modul</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 stagger-children">
          {moduleHealthScores.map((mod: any) => {
            const Icon = moduleIcons[mod.module];
            const color = moduleColors[mod.module];
            const href = mod.module === 'dashboard' ? '/' : `/${mod.module}`;
            return (
              <Link key={mod.module} href={href} className={`glass-card p-4 glow-${mod.module === 'supply-chain' ? 'supply' : mod.module}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className={`text-xs font-semibold ${mod.trend === 'up' ? 'text-emerald-400' : mod.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {mod.trend === 'up' ? '↑' : mod.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {mod.score}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{mod.label}</div>
                {mod.issues > 0 && (
                  <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {mod.issues} masalah
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Insights + Activity */}
      <div className="grid grid-cols-12 gap-4">
        {/* AI Insights Feed */}
        <div className="col-span-12 lg:col-span-7 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Wawasan AI</h2>
            </div>
            <span className="badge badge-info">
              <Sparkles className="w-3 h-3 mr-1" />
              {globalInsights.length} baru
            </span>
          </div>

          <div className="space-y-3">
            {globalInsights.map((insight: any) => {
              const InsightIcon = insightIcons[insight.type];
              const color = moduleColors[insight.module] || '#6366f1';
              return (
                <div
                  key={insight.id}
                  className="p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                      <InsightIcon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{insight.title}</span>
                        <span className={`badge ${insight.impact === 'high' ? 'badge-danger' : insight.impact === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                          {insight.impact === 'high' ? 'Tinggi' : insight.impact === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
                      {insight.actionable && insight.action && (
                        <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all" style={{ color }}>
                          {insight.action}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                      {Math.round(insight.confidence * 100)}% conf.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Aktivitas Terkini</h2>
            </div>
          </div>

          <div className="space-y-1">
            {activity.map((activity: any) => {
              const color = moduleColors[activity.module];
              const Icon = moduleIcons[activity.module];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300">{activity.action}</p>
                    <p className="text-[11px] text-slate-500 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
