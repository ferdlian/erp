'use client';

import { Search, Bell, MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  onToggleChat: () => void;
}

export default function TopBar({ onToggleChat }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'w-96' : 'w-72'}`}>
        <Search className="absolute left-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Cari apa saja... (⌘K)"
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 focus:bg-white/8 transition-all"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* AI Brain Button */}
        <button
          onClick={onToggleChat}
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Otak AI</span>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all">
          <Bell className="w-4 h-4" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
            5
          </div>
        </button>

        {/* Messages */}
        <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all">
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-white/5 transition-all ml-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-medium text-slate-200">Admin</span>
            <span className="text-[10px] text-slate-500">Super Admin</span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
