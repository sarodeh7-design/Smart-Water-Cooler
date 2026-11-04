import { ShieldCheck, ShieldAlert, ShieldX, Droplets } from 'lucide-react';

export default function FleetSummary({ stations, thresholds }) {
  const activeCount = stations.filter((s) => s.isOnline).length;
  const avgTDS = Math.round(
    stations.reduce((sum, s) => sum + s.currentTDS, 0) / (stations.length || 1),
  );
  const serviceNeeded = stations.filter((s) => {
    const days = Math.floor(
      (Date.now() - new Date(s.lastFilterChange).getTime()) / 86_400_000,
    );
    return s.currentTDS > thresholds.warningTDS || days > thresholds.filterLifespanDays - 14;
  }).length;
  const criticalCount = stations.filter(
    (s) => s.currentTDS > thresholds.criticalTDS,
  ).length;

  const cards = [
    {
      label: 'Filters Active',
      value: `${activeCount} / ${stations.length}`,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
    },
    {
      label: 'Needing Service',
      value: serviceNeeded,
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
    },
    {
      label: 'Critical Alerts',
      value: criticalCount,
      icon: <ShieldX className="w-5 h-5" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
    },
    {
      label: 'Avg Campus TDS',
      value: `${avgTDS} ppm`,
      icon: <Droplets className="w-5 h-5" />,
      color: 'text-sky-400',
      bg: 'bg-sky-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-xl p-4">
          <div className={`inline-flex p-2.5 rounded-lg ${card.bg} ${card.color} mb-3`}>
            {card.icon}
          </div>
          <div className="text-2xl font-bold text-white">{card.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
