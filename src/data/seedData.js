// ─── Default Alert Thresholds ───
export const defaultThresholds = {
  warningTDS: 250,
  criticalTDS: 400,
  maxTemp: 28,
  filterLifespanDays: 90,
};

// ─── Station Definitions ───
// KTU-01: Healthy   |  KTU-02: Service Due  |  KTU-03: Critical
export const defaultStations = [
  {
    id: 'KTU-01',
    name: 'Main Academic Block – Ground Floor Filter 01',
    location: 'Academic Block A, Ground Floor',
    installDate: '2026-03-15',
    lastFilterChange: '2026-09-20',
    currentTDS: 85,
    currentTemp: 21.4,
    isOnline: true,
    lastSync: '2026-11-03T19:15:00+05:30',
  },
  {
    id: 'KTU-02',
    name: 'Library Wing – 1st Floor Filter 01',
    location: 'Central Library, 1st Floor',
    installDate: '2026-02-10',
    lastFilterChange: '2026-07-25',
    currentTDS: 270,
    currentTemp: 23.8,
    isOnline: true,
    lastSync: '2026-11-03T19:10:00+05:30',
  },
  {
    id: 'KTU-03',
    name: 'Engineering Workshop – Basement Filter 01',
    location: 'Workshop Building, Basement Level',
    installDate: '2026-01-05',
    lastFilterChange: '2026-05-10',
    currentTDS: 420,
    currentTemp: 29.2,
    isOnline: false,
    lastSync: '2026-11-03T16:42:00+05:30',
  },
];

// ─── Service Visit Records (5) ───
export const defaultServiceRecords = [
  {
    id: 'SRV-001',
    stationId: 'KTU-01',
    date: '2026-09-20T10:30:00+05:30',
    technicianName: 'Rajesh Kumar',
    serviceType: 'Carbon block change',
    notes: 'Replaced carbon block filter. TDS readings normalized to 80 ppm post-replacement.',
  },
  {
    id: 'SRV-002',
    stationId: 'KTU-01',
    date: '2026-06-15T14:00:00+05:30',
    technicianName: 'Anita Desai',
    serviceType: 'General inspection',
    notes: 'Routine quarterly inspection. All sensors calibrated. No issues found.',
  },
  {
    id: 'SRV-003',
    stationId: 'KTU-02',
    date: '2026-07-25T09:00:00+05:30',
    technicianName: 'Rajesh Kumar',
    serviceType: 'Sediment change',
    notes: 'Sediment pre-filter replaced. Slight improvement in TDS. Membrane flush recommended in 2 weeks.',
  },
  {
    id: 'SRV-004',
    stationId: 'KTU-02',
    date: '2026-08-10T11:00:00+05:30',
    technicianName: 'Vikram Singh',
    serviceType: 'Membrane flush',
    notes: 'RO membrane flushed. TDS dropped from 310 to 260 ppm. Monitor over next week.',
  },
  {
    id: 'SRV-005',
    stationId: 'KTU-03',
    date: '2026-05-10T16:00:00+05:30',
    technicianName: 'Anita Desai',
    serviceType: 'Carbon block change',
    notes: 'Full filter replacement done. Noted high ambient temperature in basement. Recommended ventilation improvement.',
  },
];

// ─── Student Reviews (4) ───
export const defaultReviews = [
  {
    id: 'REV-001',
    stationId: 'KTU-01',
    studentName: 'Aditya Sharma',
    studentPRN: '22CS1045',
    date: '2026-10-28T14:30:00+05:30',
    tasteRating: 4,
    clarityRating: 5,
    temperatureRating: 4,
    tags: ['Slow Flow'],
    comment: 'Water quality is excellent but flow rate could be better. Takes too long to fill a bottle.',
    status: 'New',
  },
  {
    id: 'REV-002',
    stationId: 'KTU-01',
    studentName: 'Priya Patel',
    studentPRN: '23ME2078',
    date: '2026-10-30T11:15:00+05:30',
    tasteRating: 5,
    clarityRating: 5,
    temperatureRating: 5,
    tags: [],
    comment: 'Best water filter on campus! Always clean and cool.',
    status: 'Resolved',
  },
  {
    id: 'REV-003',
    stationId: 'KTU-02',
    studentName: 'Rohan Gupta',
    studentPRN: '24EC3012',
    date: '2026-11-01T09:45:00+05:30',
    tasteRating: 2,
    clarityRating: 3,
    temperatureRating: 3,
    tags: ['Off Taste', 'Warm Water'],
    comment: 'Water has a slightly metallic taste lately. Needs maintenance soon.',
    status: 'In Progress',
  },
  {
    id: 'REV-004',
    stationId: 'KTU-03',
    studentName: 'Sneha Reddy',
    studentPRN: '22IT1089',
    date: '2026-11-02T16:20:00+05:30',
    tasteRating: 1,
    clarityRating: 2,
    temperatureRating: 1,
    tags: ['Off Taste', 'Warm Water', 'Physical Leak'],
    comment: 'Water is warm and tastes bad. Also noticed a small leak at the base. Please fix ASAP!',
    status: 'New',
  },
];

export const defaultAdminPasscode = '2026';
