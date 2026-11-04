import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SlidersHorizontal, X, RotateCcw, Save } from 'lucide-react';
import { defaultThresholds } from '../data/seedData';

export default function ThresholdDrawer({ thresholds }) {
  const { updateThresholds } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [local, setLocal] = useState({ ...thresholds });

  const handleChange = (key, value) => {
    setLocal((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = () => {
    updateThresholds(local);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocal({ ...defaultThresholds });
  };

  // Collapsed button
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setLocal({ ...thresholds });
          setIsOpen(true);
        }}
        className="glass rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-sm text-slate-300 hover:text-white transition-colors mb-6 w-full sm:w-auto"
      >
        <SlidersHorizontal className="w-4 h-4 text-sky-400" />
        Configure Alert Thresholds
      </button>
    );
  }

  // Expanded drawer
  return (
    <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-sky-400" />
          Threshold Configuration
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <SliderInput
          label="Warning TDS"
          value={local.warningTDS}
          onChange={(v) => handleChange('warningTDS', v)}
          min={50}
          max={500}
          unit="ppm"
          color="amber"
        />
        <SliderInput
          label="Critical TDS"
          value={local.criticalTDS}
          onChange={(v) => handleChange('criticalTDS', v)}
          min={100}
          max={800}
          unit="ppm"
          color="rose"
        />
        <SliderInput
          label="Max Water Temperature"
          value={local.maxTemp}
          onChange={(v) => handleChange('maxTemp', v)}
          min={15}
          max={45}
          unit="°C"
          color="orange"
        />
        <SliderInput
          label="Filter Lifespan"
          value={local.filterLifespanDays}
          onChange={(v) => handleChange('filterLifespanDays', v)}
          min={30}
          max={365}
          unit="days"
          color="sky"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-colors text-sm shadow-lg shadow-sky-500/20"
      >
        <Save className="w-4 h-4" />
        Save Thresholds
      </button>
    </div>
  );
}

// ─── Slider + Number Input ───

const ACCENT = {
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  sky: 'bg-sky-500',
};

function SliderInput({ label, value, onChange, min, max, unit, color }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm text-slate-400 font-medium">{label}</label>
        <span className="text-xs text-slate-600">
          {min}–{max} {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-2 bg-slate-700 rounded-full">
          <div
            className={`absolute h-full rounded-full ${ACCENT[color] || 'bg-sky-500'}`}
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md pointer-events-none"
            style={{ left: `calc(${pct}% - 8px)` }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            className="w-16 bg-slate-800/70 border border-slate-700/50 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-sky-500/50"
          />
          <span className="text-xs text-slate-500 w-8">{unit}</span>
        </div>
      </div>
    </div>
  );
}
