# VAN-GUARD // Satellite Forest Defense SOC

A Vercel-ready React + TypeScript + Vite frontend for an India-focused geospatial forest-monitoring operations console. The six built-in scenarios are explicitly synthetic demonstration records, not verified incidents or live satellite detections.

## Prerequisites
- Node.js 20+
- npm 10+
- A separate backend implementing the provisional API contract

## Local setup
```bash
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`. Configure `VITE_API_BASE_URL=http://localhost:3000` in `.env`. Vite variables are public browser configuration, so never place secrets or provider API keys there.

## Quality commands
```bash
npm run lint
npm test
npm run build
npm run preview
```

## Vercel deployment
1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Keep framework preset **Vite**, build command `npm run build`, and output directory `dist`.
4. Add `VITE_API_BASE_URL` in Vercel Project Settings → Environment Variables, pointing to the deployed backend HTTPS origin.
5. Ensure the backend CORS allowlist includes the Vercel production and preview origins.

`vercel.json` supplies an SPA fallback so client-side routes can resolve to `index.html`.

## API integration
Centralized in `src/services/api.ts` with timeout handling, typed interfaces, Zod validation for hotspot data, JSON/text error handling, and `VITE_API_BASE_URL`. The expected endpoints are:
- `GET /api/v1/health`, `/hotspots`, `/hotspots/:id`, `/alerts`, `/phenology/:hotspotId`, `/telemetry`, `/audit`, `/export/geojson`
- `POST /api/v1/dispatch`

No OpenAPI document or backend repository was available during generation. Types are therefore provisional and should be reconciled against the actual contract before production use.

## Demo/offline mode
If `/hotspots` cannot be loaded, the UI switches to a persistent **DEMO MODE — SYNTHETIC DATA** state. Map browsing, filtering, local workflow recording, charts, audit examples, and GeoJSON export remain usable. Dispatch in demo mode is local UI state only and does not contact a field team.

## Map and satellite limitations
The base map uses CARTO Dark Matter tiles with OpenStreetMap/CARTO attribution. Review provider usage terms before production traffic. No satellite imagery provider is configured. Provider keys belong in the backend, never the Vite bundle. The interface does not claim Sentinel or Google Earth Engine connectivity.

## CORS troubleshooting
If the browser reports a network or CORS failure, confirm the API URL is HTTPS in production, the backend responds to `OPTIONS`, permits the exact frontend origin, and allows `Content-Type`. A frontend cannot bypass server CORS policy.

## Structure
- `src/app` application shell
- `src/components` layout, map, hotspot, chart, panel, and UI modules
- `src/services` centralized API client
- `src/data` clearly labeled synthetic records
- `src/types`, `src/hooks`, `src/utils`, `src/styles`
