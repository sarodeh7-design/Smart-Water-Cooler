import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import AdminPasscodeModal from '../components/AdminPasscodeModal';
import FleetSummary from '../components/FleetSummary';
import TelemetryControl from '../components/TelemetryControl';
import MaintenanceManager from '../components/MaintenanceManager';
import ThresholdDrawer from '../components/ThresholdDrawer';
import FeedbackTriageBoard from '../components/FeedbackTriageBoard';
import { LogOut, Droplets, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const { stations, serviceRecords, reviews, thresholds, isLoading } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedStation, setSelectedStation] = useState('all');

  if (isLoading) return null;

  if (!authenticated) {
    return <AdminPasscodeModal onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15">
              <Droplets className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                KTU Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Water Filter Telemetry Management Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Kiosk View
            </Link>
            <button
              onClick={() => setAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Lock
            </button>
          </div>
        </div>

        {/* ─── Fleet Summary ─── */}
        <FleetSummary stations={stations} thresholds={thresholds} />

        {/* ─── Telemetry & Sensor Control ─── */}
        <TelemetryControl
          stations={stations}
          thresholds={thresholds}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
        />

        {/* ─── Threshold Configuration ─── */}
        <ThresholdDrawer thresholds={thresholds} />

        {/* ─── Maintenance Management ─── */}
        <MaintenanceManager
          stations={stations}
          serviceRecords={serviceRecords}
          thresholds={thresholds}
        />

        {/* ─── Feedback Triage ─── */}
        <FeedbackTriageBoard reviews={reviews} />

        {/* Footer */}
        <div className="text-center py-8 text-xs text-slate-700">
          KTU Water Filter Telemetry · Campus IoT Infrastructure
        </div>
      </div>
    </div>
  );
}
