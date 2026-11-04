// ──────────────────────────────────────────────────────────────────────────────
// esp32Config.js — Map each station ID to its ESP32 hardware IP address
// ──────────────────────────────────────────────────────────────────────────────
// Update these IPs to match your actual ESP32 devices on the campus network.
// The website will fetch live readings from these endpoints.
//
// To find your ESP32's IP:
//   1. Upload the firmware and open Serial Monitor (115200 baud)
//   2. Look for: "✓ Connected!  IP: 192.168.x.x"
//   3. Enter that IP below
// ──────────────────────────────────────────────────────────────────────────────

const ESP32_ENDPOINTS = {
  'KTU-01': 'http://192.168.1.101',   // ← Change to your ESP32 #1 IP
  'KTU-02': 'http://192.168.1.102',   // ← Change to your ESP32 #2 IP
  'KTU-03': 'http://192.168.1.103',   // ← Change to your ESP32 #3 IP
};

// How often to auto-poll sensors (in milliseconds). Set to 0 to disable auto-polling.
export const POLL_INTERVAL_MS = 5000;  // 5 seconds

// Request timeout (ms) — if ESP32 doesn't respond in time, fall back to cached data
export const FETCH_TIMEOUT_MS = 3000;

/**
 * Get the API endpoint URL for a station's ESP32 hardware.
 * Returns null if no ESP32 is configured for that station.
 */
export function getESP32Url(stationId) {
  const base = ESP32_ENDPOINTS[stationId];
  return base ? `${base}/api/readings` : null;
}

/**
 * Check if any ESP32 endpoints are configured (i.e., not using default placeholder IPs).
 */
export function hasRealEndpoints() {
  return Object.values(ESP32_ENDPOINTS).some(
    (url) => !url.includes('192.168.1.101') &&
             !url.includes('192.168.1.102') &&
             !url.includes('192.168.1.103')
  );
}

export default ESP32_ENDPOINTS;
