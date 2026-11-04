import { useParams, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import StationHeader from '../components/StationHeader';
import SensorCards from '../components/SensorCards';
import FeedbackModule from '../components/FeedbackModule';
import { Settings, Droplets } from 'lucide-react';

export default function KioskPage() {
  const { id } = useParams();
  const stationId = id || 'KTU-01';
  const { stations, thresholds, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplets className="w-10 h-10 text-sky-400 animate-pulse" />
          <span className="text-slate-400 text-sm">Loading Telemetry…</span>
        </div>
      </div>
    );
  }

  const station = stations.find((s) => s.id === stationId);

  if (!station) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center glass rounded-2xl p-10 max-w-md">
          <Droplets className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Station Not Found</h2>
          <p className="text-slate-400 mb-4">
            No kiosk with ID "<span className="text-white font-mono">{stationId}</span>" exists.
          </p>
          <Link
            to="/"
            className="inline-block text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Go to Default Station →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-6 md:py-10">
        <StationHeader station={station} thresholds={thresholds} />
        <SensorCards station={station} thresholds={thresholds} />
        <FeedbackModule stationId={stationId} />

        {/* Admin link */}
        <div className="text-center mt-10 pb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Admin Access (Staff Only)
          </Link>
        </div>
      </div>
    </div>
  );
}
