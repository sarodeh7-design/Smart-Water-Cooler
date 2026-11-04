// ──────────────────────────────────────────────────────────────────────────────
// mockApi.js – Isolated service module
// ──────────────────────────────────────────────────────────────────────────────
// Every function returns a Promise so you can later swap these for real
// fetch() / MQTT calls to an ESP32 backend without touching component code.
// ──────────────────────────────────────────────────────────────────────────────

import { getESP32Url, FETCH_TIMEOUT_MS } from './esp32Config';

const STORAGE_KEYS = {
  STATIONS: 'ktu_stations',
  SERVICE_RECORDS: 'ktu_service_records',
  REVIEWS: 'ktu_reviews',
  THRESHOLDS: 'ktu_thresholds',
  ADMIN_PASSCODE: 'ktu_admin_passcode',
  STUDENT_SESSION: 'ktu_student_session',
};

// ─── Helpers ───
const getFromStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ─── Station API ───
export const getStations = () =>
  Promise.resolve(getFromStorage(STORAGE_KEYS.STATIONS, null));

export const saveStations = (stations) => {
  saveToStorage(STORAGE_KEYS.STATIONS, stations);
  return Promise.resolve(stations);
};

export const getStation = (id) => {
  const stations = getFromStorage(STORAGE_KEYS.STATIONS, []);
  return Promise.resolve(stations.find((s) => s.id === id) || null);
};

export const updateStation = (id, updates) => {
  const stations = getFromStorage(STORAGE_KEYS.STATIONS, []);
  const idx = stations.findIndex((s) => s.id === id);
  if (idx !== -1) {
    stations[idx] = { ...stations[idx], ...updates };
    saveToStorage(STORAGE_KEYS.STATIONS, stations);
  }
  return Promise.resolve(stations[idx] ?? null);
};

// ─── Telemetry – Simulate ESP32 sensor reading (for testing without hardware) ───
export const simulateReading = (stationId) => {
  const tds = Math.floor(Math.random() * 480) + 20; // 20–500 ppm
  const temp = parseFloat((Math.random() * 18 + 14).toFixed(1)); // 14–32 °C
  const now = new Date().toISOString();
  return updateStation(stationId, {
    currentTDS: tds,
    currentTemp: temp,
    lastSync: now,
    isOnline: true,
  });
};

// ─── Telemetry – Fetch REAL readings from ESP32 hardware ───

export const fetchFromESP32 = async (stationId) => {
  const url = getESP32Url(stationId);

  if (!url) {
    throw new Error(`No ESP32 endpoint configured for ${stationId}. Update src/services/esp32Config.js`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ESP32 responded with status ${response.status}`);
    }

    const data = await response.json();

    // Update station with real sensor values
    return updateStation(stationId, {
      currentTDS: data.currentTDS,
      currentTemp: data.currentTemp,
      lastSync: new Date().toISOString(),
      isOnline: true,
    });
  } catch (error) {
    // Mark station as offline if ESP32 is unreachable
    if (error.name === 'AbortError') {
      await updateStation(stationId, { isOnline: false });
      throw new Error(`ESP32 for ${stationId} timed out (${FETCH_TIMEOUT_MS}ms)`);
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      await updateStation(stationId, { isOnline: false });
      throw new Error(`Cannot reach ESP32 for ${stationId}. Check WiFi and IP address.`);
    }
    throw error;
  }
};

// ─── Thresholds API ───
export const getThresholds = () =>
  Promise.resolve(getFromStorage(STORAGE_KEYS.THRESHOLDS, null));

export const saveThresholds = (thresholds) => {
  saveToStorage(STORAGE_KEYS.THRESHOLDS, thresholds);
  return Promise.resolve(thresholds);
};

// ─── Service Records API ───
export const getServiceRecords = () =>
  Promise.resolve(getFromStorage(STORAGE_KEYS.SERVICE_RECORDS, []));

export const addServiceRecord = (record) => {
  const records = getFromStorage(STORAGE_KEYS.SERVICE_RECORDS, []);
  const id = `SRV-${String(records.length + 1).padStart(3, '0')}`;
  const newRecord = { ...record, id };
  records.unshift(newRecord);
  saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, records);
  return Promise.resolve(newRecord);
};

export const saveServiceRecords = (records) => {
  saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, records);
  return Promise.resolve(records);
};

// ─── Reviews API ───
export const getReviews = () =>
  Promise.resolve(getFromStorage(STORAGE_KEYS.REVIEWS, []));

export const addReview = (review) => {
  const reviews = getFromStorage(STORAGE_KEYS.REVIEWS, []);
  const id = `REV-${String(reviews.length + 1).padStart(3, '0')}`;
  const newReview = { ...review, id };
  reviews.unshift(newReview);
  saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  return Promise.resolve(newReview);
};

export const updateReviewStatus = (reviewId, status) => {
  const reviews = getFromStorage(STORAGE_KEYS.REVIEWS, []);
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx !== -1) {
    reviews[idx] = { ...reviews[idx], status };
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  }
  return Promise.resolve(reviews[idx] ?? null);
};

export const saveReviews = (reviews) => {
  saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  return Promise.resolve(reviews);
};

// ─── Auth API ───
export const verifyAdminPasscode = (passcode) => {
  const stored = getFromStorage(STORAGE_KEYS.ADMIN_PASSCODE, '2026');
  return Promise.resolve(passcode === stored);
};

export const getStudentSession = () =>
  getFromStorage(STORAGE_KEYS.STUDENT_SESSION, null);

export const saveStudentSession = (session) => {
  saveToStorage(STORAGE_KEYS.STUDENT_SESSION, session);
  return Promise.resolve(session);
};

export const clearStudentSession = () => {
  localStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
};

// ─── CSV Export ───
export const exportMaintenanceCSV = (stations, serviceRecords, filterLifespanDays = 90) => {
  const headers = [
    'Station ID',
    'Location',
    'Install Date',
    'Last Filter Change',
    'Next Due Date',
    'Current TDS (ppm)',
    'Current Temp (°C)',
    'Service Date',
    'Technician',
    'Service Type',
    'Notes',
  ];

  const rows = [];

  stations.forEach((station) => {
    const nextDue = new Date(station.lastFilterChange);
    nextDue.setDate(nextDue.getDate() + filterLifespanDays);
    const nextDueStr = nextDue.toISOString().split('T')[0];

    const stationRecords = serviceRecords.filter((r) => r.stationId === station.id);

    if (stationRecords.length === 0) {
      rows.push([
        station.id, station.location, station.installDate,
        station.lastFilterChange, nextDueStr, station.currentTDS,
        station.currentTemp, '', '', '', '',
      ]);
    } else {
      stationRecords.forEach((rec) => {
        rows.push([
          station.id, station.location, station.installDate,
          station.lastFilterChange, nextDueStr, station.currentTDS,
          station.currentTemp, rec.date, rec.technicianName,
          rec.serviceType, rec.notes,
        ]);
      });
    }
  });

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'filter_maintenance_records.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export { STORAGE_KEYS };
