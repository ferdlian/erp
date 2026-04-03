'use client';

import { Search, Bell, MessageSquare, ChevronDown, Sparkles, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useERPStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import CommandPalette from './CommandPalette';
import NotificationMenu from './NotificationMenu';
import MessageMenu from './MessageMenu';

interface TopBarProps {
  onToggleChat: () => void;
}

export default function TopBar({ onToggleChat }: TopBarProps) {
  // Global States
  const { user, logout, notifications, messages } = useERPStore();
  const router = useRouter();

  // Local UI States
  const unreadNotifCount = notifications.filter(n => n.is_read === 0).length;
  const unreadMsgCount = messages.filter(m => m.is_unread === 1).length;
  
  // Modals & Popovers States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Refs for click outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Handle Cmd+K & Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
      if (messageRef.current && !messageRef.current.contains(target)) setIsMessageOpen(false);
    }

    function handleGlobalKeys(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleGlobalKeys);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleGlobalKeys);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
        
        {/* Search Bar (Triggers Cmd+K Palette) */}
        <div className="relative flex items-center transition-all duration-300 w-72 hover:w-80 cursor-text" onClick={() => setIsCommandOpen(true)}>
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <div className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-sm text-slate-400 hover:bg-white/8 transition-all">
            <span>Cari apa saja...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 whitespace-nowrap">
              <span className="text-[10px]">⌘K</span>
            </kbd>
          </div>
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
          <div className="relative flex" ref={notifRef}>
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMessageOpen(false); setDropdownOpen(false); }}
              className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${isNotifOpen ? 'bg-white/10 border-white/10 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8'}`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadNotifCount}
                </div>
              )}
            </button>
            {isNotifOpen && <NotificationMenu />}
          </div>

          {/* Messages */}
          <div className="relative flex" ref={messageRef}>
            <button 
              onClick={() => { setIsMessageOpen(!isMessageOpen); setIsNotifOpen(false); setDropdownOpen(false); }}
              className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${isMessageOpen ? 'bg-white/10 border-white/10 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8'}`}
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMsgCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-bg-primary"></div>
              )}
            </button>
            {isMessageOpen && <MessageMenu />}
          </div>

          {/* Profile */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button 
              onClick={() => { setDropdownOpen(!dropdownOpen); setIsMessageOpen(false); setIsNotifOpen(false); }}
              className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase cursor-pointer">
                {user?.username?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:flex flex-col items-start cursor-pointer">
                <span className="text-xs font-medium text-slate-200 capitalize">{user?.username || 'Guest'}</span>
                <span className="text-[10px] text-slate-500">{user?.role || 'Viewer'}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-500 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-secondary border border-white/10 shadow-2xl overflow-hidden py-1 z-50">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-sm font-semibold text-white capitalize">{user?.username || 'Guest'}</p>
                  <p className="text-xs text-slate-400">{user?.role || 'Viewer'}</p>
                </div>
                
                <button 
                  onClick={() => { setDropdownOpen(false); alert('Fitur profil sedang dalam pengembangan.'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left mt-1"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Profil Saya
                </button>
                
                <button 
                  onClick={() => { setDropdownOpen(false); alert('Menu pengaturan sistem menyusul pada update minor berikutnya.'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Pengaturan ERP
                </button>
                
                <div className="h-px bg-white/5 my-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Kredensial
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />
    </>
  );
}
