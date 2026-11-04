import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  defaultStations,
  defaultServiceRecords,
  defaultReviews,
  defaultThresholds,
} from '../data/seedData';
import * as api from '../services/mockApi';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export function AppProvider({ children }) {
  const [stations, setStations] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [studentSession, setStudentSession] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Bootstrap from localStorage or seed ───
  useEffect(() => {
    (async () => {
      const storedStations = await api.getStations();
      const storedThresholds = await api.getThresholds();
      const storedRecords = await api.getServiceRecords();
      const storedReviews = await api.getReviews();
      const storedSession = api.getStudentSession();

      if (!storedStations) {
        await api.saveStations(defaultStations);
        setStations(defaultStations);
      } else {
        setStations(storedStations);
      }

      if (!storedThresholds) {
        await api.saveThresholds(defaultThresholds);
      } else {
        setThresholds(storedThresholds);
      }

      if (storedRecords.length === 0) {
        await api.saveServiceRecords(defaultServiceRecords);
        setServiceRecords(defaultServiceRecords);
      } else {
        setServiceRecords(storedRecords);
      }

      if (storedReviews.length === 0) {
        await api.saveReviews(defaultReviews);
        setReviews(defaultReviews);
      } else {
        setReviews(storedReviews);
      }

      if (storedSession) setStudentSession(storedSession);
      setIsLoading(false);
    })();
  }, []);

  // ─── Toast system ───
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ─── Station mutations ───
  const refreshStations = async () => {
    const all = await api.getStations();
    setStations(all ?? []);
  };

  const updateStationData = useCallback(async (id, updates) => {
    await api.updateStation(id, updates);
    await refreshStations();
  }, []);

  const simulateReading = useCallback(
    async (stationId) => {
      await api.simulateReading(stationId);
      await refreshStations();
      addToast(`Simulated ESP32 reading for ${stationId}`);
    },
    [addToast],
  );

  const fetchLiveReading = useCallback(
    async (stationId) => {
      try {
        await api.fetchFromESP32(stationId);
        await refreshStations();
        addToast(`Live reading received from ${stationId}`, 'success');
      } catch (error) {
        addToast(error.message, 'error');
        await refreshStations(); // refresh to show offline status
      }
    },
    [addToast],
  );

  const markFilterReplaced = useCallback(
    async (stationId) => {
      const today = new Date().toISOString().split('T')[0];
      await api.updateStation(stationId, { lastFilterChange: today });
      await api.addServiceRecord({
        stationId,
        date: new Date().toISOString(),
        technicianName: 'Admin',
        serviceType: 'Filter replacement',
        notes: 'Filter marked as replaced via admin dashboard.',
      });
      await refreshStations();
      const allRecords = await api.getServiceRecords();
      setServiceRecords(allRecords);
      addToast(`Filter replaced for ${stationId}`);
    },
    [addToast],
  );

  const logServiceVisit = useCallback(
    async (record) => {
      await api.addServiceRecord(record);
      const allRecords = await api.getServiceRecords();
      setServiceRecords(allRecords);
      addToast('Service visit logged successfully');
    },
    [addToast],
  );

  // ─── Thresholds ───
  const updateThresholds = useCallback(
    async (newThresholds) => {
      await api.saveThresholds(newThresholds);
      setThresholds(newThresholds);
      addToast('Thresholds updated');
    },
    [addToast],
  );

  // ─── Reviews ───
  const submitReview = useCallback(
    async (review) => {
      await api.addReview(review);
      const allReviews = await api.getReviews();
      setReviews(allReviews);
      addToast('Feedback submitted! Thank you. 💧');
    },
    [addToast],
  );

  const updateReviewStatus = useCallback(async (reviewId, status) => {
    await api.updateReviewStatus(reviewId, status);
    const allReviews = await api.getReviews();
    setReviews(allReviews);
  }, []);

  // ─── Student session ───
  const loginStudent = useCallback(async (session) => {
    await api.saveStudentSession(session);
    setStudentSession(session);
  }, []);

  // ─── CSV ───
  const exportCSV = useCallback(() => {
    api.exportMaintenanceCSV(stations, serviceRecords, thresholds.filterLifespanDays);
    addToast('CSV exported successfully');
  }, [stations, serviceRecords, thresholds, addToast]);

  const value = {
    stations,
    serviceRecords,
    reviews,
    thresholds,
    studentSession,
    toasts,
    isLoading,
    addToast,
    updateStationData,
    simulateReading,
    fetchLiveReading,
    markFilterReplaced,
    logServiceVisit,
    updateThresholds,
    submitReview,
    updateReviewStatus,
    loginStudent,
    exportCSV,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
