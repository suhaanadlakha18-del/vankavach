import earthEngine from '@google/earthengine';

// Dynamic Google Earth Engine SDK boundary.
const ee: any = earthEngine;
import { env } from '../config/env.js';
import type {
  ProviderStatus,
  SatelliteProvider
} from './satellite-provider.interface.js';

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Observation = {
  source: 'Google Earth Engine';
  dataset: string;
  satellite: 'Sentinel-1' | 'Sentinel-2';
  acquiredAt: string | null;
  metric: string;
  value: number | null;
};

type PhenologyPoint = {
  date: string;
  ndvi: number | null;
  source: 'Sentinel-2';
};

const locations: Record<string, Location> = {
  'DEMO-OD-KJ-01': {
    id: 'DEMO-OD-KJ-01',
    name: 'Keonjhar',
    latitude: 21.6289,
    longitude: 85.5817
  },
  'DEMO-MP-SG-02': {
    id: 'DEMO-MP-SG-02',
    name: 'Singrauli',
    latitude: 24.1997,
    longitude: 82.6753
  },
  'DEMO-AS-DH-03': {
    id: 'DEMO-AS-DH-03',
    name: 'Dima Hasao',
    latitude: 25.3478,
    longitude: 93.0176
  },
  'DEMO-KA-SH-04': {
    id: 'DEMO-KA-SH-04',
    name: 'Shimoga',
    latitude: 13.9299,
    longitude: 75.5681
  },
  'DEMO-CG-BA-05': {
    id: 'DEMO-CG-BA-05',
    name: 'Bastar',
    latitude: 19.1071,
    longitude: 81.9535
  },
  'DEMO-MP-KB-06': {
    id: 'DEMO-MP-KB-06',
    name: 'Kanha buffer',
    latitude: 22.3345,
    longitude: 80.6115
  }
};

const locationAliases: Record<string, string> = {
  'keonjhar-od': 'DEMO-OD-KJ-01',
  'singrauli-mp': 'DEMO-MP-SG-02',
  'dima-hasao-as': 'DEMO-AS-DH-03',
  'shimoga-ka': 'DEMO-KA-SH-04',
  'bastar-cg': 'DEMO-CG-BA-05',
  'kanha-buffer-mp': 'DEMO-MP-KB-06'
};

function requireLocation(id: string): Location {
  const canonicalId = locationAliases[id] ?? id;
  const location = locations[canonicalId];

  if (!location) {
    throw new Error(`Unknown monitoring location: ${id}`);
  }

  return {
    ...location,
    id
  };
}

function evaluate<T>(object: { evaluate: Function }): Promise<T> {
  return new Promise((resolve, reject) => {
    object.evaluate((value: T, error: unknown) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(value);
    });
  });
}

export class EarthEngineProvider implements SatelliteProvider {
  readonly name = 'google-earth-engine';

  private initialized = false;
  private initializing?: Promise<void>;
  private lastSuccessfulFetch: string | null = null;

  private configured(): boolean {
    return Boolean(
      env.EARTH_ENGINE_PROJECT &&
      env.EARTH_ENGINE_CLIENT_EMAIL &&
      env.EARTH_ENGINE_PRIVATE_KEY
    );
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) return this.initializing;

    if (!this.configured()) {
      throw new Error(
        'Earth Engine credentials are not configured on the backend.'
      );
    }

    this.initializing = new Promise((resolve, reject) => {
      const privateKey = env.EARTH_ENGINE_PRIVATE_KEY!.replace(/\\n/g, '\n');

      const key = {
        client_email: env.EARTH_ENGINE_CLIENT_EMAIL!,
        private_key: privateKey
      };

      ee.data.authenticateViaPrivateKey(
        key,
        () => {
          ee.initialize(
            null,
            null,
            () => {
              this.initialized = true;
              resolve();
            },
            (error: unknown) => reject(error),
            undefined,
            env.EARTH_ENGINE_PROJECT
          );
        },
        (error: unknown) => reject(error)
      );
    });

    return this.initializing;
  }

  async status(): Promise<ProviderStatus> {
    if (!this.configured()) {
      return {
        configured: false,
        available: false,
        lastSuccessfulFetch: this.lastSuccessfulFetch,
        message: 'Google Earth Engine credentials are not configured.'
      };
    }

    try {
      await this.initialize();

      return {
        configured: true,
        available: true,
        lastSuccessfulFetch: this.lastSuccessfulFetch,
        message: 'Google Earth Engine authenticated.'
      };
    } catch (error) {
      return {
        configured: true,
        available: false,
        lastSuccessfulFetch: this.lastSuccessfulFetch,
        message:
          error instanceof Error
            ? error.message
            : 'Google Earth Engine authentication failed.'
      };
    }
  }

  async getObservations(locationId: string): Promise<Observation[]> {
    await this.initialize();

    const location = requireLocation(locationId);
    const point = ee.Geometry.Point([
      location.longitude,
      location.latitude
    ]);

    const region = point.buffer(1000);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate(start, end)
      .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 40))
      .sort('system:time_start', false);

    const s2Image = ee.Image(sentinel2.first());

    const ndviImage = s2Image
      .normalizedDifference(['B8', 'B4'])
      .rename('NDVI');

    const ndvi = await evaluate<Record<string, number | null>>(
      ndviImage.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: region,
        scale: 10,
        maxPixels: 1000000
      })
    );

    const s2Timestamp = await evaluate<number | null>(
      s2Image.get('system:time_start')
    );

    const sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(region)
      .filterDate(start, end)
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.listContains(
        'transmitterReceiverPolarisation',
        'VH'
      ))
      .sort('system:time_start', false);

    const s1Image = ee.Image(sentinel1.first());

    const vh = await evaluate<Record<string, number | null>>(
      s1Image.select(['VH']).reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: region,
        scale: 20,
        maxPixels: 1000000
      })
    );

    const s1Timestamp = await evaluate<number | null>(
      s1Image.get('system:time_start')
    );

    this.lastSuccessfulFetch = new Date().toISOString();

    return [
      {
        source: 'Google Earth Engine',
        dataset: 'COPERNICUS/S2_SR_HARMONIZED',
        satellite: 'Sentinel-2',
        acquiredAt:
          typeof s2Timestamp === 'number'
            ? new Date(s2Timestamp).toISOString()
            : null,
        metric: 'NDVI',
        value: ndvi.NDVI ?? null
      },
      {
        source: 'Google Earth Engine',
        dataset: 'COPERNICUS/S1_GRD',
        satellite: 'Sentinel-1',
        acquiredAt:
          typeof s1Timestamp === 'number'
            ? new Date(s1Timestamp).toISOString()
            : null,
        metric: 'VH mean dB',
        value: vh.VH ?? null
      }
    ];
  }

  async getPhenology(locationId: string): Promise<PhenologyPoint[]> {
    await this.initialize();

    const location = requireLocation(locationId);

    const region = ee.Geometry.Point([
      location.longitude,
      location.latitude
    ]).buffer(1000);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const collection = ee.ImageCollection(
      'COPERNICUS/S2_SR_HARMONIZED'
    )
      .filterBounds(region)
      .filterDate(start, end)
      .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 40))
      .sort('system:time_start', true)
      .limit(30);

    const features = collection.map((image: any) => {
      const ndvi = image
        .normalizedDifference(['B8', 'B4'])
        .rename('NDVI');

      const value = ndvi.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: region,
        scale: 10,
        maxPixels: 1000000
      }).get('NDVI');

      return ee.Feature(null, {
        date: ee.Date(image.get('system:time_start')).format('YYYY-MM-dd'),
        ndvi: value
      });
    });

    const raw = await evaluate<{
      features?: Array<{
        properties?: {
          date?: string;
          ndvi?: number | null;
        };
      }>;
    }>(ee.FeatureCollection(features));

    this.lastSuccessfulFetch = new Date().toISOString();

    return (raw.features ?? []).map(feature => ({
      date: feature.properties?.date ?? '',
      ndvi: feature.properties?.ndvi ?? null,
      source: 'Sentinel-2'
    }));
  }
}

