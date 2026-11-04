import { Thermometer, Droplets, Shield, ShieldAlert, ShieldX } from 'lucide-react';

// ─── Exported helpers (used by admin TelemetryControl & MaintenanceManager) ───

export function getTDSLevel(tds, thresholds) {
  if (tds < 150)
    return {
      label: 'Pristine',
      badgeClass: 'bg-emerald-500/20 text-emerald-400',
      barClass: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    };
  if (tds <= (thresholds?.warningTDS ?? 250))
    return {
      label: 'Acceptable',
      badgeClass: 'bg-sky-500/20 text-sky-400',
      barClass: 'bg-sky-500',
      textColor: 'text-sky-400',
    };
  if (tds <= (thresholds?.criticalTDS ?? 400))
    return {
      label: 'High Mineral',
      badgeClass: 'bg-amber-500/20 text-amber-400',
      barClass: 'bg-amber-500',
      textColor: 'text-amber-400',
    };
  return {
    label: 'Maintenance Required',
    badgeClass: 'bg-rose-500/20 text-rose-400',
    barClass: 'bg-rose-500',
    textColor: 'text-rose-400',
  };
}

export function getFilterHealth(station, thresholds) {
  const daysSince = Math.floor(
    (Date.now() - new Date(station.lastFilterChange).getTime()) / 86_400_000,
  );
  const lifespan = thresholds?.filterLifespanDays ?? 90;
  const isOverdue = daysSince > lifespan;
  const isNearDue = daysSince > lifespan - 14;
  const isCriticalTDS = station.currentTDS > (thresholds?.criticalTDS ?? 400);
  const isWarningTDS = station.currentTDS > (thresholds?.warningTDS ?? 250);

  if (isCriticalTDS || isOverdue) {
    return {
      label: 'Urgent Replacement',
      icon: <ShieldX className="w-6 h-6 text-rose-400" />,
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/5 backdrop-blur-xl',
      text: 'text-rose-400',
      description: isCriticalTDS
        ? `TDS at ${station.currentTDS} ppm exceeds critical threshold`
        : `Filter overdue by ${daysSince - lifespan} days`,
    };
  }
  if (isWarningTDS || isNearDue) {
    return {
      label: 'Maintenance Due',
      icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5 backdrop-blur-xl',
      text: 'text-amber-400',
      description: isWarningTDS
        ? `TDS at ${station.currentTDS} ppm — approaching critical`
        : `Service due in ${lifespan - daysSince} days`,
    };
  }
  return {
    label: 'Good',
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5 backdrop-blur-xl',
    text: 'text-emerald-400',
    description: `Filter healthy · ${lifespan - daysSince} days remaining`,
  };
}

// ─── Composite Card Grid ───

export default function SensorCards({ station, thresholds }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <TDSCard tds={station.currentTDS} thresholds={thresholds} />
      <TemperatureCard temp={station.currentTemp} maxTemp={thresholds.maxTemp} />
      <FilterHealthCard station={station} thresholds={thresholds} />
    </div>
  );
}

// ─── TDS Card ───

function TDSCard({ tds, thresholds }) {
  const level = getTDSLevel(tds, thresholds);
  const pct = Math.min((tds / 500) * 100, 100);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky-400" />
          <span className="text-slate-400 text-sm font-medium">TDS Level</span>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${level.badgeClass}`}>
          {level.label}
        </span>
      </div>

      <div className="text-4xl font-extrabold text-white tracking-tight">
        {tds}{' '}
        <span className="text-lg text-slate-500 font-normal tracking-normal">ppm</span>
      </div>

      {/* Gauge bar */}
      <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden mt-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${level.barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 mt-1 px-0.5">
        <span>0</span>
        <span>150</span>
        <span>{thresholds.warningTDS}</span>
        <span>{thresholds.criticalTDS}</span>
        <span>500+</span>
      </div>
    </div>
  );
}

// ─── Temperature Card ───

function TemperatureCard({ temp, maxTemp }) {
  const isHigh = temp > maxTemp;
  const isCold = temp < 15;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-400" />
          <span className="text-slate-400 text-sm font-medium">Water Temperature</span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
            isHigh
              ? 'bg-rose-500/20 text-rose-400'
              : isCold
                ? 'bg-sky-500/20 text-sky-400'
                : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {isHigh ? '⚠ Warm' : isCold ? '❄ Cold' : '✓ Ambient'}
        </span>
      </div>

      <div className="text-4xl font-extrabold text-white tracking-tight">
        {temp}{' '}
        <span className="text-lg text-slate-500 font-normal tracking-normal">°C</span>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        DS18B20 Sensor · Max threshold: {maxTemp}°C
      </p>
    </div>
  );
}

// ─── Filter Health Card ───

function FilterHealthCard({ station, thresholds }) {
  const health = getFilterHealth(station, thresholds);

  return (
    <div className={`rounded-2xl p-5 border shadow-xl ${health.border} ${health.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        {health.icon}
        <span className="text-slate-400 text-sm font-medium">Filter Health</span>
      </div>
      <div className={`text-2xl font-bold ${health.text}`}>{health.label}</div>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{health.description}</p>
    </div>
  );
}
