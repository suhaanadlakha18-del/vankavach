import { z } from 'zod';
import type {
  DispatchInput,
  DispatchResult,
  Health,
  Telemetry,
  AuditRecord
} from '../types/api';
import type {
  Hotspot,
  PhenologyPoint
} from '../types/hotspot';

const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
  }
}

function extractMessage(
  body: unknown,
  status: number,
  statusText: string
): string {
  if (
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message;
  }

  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return `HTTP ${status}: ${statusText}`;
}

function unwrapData<T>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body
  ) {
    return (body as { data: T }).data;
  }

  return body as T;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const controller = new AbortController();

  const timeout = window.setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...init,
      signal: init.signal || controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...init.headers
      }
    });

    const text = await response.text();
    let body: unknown;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      throw new ApiError(
        extractMessage(
          body,
          response.status,
          response.statusText
        ),
        response.status
      );
    }

    const payload = unwrapData<T>(body);

    return schema
      ? schema.parse(payload)
      : payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw new ApiError('Request timed out');
    }

    throw new ApiError(
      error instanceof Error
        ? error.message
        : 'Network request failed'
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

const hotspot = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  severity: z.enum([
    'critical',
    'high',
    'medium',
    'low'
  ]),
  status: z.enum([
    'new',
    'reviewing',
    'verified',
    'closed'
  ]),
  category: z.string(),
  detectedAt: z.string(),
  description: z.string(),
  notes: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  ndviChange: z.number().optional(),
  sarVhChange: z.number().optional(),
  evidence: z.array(z.string()),
  demo: z.boolean().optional()
});

export const api = {
  health: () =>
    request<Health>('/api/v1/health'),

  hotspots: () =>
    request<Hotspot[]>(
      '/api/v1/hotspots',
      {},
      z.array(hotspot)
    ),

  hotspot: (id: string) =>
    request<Hotspot>(
      `/api/v1/hotspots/${encodeURIComponent(id)}`,
      {},
      hotspot
    ),

  alerts: () =>
    request<Hotspot[]>(
      '/api/v1/alerts',
      {},
      z.array(hotspot)
    ),

  phenology: (id: string) =>
    request<PhenologyPoint[]>(
      `/api/v1/phenology/${encodeURIComponent(id)}`
    ),

  telemetry: () =>
    request<Telemetry>('/api/v1/telemetry'),

  audit: () =>
    request<AuditRecord[]>('/api/v1/audit'),

  dispatch: (data: DispatchInput) =>
    request<DispatchResult>(
      '/api/v1/dispatch',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),

  geojson: () =>
    request<GeoJSON.FeatureCollection>(
      '/api/v1/export/geojson'
    )
};
