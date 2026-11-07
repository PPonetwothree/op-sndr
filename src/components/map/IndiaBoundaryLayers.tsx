import { GeoJSON, Pane, CircleMarker, Tooltip, Circle } from "react-leaflet";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";
import indiaRaw from "@/data/geo/india-official.json";
import contestedRaw from "@/data/geo/contested.json";

const india = indiaRaw as unknown as FeatureCollection;
const contested = contestedRaw as unknown as FeatureCollection<MultiPolygon, { id: string; label: string; sub: string; admin: string }>;

export const BOUNDARY_STYLE = {
  india: { color: "#efe6c4", weight: 1.8, dashArray: "12 4 2 4" }, // dash-dot: international-boundary convention
  halo: { color: "#0b0d0e", weight: 5, opacity: 0.85 },
  contested: "#e3a83b",
};

/** SVG pattern used by contested-area fills. Rendered once per page. */
export function MapPatternDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <pattern id="contested-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#e3a83b" fillOpacity="0.05" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#e3a83b" strokeWidth="1.4" strokeOpacity="0.45" />
        </pattern>
      </defs>
    </svg>
  );
}

/** Label anchor: centroid of the largest polygon's outer ring (bbox centre is enough at this scale). */
function anchor(f: Feature<MultiPolygon>): [number, number] {
  let best: number[][] = f.geometry.coordinates[0][0];
  let bestArea = 0;
  for (const p of f.geometry.coordinates) {
    const xs = p[0].map((c) => c[0]),
      ys = p[0].map((c) => c[1]);
    const a = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (a > bestArea) {
      bestArea = a;
      best = p[0];
    }
  }
  const xs = best.map((c) => c[0]),
    ys = best.map((c) => c[1]);
  return [(Math.min(...ys) + Math.max(...ys)) / 2, (Math.min(...xs) + Math.max(...xs)) / 2];
}

const LABEL_NUDGE: Record<string, [number, number]> = { POJK: [0.15, -0.1], SIACHEN: [0.1, 0.35] };

export function ContestedAreasLayer({ labels }: { labels: boolean }) {
  return (
    <Pane name="contested" style={{ zIndex: 330 }}>
      <GeoJSON
        data={contested}
        style={() => ({ color: BOUNDARY_STYLE.contested, weight: 1, opacity: 0.6, dashArray: "3 3", fillColor: "url(#contested-hatch)", fillOpacity: 1 })}
        onEachFeature={(f, layer) => {
          const p = f.properties as { label: string; sub: string };
          layer.bindTooltip(`<b>${p.label}</b><br/><span style="color:#8a9098">${p.sub}</span>`, { sticky: true, className: "map-tip" });
        }}
      />
      {labels &&
        contested.features.map((f) => {
          const [lat, lng] = anchor(f);
          const n = LABEL_NUDGE[f.properties.id] ?? [0, 0];
          return (
            <CircleMarker key={f.properties.id} center={[lat + n[0], lng + n[1]]} radius={0} stroke={false} interactive={false}>
              <Tooltip permanent direction="center" className="contested-label">
                {f.properties.label}
              </Tooltip>
            </CircleMarker>
          );
        })}
      {/* Sir Creek: not in Natural Earth – indicative location only */}
      <Circle
        center={[23.72, 68.45]}
        radius={22_000}
        pathOptions={{ color: BOUNDARY_STYLE.contested, weight: 1, dashArray: "3 3", fillColor: "url(#contested-hatch)", fillOpacity: 1 }}
      >
        <Tooltip sticky className="map-tip">
          <b>Sir Creek</b>
          <br />
          <span style={{ color: "#8a9098" }}>Disputed estuary boundary (India–Pakistan) · indicative location only, no boundary line drawn</span>
        </Tooltip>
      </Circle>
      {labels && (
        <CircleMarker center={[23.35, 68.3]} radius={0} stroke={false} interactive={false}>
          <Tooltip permanent direction="center" className="contested-label">
            Sir Creek
          </Tooltip>
        </CircleMarker>
      )}
    </Pane>
  );
}

export function IndiaBoundaryLayer() {
  return (
    <Pane name="india-boundary" style={{ zIndex: 345 }}>
      <GeoJSON data={india} interactive={false} style={{ ...BOUNDARY_STYLE.halo, fill: false }} />
      <GeoJSON data={india} interactive={false} style={{ ...BOUNDARY_STYLE.india, fill: false, opacity: 0.95 }} />
    </Pane>
  );
}
