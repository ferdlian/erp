'use client';

import { useState } from 'react';
import { Users, TrendingUp, Briefcase, Clock, Award, Sparkles, ArrowRight, AlertTriangle, Lightbulb, BarChart3, Activity, Star, UserCheck, UserPlus, Trash2, X, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useERPStore } from '@/lib/store';

const insightIcons: Record<string, React.ElementType> = {
  recommendation: Lightbulb,
  alert: AlertTriangle,
  prediction: BarChart3,
  anomaly: Activity,
};

function formatSalary(num: number): string {
  if (num >= 1000000000) return `Rp${(num / 1000000000).toFixed(1)} Miliar`;
  if (num >= 1000000) return `Rp${(num / 1000000).toFixed(0)} Juta`;
  return `Rp${num.toLocaleString('id-ID')}`;
}

const stageConfig: Record<string, { color: string; label: string }> = {
  open: { color: '#64748b', label: 'Buka' },
  screening: { color: '#3b82f6', label: 'Penyaringan' },
  interview: { color: '#8b5cf6', label: 'Wawancara' },
  offer: { color: '#f59e0b', label: 'Penawaran' },
  closed: { color: '#10b981', label: 'Selesai' },
};

export default function HRPage() {
  const { hr, addEmployee, deleteEmployee } = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: 'Staff',
    department: 'Operasional',
    status: 'active' as 'active' | 'on-leave' | 'probation' | 'terminated',
    performanceScore: 85,
    hireDate: new Date().toISOString().split('T')[0],
    salary: 5000000,
    email: '',
    position: 'Staff',
    aiScore: 85,
    avatar: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee(newEmp);
    setIsModalOpen(false);
    setNewEmp({ 
      name: '', 
      role: 'Staff', 
      department: 'Operasional', 
      status: 'active', 
      performanceScore: 85, 
      hireDate: new Date().toISOString().split('T')[0], 
      salary: 5000000,
      email: '',
      position: 'Staff',
      aiScore: 85,
      avatar: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Modul <span className="text-violet-400">SDM</span> (Sumber Daya Manusia)
          </h1>
          <p className="text-sm text-slate-400 mt-1">Evaluasi kinerja & manajemen talenta berbasis AI</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Karyawan Baru
          </button>
          <span className="badge badge-info hidden md:flex">
            <UserPlus className="w-3 h-3 mr-1" />
            {hr.openPositions} Posisi Terbuka
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { label: 'Total Karyawan', value: hr.totalEmployees.toString(), icon: Users, color: '#8b5cf6' },
          { label: 'Rata-rata Performa', value: `${hr.avgPerformance}/100`, icon: Award, color: '#10b981' },
          { label: 'Posisi Terbuka', value: hr.openPositions.toString(), icon: Briefcase, color: '#f59e0b' },
          { label: 'Tingkat Turnover', value: `${hr.turnoverRate}%`, icon: TrendingUp, color: '#f43f5e' },
          { label: 'Tingkat Kehadiran', value: `${hr.attendanceRate}%`, icon: Clock, color: '#06b6d4' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 glow-hr">
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
        {/* Performance Trend */}
        <div className="col-span-12 lg:col-span-8 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Tren Performa vs Prediksi AI</h2>
            <span className="badge badge-info"><Sparkles className="w-3 h-3 mr-1" />Model ML</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hr.performanceTrend}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis domain={[65, 90]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} name="Skor Aktual" />
              <Line type="monotone" dataKey="aiPrediction" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: 'transparent', stroke: '#8b5cf6', r: 3 }} name="Prediksi AI" opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Distribusi Departemen</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={hr.departmentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} strokeWidth={0}>
                {hr.departmentDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {hr.departmentDistribution.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: dept.color }} />
                  <span className="text-slate-400">{dept.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employees + Recruitment + Insights */}
      <div className="grid grid-cols-12 gap-4">
        {/* Team Members */}
        <div className="col-span-12 lg:col-span-5 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Anggota Tim</h2>
            <button className="text-xs text-violet-400 flex items-center gap-1">Lihat semua <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {hr.employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: emp.avatar }}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-slate-200">{emp.name}</p>
                    {emp.status !== 'active' && (
                      <span className={`badge ${emp.status === 'on-leave' ? 'badge-warning' : emp.status === 'probation' ? 'badge-info' : 'badge-neutral'}`}>
                        {emp.status === 'on-leave' ? 'Cuti' : emp.status === 'probation' ? 'Masa Percobaan' : emp.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">{emp.position} · {emp.department}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">{emp.performanceScore}</div>
                    <div className="text-[10px] text-slate-500">Skor</div>
                  </div>
                  <button 
                    onClick={() => deleteEmployee(emp.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Pipeline */}
        <div className="col-span-12 lg:col-span-4 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Alur Perekrutan</h2>
          </div>
          <div className="space-y-2">
            {hr.recruitment.map((rec) => {
              const stage = stageConfig[rec.stage];
              return (
                <div key={rec.id} className="p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{rec.position}</span>
                    <span className="badge" style={{ background: `${stage.color}20`, color: stage.color }}>{stage.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{rec.department} · {rec.candidates} kandidat</p>
                  {rec.matchScore > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-violet-400" />
                        <span className="text-[11px] text-violet-300 font-medium">{rec.aiTopMatch}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-white/5 rounded-full">
                          <div className="h-full bg-violet-400 rounded-full" style={{ width: `${rec.matchScore}%` }} />
                        </div>
                        <span className="text-[10px] text-violet-400 font-semibold">{rec.matchScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="col-span-12 lg:col-span-3 glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Wawasan AI</h2>
          </div>
          <div className="space-y-2">
            {hr.aiInsights.map((insight) => {
              const InsightIcon = insightIcons[insight.type];
              return (
                <div key={insight.id} className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/[0.03] hover:bg-violet-500/[0.06] transition-all cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <InsightIcon className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-0.5">{insight.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-1.5 text-[11px] font-medium text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
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

      {/* Modal Karyawan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative glass-card border-violet-500/20 w-full max-w-md p-6 animate-in zoom-in duration-200 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Tambah Karyawan Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Jabatan</label>
                  <input 
                    required
                    type="text" 
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Departemen</label>
                  <select 
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Pemasaran">Pemasaran</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="SDM">SDM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider font-semibold">Gaji (Rp)</label>
                <input 
                  required
                  type="number" 
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({ ...newEmp, salary: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg shadow-violet-500/20 active:scale-95"
              >
                Simpan Karyawan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
