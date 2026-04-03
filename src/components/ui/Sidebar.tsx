'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, DollarSign, Package, Users, Handshake,
  Truck, Brain, ChevronLeft, ChevronRight, Sparkles, Share2, LogOut, User
} from 'lucide-react';
import { useERPStore } from '@/lib/store';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dasbor', icon: LayoutDashboard, color: '#6366f1', roles: ['ADMIN', 'FINANCE', 'INVENTORY', 'HR', 'SALES', 'MANAGER'] },
  { href: '/finance', label: 'Keuangan', icon: DollarSign, color: '#10b981', roles: ['ADMIN', 'FINANCE', 'MANAGER'] },
  { href: '/inventory', label: 'Inventaris', icon: Package, color: '#f59e0b', roles: ['ADMIN', 'INVENTORY', 'MANAGER'] },
  { href: '/hr', label: 'SDM', icon: Users, color: '#8b5cf6', roles: ['ADMIN', 'HR', 'MANAGER'] },
  { href: '/crm', label: 'Penjualan', icon: Handshake, color: '#f43f5e', roles: ['ADMIN', 'SALES', 'MANAGER'] },
  { href: '/supply-chain', label: 'Rantai Pasok', icon: Truck, color: '#06b6d4', roles: ['ADMIN', 'MANAGER'] },
  { href: '/workflows', label: 'Otomatisasi', icon: Share2, color: '#ec4899', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { resetDatabase, user, logout } = useERPStore();

  const filteredNavItems = navItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <aside
      className={`sidebar fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading text-sm font-bold text-white tracking-tight">
              NexusERP
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Berbasis AI</span>
          </div>
        )}
      </div>

      {/* User Session */}
      <div className="px-3 pt-4 mb-2">
        <div className={`p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3 ${collapsed ? 'justify-center overflow-hidden' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white truncate">{user?.full_name || 'Memuat...'}</span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">{user?.role || 'Guest'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2 block">
            Modul Utama
          </span>
        )}
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              style={isActive ? { background: `${item.color}15`, color: item.color } : {}}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className="w-[18px] h-[18px] flex-shrink-0"
                style={isActive ? { color: item.color } : {}}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse-glow"
                  style={{ background: item.color }}
                />
              )}
            </Link>
          );
        })}
        
        <div className="pt-4 border-t border-white/5 mt-4">
          <button
            onClick={logout}
            className={`sidebar-item text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 w-full ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Keluar' : undefined}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </nav>

      {/* AI Assistant Quick Access */}
      {!collapsed && user?.role === 'ADMIN' && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">Otak AI</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Hanya Admin yang dapat melakukan reset database mendalam.
          </p>
          <button 
            onClick={async () => {
              if (confirm('Kosongkan seluruh database? Tindakan ini tidak dapat dibatalkan.')) {
                await resetDatabase();
                alert('Database berhasil dikosongkan.');
              }
            }}
            className="w-full py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold transition-all border border-rose-500/30"
          >
            Reset Data Sistem
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
