import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Wrench,
  Download,
  PlusCircle,
  X,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { getFilterHealth } from './SensorCards';

export default function MaintenanceManager({ stations, serviceRecords, thresholds }) {
  const { markFilterReplaced, logServiceVisit, exportCSV } = useApp();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceStationId, setServiceStationId] = useState(null);

  const openServiceModal = (stationId) => {
    setServiceStationId(stationId);
    setShowServiceModal(true);
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-sky-400" />
          Maintenance Management
        </h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-xl text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-700/50 text-xs uppercase tracking-wider">
              <th className="pb-3 pr-3 font-medium">Station</th>
              <th className="pb-3 pr-3 font-medium">Location</th>
              <th className="pb-3 pr-3 font-medium">Install Date</th>
              <th className="pb-3 pr-3 font-medium">Last Change</th>
              <th className="pb-3 pr-3 font-medium">Next Due</th>
              <th className="pb-3 pr-3 font-medium">TDS Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => {
              const health = getFilterHealth(station, thresholds);
              const nextDue = new Date(station.lastFilterChange);
              nextDue.setDate(nextDue.getDate() + thresholds.filterLifespanDays);
              const isOverdue = nextDue < new Date();

              return (
                <tr
                  key={station.id}
                  className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pr-3 font-semibold text-white">{station.id}</td>
                  <td className="py-3.5 pr-3 text-slate-400 text-xs max-w-[160px] truncate">
                    {station.location}
                  </td>
                  <td className="py-3.5 pr-3 text-slate-300 text-xs">
                    {fmtDate(station.installDate)}
                  </td>
                  <td className="py-3.5 pr-3 text-slate-300 text-xs">
                    {fmtDate(station.lastFilterChange)}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {fmtDate(nextDue)}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        health.text === 'text-emerald-400'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : health.text === 'text-amber-400'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {health.label}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => markFilterReplaced(station.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-lg text-xs font-semibold transition-colors"
                        title="Mark Filter Replaced"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Replace
                      </button>
                      <button
                        onClick={() => openServiceModal(station.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 rounded-lg text-xs font-semibold transition-colors"
                        title="Log Service Visit"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Log Service
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Service History */}
      <div className="mt-6 pt-5 border-t border-slate-700/40">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Service History</h3>
        {serviceRecords.length === 0 ? (
          <p className="text-slate-600 text-sm">No service records yet.</p>
        ) : (
          <div className="space-y-2.5">
            {serviceRecords.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-white font-semibold">{rec.stationId}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sky-400 font-medium">{rec.serviceType}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {rec.technicianName} ·{' '}
                    {new Date(rec.date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {rec.notes && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{rec.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Service Visit Modal ─── */}
      {showServiceModal && (
        <ServiceVisitModal
          stationId={serviceStationId}
          onClose={() => setShowServiceModal(false)}
          onSubmit={logServiceVisit}
        />
      )}
    </div>
  );
}

// ─── Date formatter ───
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

// ─── Service Visit Modal Component ───
function ServiceVisitModal({ stationId, onClose, onSubmit }) {
  const [techName, setTechName] = useState('');
  const [serviceType, setServiceType] = useState('General inspection');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!techName.trim()) return;
    onSubmit({
      stationId,
      date: new Date().toISOString(),
      technicianName: techName.trim(),
      serviceType,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Log Service Visit — <span className="text-sky-400">{stationId}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Technician Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="e.g., Rajesh Kumar"
              className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 cursor-pointer"
            >
              <option>Sediment change</option>
              <option>Carbon block change</option>
              <option>Membrane flush</option>
              <option>General inspection</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the service performed…"
              rows={3}
              className="w-full bg-slate-800/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!techName.trim()}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            Log Visit
          </button>
        </div>
      </div>
    </div>
  );
}
