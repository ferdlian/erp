import { Search, X, Command, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODUL_ROUTES = [
  { id: 'dashboard', name: 'Dashboard Global', path: '/', category: 'Utama' },
  { id: 'finance', name: 'Manajemen Keuangan', path: '/finance', category: 'Modul' },
  { id: 'inventory', name: 'Inventaris & Stok', path: '/inventory', category: 'Modul' },
  { id: 'hr', name: 'Sumber Daya Manusia', path: '/hr', category: 'Modul' },
  { id: 'sales', name: 'CRM & Penjualan', path: '/sales', category: 'Modul' },
  { id: 'supply', name: 'Rantai Pasok (SCM)', path: '/supply-chain', category: 'Modul' },
  { id: 'workflow', name: 'Otomatisasi Alur Kerja', path: '/workflows', category: 'Sistem' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredRoutes = MODUL_ROUTES.filter((route) =>
    route.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredRoutes[selectedIndex];
        if (selected) {
          router.push(selected.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredRoutes, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 sm:pt-40">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 transform rounded-2xl bg-bg-secondary/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden transition-all flex flex-col">
        {/* Input Area */}
        <div className="relative flex items-center border-b border-white/10 px-4">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent px-4 py-4 text-base text-white placeholder-slate-400 focus:outline-none"
            placeholder="Ketik untuk mencari modul, riwayat, atau tugas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Command className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300">Tidak ada hasil ditemukan untuk "{query}"</p>
              <p className="text-sm text-slate-500 mt-1">Coba kata kunci lain seperti "Inventaris" atau "Pajak"</p>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider px-2">Modul Aplikasi</div>
              <div className="space-y-1">
                {filteredRoutes.map((route, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={route.id}
                      onClick={() => {
                        router.push(route.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 shadow-inner border border-indigo-500/30' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>
                          <Command className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                          {route.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{route.category}</span>
                        {isSelected && <ArrowRight className="w-4 h-4 text-indigo-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
