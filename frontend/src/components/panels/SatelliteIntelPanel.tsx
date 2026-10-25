import { useCallback, useEffect, useState } from 'react'
import type { Hotspot } from '../../types/hotspot'
import { request } from '../../services/api'
import { Button } from '../ui/Button'

type SatelliteObservation = {
  source?: string
  dataset?: string
  satellite?: string
  acquiredAt?: string | null
  metric?: string
  value?: number | null
}

type SatelliteIntel = {
  locationId: string
  provider: string
  refreshedAt: string
  sentinel1: SatelliteObservation | null
  sentinel2: SatelliteObservation | null
  observations: SatelliteObservation[]
}

function Field({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="border border-line p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-sm ${
          active ? 'text-signal' : 'text-slate-200'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export function SatelliteIntelPanel({
  item,
  offline,
}: {
  item?: Hotspot
  offline: boolean
}) {
  const [intel, setIntel] = useState<SatelliteIntel>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!item || offline) return

    setLoading(true)
    setError('')

    try {
      const result = await request<SatelliteIntel>(
        `/api/v1/satellite-intel/${encodeURIComponent(item.id)}`,
      )

      setIntel(result)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Satellite request failed',
      )
    } finally {
      setLoading(false)
    }
  }, [item, offline])

  useEffect(() => {
    void refresh()

    const interval = window.setInterval(
      () => void refresh(),
      15 * 60 * 1000,
    )

    return () => window.clearInterval(interval)
  }, [refresh])

  if (!item) {
    return (
      <p className="p-5 text-sm text-slate-400">
        Select a hotspot to request satellite intelligence.
      </p>
    )
  }

  const s1 = intel?.sentinel1
  const s2 = intel?.sentinel2

  return (
    <div className="grid gap-3 p-5 md:grid-cols-2">
      <Field
        label="Sentinel-1 SAR"
        value={
          s1
            ? `${s1.metric ?? 'VH'}: ${
                s1.value ?? 'No numeric result'
              }`
            : loading
              ? 'Querying Earth Engine…'
              : 'No Sentinel-1 result returned'
        }
        active={Boolean(s1)}
      />

      <Field
        label="Sentinel-2 Optical"
        value={
          s2
            ? `${s2.metric ?? 'NDVI'}: ${
                s2.value ?? 'No numeric result'
              }`
            : loading
              ? 'Querying Earth Engine…'
              : 'No Sentinel-2 result returned'
        }
        active={Boolean(s2)}
      />

      <Field
        label="Sentinel-1 Dataset"
        value={s1?.dataset ?? 'Not returned'}
      />

      <Field
        label="Sentinel-2 Dataset"
        value={s2?.dataset ?? 'Not returned'}
      />

      <Field
        label="Sentinel-1 Acquisition"
        value={
          s1?.acquiredAt
            ? new Date(s1.acquiredAt).toLocaleString()
            : 'Not returned'
        }
      />

      <Field
        label="Sentinel-2 Acquisition"
        value={
          s2?.acquiredAt
            ? new Date(s2.acquiredAt).toLocaleString()
            : 'Not returned'
        }
      />

      <Field
        label="Provider"
        value={intel?.provider ?? 'Google Earth Engine'}
        active={Boolean(intel)}
      />

      <Field
        label="Last Query"
        value={
          intel?.refreshedAt
            ? new Date(intel.refreshedAt).toLocaleString()
            : 'Not queried'
        }
      />

      <div className="md:col-span-2 flex items-center gap-3">
        <Button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || offline}
        >
          {loading ? 'Querying…' : 'Refresh satellite data'}
        </Button>

        <span className="text-xs text-slate-400">
          Automatic refresh: every 15 minutes while this page is open
        </span>
      </div>

      {error && (
        <div className="md:col-span-2 border border-danger p-3 text-xs text-danger">
          Earth Engine request failed: {error}
        </div>
      )}

      <p className="md:col-span-2 text-xs leading-5 text-slate-400">
        Values and acquisition timestamps shown here are returned
        by the backend Earth Engine request. Refresh frequency does
        not determine satellite revisit or cloud-free availability.
      </p>
    </div>
  )
}
