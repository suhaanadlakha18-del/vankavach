import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { Hotspot } from '../../types/hotspot'
import 'leaflet/dist/leaflet.css'
import { Button } from '../ui/Button'

const INDIA_CENTER: [number, number] = [22.7, 79.2]
const INDIA_ZOOM = 5

const severityColors = {
  critical: '#ff5252',
  high: '#ff9f43',
  medium: '#ffd166',
  low: '#69f0ae',
}

function createMarkerIcon(hotspot: Hotspot, selected: boolean) {
  const color = severityColors[hotspot.severity]
  const size = selected ? 24 : 18

  return L.divIcon({
    className: '',
    html: `
      <span
        aria-hidden="true"
        style="
          display:block;
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${color};
          border:3px solid #07100d;
          box-shadow:0 0 12px ${color};
        "
      ></span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function ResetIndiaControl() {
  const map = useMap()

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control">
        <Button
          type="button"
          aria-label="Reset map view to India"
          onClick={() => map.setView(INDIA_CENTER, INDIA_ZOOM)}
        >
          Reset India
        </Button>
      </div>
    </div>
  )
}

type OperationsMapProps = {
  items: Hotspot[]
  selected?: Hotspot
  onSelect: (hotspot: Hotspot) => void
}

export function OperationsMap({
  items,
  selected,
  onSelect,
}: OperationsMapProps) {
  return (
    <div className="relative h-[470px] min-h-[360px]">
      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        minZoom={4}
        maxZoom={18}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <ResetIndiaControl />

        {items.map((hotspot) => (
          <Marker
            key={hotspot.id}
            position={[hotspot.lat, hotspot.lng]}
            icon={createMarkerIcon(
              hotspot,
              selected?.id === hotspot.id,
            )}
            eventHandlers={{
              click: () => onSelect(hotspot),
            }}
          >
            <Popup>
              <strong>{hotspot.name}</strong>
              <br />
              {hotspot.state}
              <br />
              {hotspot.description}
              <br />
              <em>
                {hotspot.demo
                  ? 'Synthetic demonstration scenario'
                  : 'API-supplied monitoring record'}
              </em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-2 right-2 z-[500] flex flex-wrap gap-3 border border-line bg-ink/90 p-2 text-[9px] uppercase">
        {Object.entries(severityColors).map(([severity, color]) => (
          <span key={severity}>
            <i
              className="mr-1 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {severity}
          </span>
        ))}
      </div>
    </div>
  )
}
