import { Router } from 'express';
import { getSatelliteIntel } from '../controllers/satellite-intel.controller.js';

export const satelliteIntelRouter = Router()
  .get('/:locationId', getSatelliteIntel);
