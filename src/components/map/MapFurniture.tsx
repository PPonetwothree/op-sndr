import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, GeoJSON, Rectangle, ScaleControl, useMap, useMapEvents } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { forward as toMgrs } from "mgrs";
import countriesRaw from "@/data/geo/countries.json";
import indiaRaw from "@/data/geo/india-official.json";
import { useSim } from "@/store/simulationStore";

const countries = countriesRaw as unknown as FeatureCollection;
const india = indiaRaw as unknown as FeatureCollection;

/** Stops clicks and scrolls on an overlay from reaching the map. */
function useIsolate<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
  }, []);
  return ref;
}

export function NorthArrow() {
  const ref = useIsolate<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-3 top-[86px] z-[1000] flex flex-col items-center text-ink-200"
      aria-label="North arrow – north is up"
    >
      <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden>
        <path d="M11 2 L19 26 L11 21 L3 26 Z" fill="#0f1113cc" stroke="#d3d7dc" strokeWidth="1.2" />
        <path d="M11 2 L11 21 L3 26 Z" fill="#d3d7dc" />
      </svg>
      <span className="mono -mt-0.5 text-[10px] font-semibold">N</span>
    </div>
  );
}

const dms = (v: number, pos: string, neg: string) => {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = Math.floor((a - d) * 60);
  const s = Math.round(((a - d) * 60 - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″${v >= 0 ? pos : neg}`;
};

/** Cursor position: decimal degrees, DMS and MGRS (1 km precision – matches town-level plotting). */
export function CoordinateReadout() {
  const [pos, setPos] = useState<L.LatLng | null>(null);
  const ref = useIsolate<HTMLDivElement>();
  useMapEvents({ mousemove: (e) => setPos(e.latlng), mouseout: () => setPos(null) });
  let mgrs = "—";
  if (pos) {
    try {
      mgrs = toMgrs([pos.lng, pos.lat], 2).replace(/^(\d+[A-Z])([A-Z]{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
    } catch {
      mgrs = "outside MGRS";
    }
  }
  return (
    <div
      ref={ref}
      className="mono absolute bottom-[26px] right-3 z-[1000] border border-ink-600 bg-ink-950/90 px-2 py-1 text-[10px] leading-tight text-ink-300"
      aria-live="off"
    >
      {pos ? (
        <>
          <div>
            {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
          </div>
          <div>
            {dms(pos.lat, "N", "S")} {dms(pos.lng, "E", "W")}
          </div>
          <div className="text-olive-300">MGRS {mgrs}</div>
        </>
      ) : (
        <div className="text-ink-500">Move the cursor over the map for coordinates</div>
      )}
    </div>
  );
}

/** Publishes the main map's bounds and obeys pan requests from the inset. */
export function MapBoundsBridge() {
  const map = useMap();
  const setBounds = useSim((s) => s.setMapBounds);
  const command = useSim((s) => s.mapCommand);
  useMapEvents({ moveend: () => setBounds(map.getBounds()) });
  useEffect(() => setBounds(map.getBounds()), [map, setBounds]);
  useEffect(() => {
    if (command) map.panTo(command.center, { animate: true });
  }, [command, map]);
  return null;
}

/** Small overview map of the whole theatre with the main view's footprint. Click to pan. */
export function InsetMap() {
  const bounds = useSim((s) => s.mapBounds);
  const ref = useIsolate<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="no-export absolute bottom-[86px] right-3 z-[1000] h-[130px] w-[150px] border border-ink-600 bg-ink-950 shadow-lg"
      aria-label="Overview map – click to pan"
    >
      <MapContainer
        center={[29, 72]}
        zoom={3}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomSnap={0.25}
        className="h-full w-full !bg-[#0e1214]"
      >
        <InsetContent bounds={bounds} />
      </MapContainer>
    </div>
  );
}

function InsetContent({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([
      [19, 60],
      [38, 82],
    ]);
  }, [map]);
  useMapEvents({ click: (e) => useSim.setState({ mapCommand: { center: [e.latlng.lat, e.latlng.lng], nonce: Date.now() } }) });
  return (
    <>
      <GeoJSON data={countries} interactive={false} style={{ color: "#3d443a", weight: 0.5, fillColor: "#22281f", fillOpacity: 1 }} />
      <GeoJSON data={india} interactive={false} style={{ color: "#efe6c4", weight: 0.8, fill: false }} />
      {bounds && <Rectangle bounds={bounds} interactive={false} pathOptions={{ color: "#e3a83b", weight: 1.5, fillColor: "#e3a83b", fillOpacity: 0.12 }} />}
    </>
  );
}

export function Scale() {
  return <ScaleControl position="bottomleft" imperial={false} maxWidth={140} />;
}
