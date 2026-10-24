# VAN-GUARD Backend

A TypeScript/Express/SQLite educational API for exploring possible forest-cover change across six Indian demonstration regions. All seeded locations, observations, classifications, and phenology series are explicitly synthetic demonstrations. They are not verified incidents and no live satellite provider is contacted in demo mode.

## Prerequisites
- Node.js 22.5 or newer (uses the maintained built-in `node:sqlite` API)
- npm

## Setup
```bash
cp .env.example .env
npm install
npm run db:init
npm run db:seed
npm run dev
```
Default base URL: `http://localhost:3000/api/v1`.

For a frontend on another laptop, set `HOST=0.0.0.0` and put its exact origin in `CORS_ORIGIN`, for example `http://192.168.1.20:5173`. Multiple approved origins can be comma-separated. Keep firewall exposure limited to the trusted network. Production CORS is never wildcarded.

## Commands
- `npm run dev` starts the TS development server.
- `npm run db:init` creates tables and indexes idempotently.
- `npm run db:seed` inserts the fixed demonstration records without duplication.
- `npm test` runs isolated in-memory API/provider tests.
- `npm run typecheck` checks strict TypeScript.
- `npm run build` writes JavaScript to `dist/`.
- `npm start` runs the compiled server.

## Endpoints
- `GET /health`
- `GET /locations?severity=critical&state=Odisha&limit=50&offset=0`
- `GET /locations/:id`
- `GET /summary`
- `GET /phenology/:locationId`
- `GET /observations/:locationId?limit=50&offset=0`

Examples:
```bash
curl http://localhost:3000/api/v1/health
curl "http://localhost:3000/api/v1/locations?severity=critical"
curl http://localhost:3000/api/v1/summary
curl http://localhost:3000/api/v1/phenology/kanha-buffer-mp
curl http://localhost:3000/api/v1/observations/dima-hasao-as
```

See `openapi.yaml` for the contract. Collections use `{ data, meta }`; single resources use `{ data }`; errors use `{ error: { code, message } }`. SQL NULL values are returned as JSON `null`, never as zero.

## Provider architecture
`SatelliteProvider` separates future acquisition from API delivery. `DemoSatelliteProvider` only reports local synthetic data availability. `EarthEngineProvider` is disabled and honestly unavailable by default. A real integration requires an authorized Google Cloud project, Earth Engine access, server-side credentials, collection selection, cloud masking, comparable dates, Sentinel-1 orbit/polarization/terrain processing, provenance, freshness tracking, retries, and observation persistence. Never place credentials in frontend JavaScript. NDVI decline alone is not proof of illegal deforestation.

## Security and deployment
The prototype includes Helmet, restricted CORS, Zod validation, parameterized SQL, 32 KB JSON limits, rate limiting, timeouts, pagination caps, and centralized errors. It has no authentication. Before production use, add operator identity, authorization, TLS termination, managed secrets, structured redacted logging, database backups, monitoring, and an external provider validation pipeline.

## Troubleshooting
- `ERR_UNKNOWN_BUILTIN_MODULE node:sqlite`: upgrade to Node 22.5+.
- Browser CORS failure: match `CORS_ORIGIN` exactly to the frontend origin and restart.
- Empty database: run `npm run db:seed`; seeding is safe to repeat.
- Earth Engine unavailable: expected until server-side project access and credentials are configured.
