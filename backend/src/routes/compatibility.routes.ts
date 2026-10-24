import { Router } from 'express';
import {
  createDispatch,
  exportGeoJson,
  getAudit,
  getCompatiblePhenology,
  getHotspot,
  getTelemetry,
  listAlerts,
  listHotspots
} from '../controllers/compatibility.controller.js';

export const hotspotsRouter = Router()
  .get('/', listHotspots)
  .get('/:id', getHotspot);

export const alertsRouter = Router()
  .get('/', listAlerts);

export const telemetryRouter = Router()
  .get('/', getTelemetry);

export const auditRouter = Router()
  .get('/', getAudit);

export const dispatchRouter = Router()
  .post('/', createDispatch);

export const exportRouter = Router()
  .get('/geojson', exportGeoJson);

export const compatiblePhenologyRouter = Router()
  .get('/:hotspotId', getCompatiblePhenology);
