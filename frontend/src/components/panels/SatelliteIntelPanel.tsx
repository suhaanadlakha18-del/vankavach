import { useEffect, useState } from 'react'
import type { Hotspot } from '../../types/hotspot'
import type { Telemetry } from '../../types/api'
import { api } from '../../services/api'

type SatelliteIntelPanelProps = {
  item?: Hotspot
  offline: boolean
}

function IntelField({
  label,
  value,
  status = 'neutral',
}: {
  label: string
  value: string
  status?: 'good' | 'warning' | 'neutral'
}) {
  const color =
    status === 'good'
      ? 'text-signal'
      : status === 'warning'
        ? 'text-amber'
        : 'text-slate-200'

  return (
    <div className="border border-line p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className={`mt-2 font-mono text-sm ${color}`}>
        {value}
      </div>
    </div>
  )
}

export function SatelliteIntelPanel({
  item,
  offline,
}: SatelliteIntelPanelProps) {
  const [telemetry, setTelemetry] = useState<Telemetry>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTelemetry() {
      setLoading(true)
      setError('')

      try {
        const result = await api.telemetry()

        if (active) {
          setTelemetry(result)
        }
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Telemetry request failed',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadTelemetry()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <p className="p-5 text-sm text-slate-400">
        Loading provider telemetry…
      </p>
    )
  }

  const providerConfigured =
    !offline &&
    telemetry?.backendStatus === 'online' &&
    telemetry?.providerState
      ?.toLowerCase()
      .includes('provider mode')

  const hasS2Evidence =
    item?.evidence.some(value =>
      value.toLowerCase().includes('sentinel-2'),
    ) ?? false

  const hasS1Evidence =
    item?.evidence.some(value =>
      value.toLowerCase().includes('sentinel-1'),
    ) ?? false

  const s1Status = offline
    ? 'Backend offline'
    : hasS1Evidence
      ? 'Sentinel-1 evidence available for selected hotspot'
      : providerConfigured
        ? 'Provider configured; no SAR result supplied for selected hotspot'
        : 'Provider unavailable'

  const s2Status = offline
    ? 'Backend offline'
    : hasS2Evidence
      ? 'Sentinel-2 evidence available for selected hotspot'
      : providerConfigured
        ? 'Provider configured; no optical result supplied for selected hotspot'
        : 'Provider unavailable'

  return (
    <div className="grid gap-3 p-5 md:grid-cols-2">
      <IntelField
        label="Sentinel-1 SAR"
        value={s1Status}
        status={
          hasS1Evidence
            ? 'good'
            : providerConfigured
              ? 'warning'
              : 'neutral'
        }
      />

      <IntelField
        label="Sentinel-2 Optical"
        value={s2Status}
        status={
          hasS2Evidence
            ? 'good'
            : providerConfigured
              ? 'warning'
              : 'neutral'
        }
      />

      <IntelField
        label="Provider State"
        value={
          telemetry?.providerState ??
          'Provider state not supplied'
        }
        status={providerConfigured ? 'good' : 'warning'}
      />

      <IntelField
        label="Latest Provider Event"
        value={
          telemetry?.latestEvent ??
          'No provider event timestamp supplied'
        }
      />

      <IntelField
        label="Selected Hotspot"
        value={
          item
            ? `${item.name} — ${item.id}`
            : 'No hotspot selected'
        }
      />

      <IntelField
        label="Acquisition Timestamp"
        value={
          item
            ? new Date(item.detectedAt).toLocaleString()
            : 'Not supplied'
        }
      />

      {typeof item?.ndviChange === 'number' && (
        <IntelField
          label="NDVI Change"
          value={String(item.ndviChange)}
          status="good"
        />
      )}

      {typeof item?.sarVhChange === 'number' && (
        <IntelField
          label="SAR VH Change"
          value={`${item.sarVhChange} dB`}
          status="good"
        />
      )}

      {error && (
        <p className="md:col-span-2 text-xs text-danger">
          Telemetry warning: {error}
        </p>
      )}

      <p className="md:col-span-2 text-xs leading-5 text-slate-400">
        Provider configuration and stored evidence are shown
        separately. A configured provider does not by itself prove
        that a fresh satellite acquisition succeeded.
      </p>
    </div>
  )
}
