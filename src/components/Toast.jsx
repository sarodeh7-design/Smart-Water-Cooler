import { useApp } from '../contexts/AppContext';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts } = useApp();

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      bg: 'border-emerald-500/30 bg-emerald-950/80',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      bg: 'border-rose-500/30 bg-rose-950/80',
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-400" />,
      bg: 'border-sky-500/30 bg-sky-950/80',
    },
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const c = config[toast.type] || config.success;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-2xl shadow-2xl text-white text-sm animate-slide-in ${c.bg}`}
          >
            {c.icon}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
