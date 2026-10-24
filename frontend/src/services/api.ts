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
  'https://van-guard-org-backend.onrender.com'
).replace(/\/+$/, '');

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
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;

    if (typeof record.message === 'string') {
      return record.message;
    }

    if (typeof record.error === 'string') {
      return record.error;
    }

    if (
      record.error &&
      typeof record.error === 'object'
    ) {
      const nested = record.error as Record<string, unknown>;

      if (typeof nested.message === 'string') {
        return nested.message;
      }

      if (typeof nested.code === 'string') {
        return nested.code;
      }
    }
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return `HTTP ${status}: ${statusText}`;
}

function unwrapData(body: unknown): unknown {
  let current = body;

  // Safely unwrap nested API envelopes such as { data: [...] }.
  for (let depth = 0; depth < 3; depth += 1) {
    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      'data' in current
    ) {
      current = (current as { data: unknown }).data;
      continue;
    }

    break;
  }

  return current;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const controller = new AbortController();

  const timeout = window.setTimeout(
    () => controller.abort(),
    15000
  );

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...init,
      signal: init.signal || controller.signal,
      cache: 'no-store',
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

    const payload = unwrapData(body);

    return schema
      ? schema.parse(payload)
      : payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      const first = error.issues[0];

      throw new ApiError(
        `Invalid API response: ${first?.message ?? 'schema validation failed'}`
      );
    }

    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw new ApiError('Backend request timed out');
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

const hotspotSchema = z.object({
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
      z.array(hotspotSchema)
    ),

  hotspot: (id: string) =>
    request<Hotspot>(
      `/api/v1/hotspots/${encodeURIComponent(id)}`,
      {},
      hotspotSchema
    ),

  alerts: () =>
    request<Hotspot[]>(
      '/api/v1/alerts',
      {},
      z.array(hotspotSchema)
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
