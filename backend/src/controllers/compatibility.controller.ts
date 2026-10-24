import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { LocationRepository } from '../repositories/location.repository.js';
import { PhenologyService } from '../services/phenology.service.js';
import { env } from '../config/env.js';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ReviewStatus = 'new' | 'reviewing' | 'verified' | 'closed';

type Hotspot = {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  severity: Severity;
  status: ReviewStatus;
  category: string;
  detectedAt: string;
  description: string;
  notes: string;
  confidence?: number;
  ndviChange?: number;
  sarVhChange?: number;
  evidence: string[];
  demo: boolean;
};

const locations = new LocationRepository();
const phenology = new PhenologyService();

const dispatchSchema = z.object({
  hotspotId: z.string().min(1),
  type: z.string().min(1),
  priority: z.string().min(1),
  team: z.string().min(1),
  notes: z.string().default('')
});

function text(
  row: Record<string, unknown>,
  keys: string[],
  fallback: string
): string {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function numberValue(
  row: Record<string, unknown>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim() &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return undefined;
}

function mapSeverity(value: unknown): Severity {
  const normalized = String(value ?? '').toLowerCase();

  if (
    normalized.includes('critical') ||
    normalized.includes('severe')
  ) {
    return 'critical';
  }

  if (
    normalized.includes('high') ||
    normalized.includes('major')
  ) {
    return 'high';
  }

  if (
    normalized.includes('medium') ||
    normalized.includes('moderate')
  ) {
    return 'medium';
  }

  return 'low';
}

function mapStatus(value: unknown): ReviewStatus {
  const normalized = String(value ?? '').toLowerCase();

  if (normalized.includes('closed')) return 'closed';
  if (normalized.includes('verified')) return 'verified';

  if (
    normalized.includes('review') ||
    normalized.includes('investigat')
  ) {
    return 'reviewing';
  }

  return 'new';
}

function toHotspot(input: unknown): Hotspot | null {
  if (!input || typeof input !== 'object') return null;

  const row = input as Record<string, unknown>;

  const id = text(
    row,
    ['id', 'location_id', 'locationId'],
    ''
  );

  const lat = numberValue(
    row,
    ['lat', 'latitude', 'center_latitude']
  );

  const lng = numberValue(
    row,
    ['lng', 'lon', 'longitude', 'center_longitude']
  );

  if (!id || lat === undefined || lng === undefined) {
    return null;
  }

  const dataMode = env.DATA_MODE;
  const providerMode = dataMode === 'provider';

  const evidence: string[] = [];

  const ndviChange = numberValue(
    row,
    ['ndvi_change', 'ndviChange']
  );

  const sarVhChange = numberValue(
    row,
    ['sar_vh_change', 'sarVhChange', 'vh_change']
  );

  if (ndviChange !== undefined) {
    evidence.push(
      providerMode
        ? 'Sentinel-2 NDVI indicator'
        : 'Stored demonstration NDVI indicator'
    );
  }

  if (sarVhChange !== undefined) {
    evidence.push(
      providerMode
        ? 'Sentinel-1 VH indicator'
        : 'Stored demonstration SAR indicator'
    );
  }

  return {
    id,
    name: text(
      row,
      ['name', 'location_name', 'title'],
      id
    ),
    state: text(
      row,
      ['state', 'region', 'administrative_area'],
      'India'
    ),
    lat,
    lng,
    severity: mapSeverity(row.severity),
    status: mapStatus(
      row.status ?? row.review_status
    ),
    category: text(
      row,
      ['category', 'change_type', 'detection_category'],
      'Forest-cover change review'
    ),
    detectedAt: text(
      row,
      [
        'detected_at',
        'detectedAt',
        'observation_date',
        'updated_at',
        'created_at'
      ],
      new Date().toISOString()
    ),
    description: text(
      row,
      ['description', 'summary', 'change_description'],
      'Monitoring record requiring review.'
    ),
    notes: text(
      row,
      ['notes', 'review_notes'],
      providerMode
        ? 'Provider-backed monitoring record. Independent review is still required.'
        : 'Synthetic demonstration record. Not a verified incident.'
    ),
    ndviChange,
    sarVhChange,
    evidence,
    demo: !providerMode
  };
}

function allHotspots(): Hotspot[] {
  const rows = locations.all() as unknown[];

  return rows
    .map(toHotspot)
    .filter((item): item is Hotspot => item !== null);
}

export const listHotspots: RequestHandler = (_req, res) => {
  res.json({ data: allHotspots() });
};

export const getHotspot: RequestHandler = (req, res) => {
  const hotspot = allHotspots().find(
    item => item.id === req.params.id
  );

  if (!hotspot) {
    res.status(404).json({
      error: 'HOTSPOT_NOT_FOUND',
      message: 'The requested hotspot was not found.'
    });
    return;
  }

  res.json({ data: hotspot });
};

export const listAlerts: RequestHandler = (_req, res) => {
  const alerts = allHotspots().filter(
    item =>
      item.status !== 'closed' &&
      (item.severity === 'critical' ||
        item.severity === 'high')
  );

  res.json({ data: alerts });
};

export const getTelemetry: RequestHandler = (_req, res) => {
  res.json({
    data: {
      backendStatus: 'online',
      apiLatencyMs: null,
      lastRefresh: new Date().toISOString(),
      providerState:
        env.DATA_MODE === 'provider'
          ? 'provider mode configured'
          : 'demo mode',
      latestEvent: null,
      demo: env.DATA_MODE !== 'provider'
    }
  });
};

export const getAudit: RequestHandler = (_req, res) => {
  // No persistent audit subsystem currently exists.
  res.json({ data: [] });
};

export const createDispatch: RequestHandler = (req, res) => {
  const parsed = dispatchSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'INVALID_DISPATCH',
      message: 'Dispatch fields are invalid.',
      details: parsed.error.flatten()
    });
    return;
  }

  const hotspotExists = allHotspots().some(
    item => item.id === parsed.data.hotspotId
  );

  if (!hotspotExists) {
    res.status(404).json({
      error: 'HOTSPOT_NOT_FOUND',
      message: 'The selected hotspot was not found.'
    });
    return;
  }

  res.status(201).json({
    data: {
      id: `dispatch-${randomUUID()}`,
      status:
        env.DATA_MODE === 'provider'
          ? 'recorded'
          : 'demo-recorded',
      message:
        env.DATA_MODE === 'provider'
          ? 'Dispatch workflow recorded. No external field-team contact is implied.'
          : 'Demo dispatch recorded locally. No field team was contacted.'
    }
  });
};

export const exportGeoJson: RequestHandler = (_req, res) => {
  const hotspots = allHotspots();

  res.type('application/geo+json').json({
    type: 'FeatureCollection',
    features: hotspots.map(hotspot => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [hotspot.lng, hotspot.lat]
      },
      properties: {
        id: hotspot.id,
        name: hotspot.name,
        state: hotspot.state,
        severity: hotspot.severity,
        status: hotspot.status,
        category: hotspot.category,
        detectedAt: hotspot.detectedAt,
        description: hotspot.description,
        notes: hotspot.notes,
        evidence: hotspot.evidence,
        demo: hotspot.demo
      }
    }))
  });
};

export const getCompatiblePhenology: RequestHandler = (
  req,
  res
) => {
  try {
    const rawHotspotId = req.params.hotspotId;

    const hotspotId = Array.isArray(rawHotspotId)
      ? rawHotspotId[0]
      : rawHotspotId;

    if (!hotspotId) {
      res.status(400).json({
        error: 'INVALID_HOTSPOT_ID',
        message: 'A hotspot ID is required.'
      });
      return;
    }

    const rows = phenology.list(hotspotId) as unknown[];

    const data = rows
      .map(row => {
        if (!row || typeof row !== 'object') return null;

        const value = row as Record<string, unknown>;

        const date = text(
          value,
          ['date', 'observation_date', 'acquired_at'],
          ''
        );

        const ndvi = numberValue(
          value,
          ['ndvi', 'value', 'ndvi_value']
        );

        if (!date || ndvi === undefined) return null;

        return {
          date: date.slice(0, 10),
          ndvi,
          anomaly: Boolean(value.anomaly),
          demo: env.DATA_MODE !== 'provider'
        };
      })
      .filter(
        (
          item
        ): item is {
          date: string;
          ndvi: number;
          anomaly: boolean;
          demo: boolean;
        } => item !== null
      );

    res.json({ data });
  } catch (error) {
    res.status(404).json({
      error: 'PHENOLOGY_NOT_FOUND',
      message:
        error instanceof Error
          ? error.message
          : 'Phenology data was not found.'
    });
  }
};
