import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import type { Layer, PathOptions } from 'leaflet'
import { getDistrictById, type District } from '../data/districts'

type DistrictProps = {
  districtIds: string[]
  primaryId: string
  label: string
  state: string
}

function FlyToDistrict({
  lat,
  lon,
}: {
  lat: number
  lon: number
}) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lon], Math.max(map.getZoom(), 7), { duration: 0.55 })
  }, [lat, lon, map])
  return null
}

function styleFor(selected: boolean): PathOptions {
  return {
    color: selected ? '#5ba8a8' : '#78716c',
    weight: selected ? 2.5 : 1,
    fillColor: selected ? '#5ba8a8' : '#a8a29e',
    fillOpacity: selected ? 0.45 : 0.22,
  }
}

export function IndiaMap({
  selected,
  onPickDistrict,
}: {
  selected: District
  onPickDistrict: (d: District) => void
}) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    void fetch('/chilli_districts.geojson')
      .then((r) => r.json())
      .then((data: FeatureCollection) => setGeo(data))
      .catch(() => setGeo(null))
  }, [])

  const selectedKey = useMemo(() => selected.id, [selected.id])

  return (
    <div className="relative z-0 isolate h-full min-h-[360px] w-full overflow-hidden">
      <MapContainer
        center={[20.5, 78.5]}
        zoom={5}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToDistrict lat={selected.lat} lon={selected.lon} />

        {geo && (
          <GeoJSON
            key={selectedKey}
            data={geo}
            style={(feature) => {
              const ids = (feature?.properties as DistrictProps | undefined)
                ?.districtIds ?? []
              return styleFor(ids.includes(selected.id))
            }}
            onEachFeature={(feature, layer: Layer) => {
              const props = feature.properties as DistrictProps
              const names = props.districtIds
                .map((id) => getDistrictById(id)?.name ?? id)
                .join(', ')

              layer.bindTooltip(
                `<strong>${names}</strong><br/>${getDistrictById(props.primaryId)?.state ?? props.state}`,
                { sticky: true },
              )

              layer.on({
                mouseover: (e) => {
                  const target = e.target as {
                    setStyle: (s: PathOptions) => void
                    bringToFront: () => void
                  }
                  if (!props.districtIds.includes(selected.id)) {
                    target.setStyle({
                      weight: 2,
                      fillOpacity: 0.35,
                      fillColor: '#8b7ba8',
                      color: '#45355e',
                    })
                  }
                  target.bringToFront()
                },
                mouseout: (e) => {
                  const target = e.target as {
                    setStyle: (s: PathOptions) => void
                  }
                  target.setStyle(
                    styleFor(props.districtIds.includes(selected.id)),
                  )
                },
                click: () => {
                  // Prefer currently selected if this polygon covers multiple
                  // mapped districts (e.g. Guntur / Palnadu / Bapatla).
                  const pickId = props.districtIds.includes(selected.id)
                    ? selected.id
                    : props.primaryId
                  const d = getDistrictById(pickId)
                  if (d) onPickDistrict(d)
                },
              })
            }}
          />
        )}
      </MapContainer>
      {!geo && (
        <p className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded bg-surface px-2 py-1 text-xs text-muted shadow-sm">
          Loading district outlines…
        </p>
      )}
    </div>
  )
}
