/*
 * ══════════════════════════════════════════════════════════════════════
 *  KTU Water Filter Kiosk – ESP32 Firmware
 * ══════════════════════════════════════════════════════════════════════
 *  Hardware:
 *    - ESP32 Dev Board
 *    - DS18B20 Temperature Sensor  → GPIO 4 (with 4.7kΩ pull-up to 3.3V)
 *    - Analog TDS Sensor           → GPIO 34 (ADC1_CH6)
 *
 *  What this does:
 *    1. Connects to campus WiFi
 *    2. Reads DS18B20 temperature every 2 seconds
 *    3. Reads TDS sensor analog value and converts to ppm
 *    4. Serves a JSON API at http://<ESP32_IP>/api/readings
 *    5. Adds CORS headers so the website can fetch directly
 *
 *  Libraries needed (install via Arduino Library Manager):
 *    - OneWire by Jim Studt
 *    - DallasTemperature by Miles Burton
 *    - ArduinoJson by Benoit Blanchon (v6 or v7)
 *    - WiFi (built-in with ESP32 board package)
 *    - WebServer (built-in with ESP32 board package)
 *
 *  Board: "ESP32 Dev Module" in Arduino IDE
 * ══════════════════════════════════════════════════════════════════════
 */

#include <WiFi.h>
#include <WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// ─── CONFIGURATION — CHANGE THESE ───────────────────────────────────

// WiFi credentials
const char* WIFI_SSID     = "YOUR_CAMPUS_WIFI_SSID";
const char* WIFI_PASSWORD  = "YOUR_WIFI_PASSWORD";

// Station identity (must match the ID in the website)
const char* STATION_ID     = "KTU-01";

// Sensor pins
#define DS18B20_PIN   4     // GPIO 4 — DS18B20 data pin (needs 4.7kΩ pull-up to 3.3V)
#define TDS_PIN       34    // GPIO 34 — TDS sensor analog output (ADC1_CH6)

// TDS calibration
#define VREF          3.3   // ESP32 ADC reference voltage
#define ADC_RESOLUTION 4096.0  // 12-bit ADC
#define TDS_FACTOR    0.5   // Calibration factor (adjust based on your sensor)

// Reading interval
#define READ_INTERVAL_MS  2000  // Read sensors every 2 seconds

// ─── GLOBALS ────────────────────────────────────────────────────────

OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);
WebServer server(80);

float currentTemp = 0.0;
int   currentTDS  = 0;
unsigned long lastReadTime = 0;

// ─── TDS CALCULATION ────────────────────────────────────────────────

int readTDS(float temperature) {
  // Take multiple readings and average for stability
  int samples = 10;
  long total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(TDS_PIN);
    delay(10);
  }
  float avgReading = total / (float)samples;

  // Convert analog reading to voltage
  float voltage = avgReading * VREF / ADC_RESOLUTION;

  // Temperature compensation (TDS sensors are temp-sensitive)
  float compensationCoeff = 1.0 + 0.02 * (temperature - 25.0);
  float compensatedVoltage = voltage / compensationCoeff;

  // Convert voltage to TDS (ppm)
  // Formula for typical analog TDS sensor module
  float tds = (133.42 * compensatedVoltage * compensatedVoltage * compensatedVoltage
             - 255.86 * compensatedVoltage * compensatedVoltage
             + 857.39 * compensatedVoltage) * TDS_FACTOR;

  return max(0, (int)round(tds));
}

// ─── SENSOR READING ─────────────────────────────────────────────────

void readSensors() {
  unsigned long now = millis();
  if (now - lastReadTime < READ_INTERVAL_MS) return;
  lastReadTime = now;

  // Read DS18B20 temperature
  tempSensor.requestTemperatures();
  float temp = tempSensor.getTempCByIndex(0);

  // DS18B20 returns -127 on error
  if (temp != DEVICE_DISCONNECTED_C && temp > -50 && temp < 80) {
    currentTemp = temp;
  }

  // Read TDS sensor
  currentTDS = readTDS(currentTemp);

  // Debug output
  Serial.printf("[%lu] Temp: %.1f°C  |  TDS: %d ppm\n", now / 1000, currentTemp, currentTDS);
}

// ─── HTTP ENDPOINTS ─────────────────────────────────────────────────

void handleCORS() {
  // Allow the website (running on any origin) to fetch from the ESP32
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleReadings() {
  handleCORS();

  // Build JSON response
  StaticJsonDocument<256> doc;
  doc["stationId"]   = STATION_ID;
  doc["currentTDS"]  = currentTDS;
  doc["currentTemp"] = round(currentTemp * 10.0) / 10.0;  // 1 decimal place
  doc["isOnline"]    = true;
  doc["lastSync"]    = millis() / 1000;  // uptime in seconds
  doc["firmware"]    = "1.0.0";

  String json;
  serializeJson(doc, json);

  server.send(200, "application/json", json);
}

void handleOptions() {
  handleCORS();
  server.send(204);
}

void handleRoot() {
  handleCORS();
  String html = "<html><head><title>KTU " + String(STATION_ID) + "</title></head>";
  html += "<body style='font-family:sans-serif;padding:20px;background:#0f172a;color:#e2e8f0'>";
  html += "<h1>KTU Kiosk Telemetry Unit</h1>";
  html += "<p>Station: <b>" + String(STATION_ID) + "</b></p>";
  html += "<p>Temperature: <b>" + String(currentTemp, 1) + " &deg;C</b></p>";
  html += "<p>TDS: <b>" + String(currentTDS) + " ppm</b></p>";
  html += "<p>API Endpoint: <a href='/api/readings'>/api/readings</a></p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ─── SETUP ──────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══ KTU Kiosk Telemetry Unit ═══");
  Serial.printf("Station: %s\n", STATION_ID);

  // Initialize DS18B20
  tempSensor.begin();
  int sensorCount = tempSensor.getDeviceCount();
  Serial.printf("DS18B20 sensors found: %d\n", sensorCount);

  // Initialize TDS pin
  pinMode(TDS_PIN, INPUT);

  // Connect to WiFi
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  WiFi.setHostname(STATION_ID);  // mDNS-friendly hostname

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✓ Connected!  IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n✗ WiFi connection failed! Restarting...");
    ESP.restart();
  }

  // Setup HTTP routes
  server.on("/",              HTTP_GET,     handleRoot);
  server.on("/api/readings",  HTTP_GET,     handleReadings);
  server.on("/api/readings",  HTTP_OPTIONS, handleOptions);  // CORS preflight

  server.begin();
  Serial.println("✓ HTTP server started on port 80");
  Serial.printf("  → http://%s/api/readings\n", WiFi.localIP().toString().c_str());

  // Take initial reading
  readSensors();
}

// ─── LOOP ───────────────────────────────────────────────────────────

void loop() {
  server.handleClient();
  readSensors();
}
