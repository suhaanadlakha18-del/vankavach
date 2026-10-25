import type { RequestHandler } from 'express';
import { EarthEngineProvider } from '../providers/earth-engine.provider.js';

type Observation = {
  source?: string;
  dataset?: string;
  satellite?: string;
  acquiredAt?: string | null;
  metric?: string;
  value?: number | null;
};

const provider = new EarthEngineProvider();

export const getSatelliteIntel: RequestHandler = async (
  req,
  res
) => {
  const rawLocationId = req.params.locationId;

  const locationId = Array.isArray(rawLocationId)
    ? rawLocationId[0]
    : rawLocationId;

  if (!locationId) {
    res.status(400).json({
      error: 'INVALID_LOCATION_ID',
      message: 'A location ID is required.'
    });
    return;
  }

  const providerStatus = await provider.status();

  if (!providerStatus.configured) {
    res.status(503).json({
      error: 'PROVIDER_NOT_CONFIGURED',
      message: providerStatus.message,
      provider: providerStatus
    });
    return;
  }

  if (!providerStatus.available) {
    res.status(503).json({
      error: 'PROVIDER_UNAVAILABLE',
      message: providerStatus.message,
      provider: providerStatus
    });
    return;
  }

  try {
    const observations =
      await provider.getObservations(locationId) as Observation[];

    const sentinel1 =
      observations.find(
        item => item.satellite === 'Sentinel-1'
      ) ?? null;

    const sentinel2 =
      observations.find(
        item => item.satellite === 'Sentinel-2'
      ) ?? null;

    res.json({
      data: {
        locationId,
        provider: 'Google Earth Engine',
        refreshedAt: new Date().toISOString(),
        sentinel1,
        sentinel2,
        observations
      }
    });
  } catch (error) {
    res.status(502).json({
      error: 'EARTH_ENGINE_REQUEST_FAILED',
      message:
        error instanceof Error
          ? error.message
          : 'Earth Engine request failed.',
      provider: await provider.status()
    });
  }
};
