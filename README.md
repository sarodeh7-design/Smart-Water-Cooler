# KTU – Water Filter Kiosk Telemetry Unit

A responsive, single-page web application for monitoring and managing IoT water filter kiosks deployed across a campus.

## Quick Start

```bash
cd ktu-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Routes

| Route | Page | Description |
|---|---|---|
| `/#/` | Public Kiosk | Default station KTU-01 |
| `/#/station/:id` | Public Kiosk | Specific station (e.g., `/#/station/KTU-02`) |
| `/#/admin` | Admin Dashboard | Passcode-protected (default: `2026`) |

## Architecture

```
src/
├── data/seedData.js          # Initial mock data (3 stations, 5 service records, 4 reviews)
├── services/mockApi.js       # ← Swap this for real ESP32 HTTP/MQTT hooks
├── contexts/AppContext.jsx   # Global state + localStorage persistence
├── components/
│   ├── StationHeader.jsx     # Name, connection pill, service dates
│   ├── SensorCards.jsx       # TDS gauge, temperature, filter health
│   ├── FeedbackModule.jsx    # Star ratings, issue tags, auth gate
│   ├── AdminPasscodeModal.jsx
│   ├── FleetSummary.jsx      # Fleet-wide KPI cards
│   ├── TelemetryControl.jsx  # Sensor table + ESP32 simulator
│   ├── MaintenanceManager.jsx# Maintenance table + service visit modal
│   ├── ThresholdDrawer.jsx   # Configurable alert sliders
│   ├── FeedbackTriageBoard.jsx
│   └── Toast.jsx
└── pages/
    ├── KioskPage.jsx         # Public-facing QR target
    └── AdminPage.jsx         # Staff dashboard
```

## Swapping for Real ESP32 Backend

Every function in `src/services/mockApi.js` returns a `Promise`, so you can replace `localStorage` calls with `fetch()` or MQTT subscriptions without touching any component code.

## Deployment

```bash
npm run build    # Output in dist/
```

Deploy the `dist/` folder to Vercel, Netlify, or GitHub Pages. HashRouter is used for maximum static-host compatibility.

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (glassmorphic dark theme)
- **Lucide React** (icons)
- **React Router 6** (HashRouter)
- **localStorage** for zero-backend persistence
