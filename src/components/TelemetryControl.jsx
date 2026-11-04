import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Cpu, RefreshCw, Wifi, WifiOff, Clock, Radio } from 'lucide-react';
import { getTDSLevel } from './SensorCards';
import { getESP32Url, POLL_INTERVAL_MS } from '../services/esp32Config';

export default function TelemetryControl({ stations, thresholds, selectedStation, onSelectStation }) {
  const { simulateReading, fetchLiveReading } = useApp();
  const [simulating, setSimulating] = useState(null);
  const [fetching, setFetching] = useState(null);
  const [autoPolling, setAutoPolling] = useState(false);
  const intervalRef = useRef(null);

  const handleSimulate = async (stationId) => {
    setSimulating(stationId);
    await simulateReading(stationId);
    setTimeout(() => setSimulating(null), 600);
  };

  const handleFetchLive = async (stationId) => {
    setFetching(stationId);
    await fetchLiveReading(stationId);
    setTimeout(() => setFetching(null), 600);
  };

  // Auto-polling: fetch from all stations periodically
  useEffect(() => {
    if (autoPolling && POLL_INTERVAL_MS > 0) {
      intervalRef.current = setInterval(() => {
        stations.forEach((s) => {
          if (getESP32Url(s.id)) {
            fetchLiveReading(s.id);
          }
        });
      }, POLL_INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPolling, stations, fetchLiveReading]);

  const filtered =
    selectedStation === 'all'
      ? stations
      : stations.filter((s) => s.id === selectedStation);

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          Telemetry &amp; Sensor Data
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPolling(!autoPolling)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              autoPolling
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoPolling ? 'animate-pulse' : ''}`} />
            {autoPolling ? 'Auto-Poll ON' : 'Auto-Poll OFF'}
          </button>
        <select
          value={selectedStation}
          onChange={(e) => onSelectStation(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="all">All Stations</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} – {s.location}
            </option>
          ))}
        </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-700/50 text-xs uppercase tracking-wider">
              <th className="pb-3 pr-4 font-medium">Station</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">TDS (ppm)</th>
              <th className="pb-3 pr-4 font-medium">Temp (°C)</th>
              <th className="pb-3 pr-4 font-medium">Last Sync</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((station) => {
              const tdsLevel = getTDSLevel(station.currentTDS, thresholds);
              return (
                <tr
                  key={station.id}
                  className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white">{station.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{station.location}</div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        station.isOnline
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {station.isOnline ? (
                        <Wifi className="w-3 h-3" />
                      ) : (
                        <WifiOff className="w-3 h-3" />
                      )}
                      {station.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`font-mono font-bold text-base ${tdsLevel.textColor}`}>
                      {station.currentTDS}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`font-mono font-bold text-base ${
                        station.currentTemp > thresholds.maxTemp
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {station.currentTemp}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3 h-3 shrink-0" />
                      {new Date(station.lastSync).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleFetchLive(station.id)}
                        disabled={fetching === station.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        title="Fetch real sensor data from ESP32 hardware"
                      >
                        <Radio
                          className={`w-3.5 h-3.5 ${
                            fetching === station.id ? 'animate-pulse' : ''
                          }`}
                        />
                        Fetch Live
                      </button>
                      <button
                        onClick={() => handleSimulate(station.id)}
                        disabled={simulating === station.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        title="Inject random test values (no hardware needed)"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            simulating === station.id ? 'animate-spin' : ''
                          }`}
                        />
                        Simulate
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
