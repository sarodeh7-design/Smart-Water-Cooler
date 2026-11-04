import { Droplets, WifiOff, Clock, Calendar } from 'lucide-react';

export default function StationHeader({ station, thresholds }) {
  const daysUntil = getDaysUntilService(station, thresholds);
  const lastServiceStr = new Date(station.lastFilterChange).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const nextDueStr = getNextDueDate(station, thresholds);

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      {/* Title Row */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 p-3 rounded-xl bg-sky-500/20">
            <Droplets className="w-7 h-7 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight truncate">
              {station.name}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {station.id} · {station.location}
            </p>
          </div>
        </div>

        {/* Connection pill */}
        <div
          className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium ${
            station.isOnline
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          {station.isOnline ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Offline
            </>
          )}
        </div>
      </div>

      {/* Service dates */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            Last Serviced:{' '}
            <span className="text-white font-medium">{lastServiceStr}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Next Due:{' '}
            <span
              className={`font-semibold ${
                daysUntil <= 0
                  ? 'text-rose-400'
                  : daysUntil <= 14
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {nextDueStr} ({daysUntil <= 0 ? 'Overdue!' : `${daysUntil} days`})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───
function getDaysUntilService(station, thresholds) {
  const next = new Date(station.lastFilterChange);
  next.setDate(next.getDate() + (thresholds?.filterLifespanDays || 90));
  return Math.ceil((next - new Date()) / 86_400_000);
}

function getNextDueDate(station, thresholds) {
  const next = new Date(station.lastFilterChange);
  next.setDate(next.getDate() + (thresholds?.filterLifespanDays || 90));
  return next.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
