import { Bell, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useERPStore } from '@/lib/store';

export default function NotificationMenu() {
  const { notifications, markAllNotificationsRead } = useERPStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <TrendingUp className="w-5 h-5 text-indigo-500" />;
    }
  };

  const hasUnread = notifications.some(n => n.is_read === 0);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-bg-secondary border border-white/10 shadow-2xl overflow-hidden py-1 z-50">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
        {hasUnread && (
          <button onClick={() => markAllNotificationsRead()} className="text-xs text-indigo-400 hover:text-indigo-300">
            Tandai Dibaca
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center flex flex-col items-center">
            <Bell className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Tidak ada notifikasi baru.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => (
              <div key={notif.id} className={`px-4 py-3 transition-colors cursor-pointer flex gap-3 ${notif.is_read === 0 ? 'bg-indigo-500/[0.02] hover:bg-white/5' : 'hover:bg-white/5 opacity-75'}`}>
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <p className={`text-sm ${notif.is_read === 0 ? 'font-medium text-slate-200' : 'text-slate-400'}`}>{notif.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{notif.time_label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="border-t border-white/5 p-2">
          <button className="w-full py-1.5 text-xs text-center text-slate-400 hover:text-white transition-colors">
            Lihat Semua Notifikasi
          </button>
        </div>
      )}
    </div>
  );
}
