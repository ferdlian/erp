import { MessageSquare, Check, CheckCheck } from 'lucide-react';
import { useERPStore } from '@/lib/store';

export default function MessageMenu() {
  const { messages } = useERPStore();
  const unreadCount = messages.filter(m => m.is_unread === 1).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-bg-secondary border border-white/10 shadow-2xl overflow-hidden py-1 z-50">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          Kotak Masuk
          {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">{unreadCount} Baru</span>}
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="px-4 py-8 text-center flex flex-col items-center">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Tidak ada pesan masuk.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((msg) => (
              <div key={msg.id} className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${msg.is_unread === 1 ? 'bg-indigo-500/[0.02]' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex flex-shrink-0 items-center justify-center text-white text-sm font-bold border border-white/10">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${msg.is_unread === 1 ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>{msg.sender}</p>
                    <p className="text-[10px] text-slate-500">{msg.time_label}</p>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${msg.is_unread === 1 ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.message_content}
                  </p>
                </div>
                <div className="flex flex-col justify-end">
                  {msg.is_unread === 1 ? <Check className="w-3.5 h-3.5 text-slate-600" /> : <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {messages.length > 0 && (
        <div className="border-t border-white/5 p-2">
          <button className="w-full py-1.5 text-xs text-center text-slate-400 hover:text-white transition-colors">
            Buka Semua Pesan
          </button>
        </div>
      )}
    </div>
  );
}
