import { GeoJSON, TileLayer, CircleMarker, Tooltip, Polygon, Circle, Pane, ImageOverlay } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import countriesRaw from "@/data/geo/countries.json";
import boundariesRaw from "@/data/geo/boundaries.json";
import { TARGETS } from "@/data";

const countries = countriesRaw as unknown as FeatureCollection;
const boundaries = boundariesRaw as unknown as FeatureCollection;

const FILL: Record<string, string> = {
  India: "#26301f",
  Pakistan: "#2b2624",
  "Siachen Glacier": "#26301f",
};

export function CountryLayer({ online }: { online: boolean }) {
  return (
    <Pane name="base-fills" style={{ zIndex: 250 }}>
      <GeoJSON
        key={online ? "on" : "off"}
        data={countries}
        style={(f) => {
          const name = (f?.properties as { name?: string })?.name ?? "";
          return {
            color: "#3d443a",
            weight: 0.8,
            fillColor: FILL[name] ?? "#1b1e20",
            fillOpacity: online ? 0.18 : 1,
          };
        }}
        interactive={false}
      />
    </Pane>
  );
}

/** Offline terrain relief: Natural Earth 1:10m shaded relief, reprojected to Web Mercator, as a transparent overlay. */
export function ReliefLayer({ online }: { online: boolean }) {
  return (
    <Pane name="relief" style={{ zIndex: 260, pointerEvents: "none" }}>
      <ImageOverlay
        url={`${import.meta.env.BASE_URL}relief/hillshade.png`}
        bounds={[
          [16, 58],
          [40, 86],
        ]}
        opacity={online ? 0.5 : 0.8}
        interactive={false}
        attribution="Relief, boundaries: Natural Earth"
      />
    </Pane>
  );
}

export function BoundaryLayer() {
  return (
    <Pane name="defacto-lines" style={{ zIndex: 348 }}>
      <GeoJSON
        data={boundaries}
        onEachFeature={(f, layer) => layer.bindTooltip((f.properties as { label: string }).label, { sticky: true, className: "map-tip" })}
        style={(f) => {
          const kind = (f?.properties as { kind?: string })?.kind;
          if (kind === "LoC") return { color: "#e3a83b", weight: 1.6, dashArray: "6 4", opacity: 0.95 };
          if (kind === "AGPL") return { color: "#e3a83b", weight: 1.6, dashArray: "1 4", opacity: 0.95 };
          if (kind === "LAC") return { color: "#c77ad6", weight: 1.5, dashArray: "6 4", opacity: 0.9 };
          return { color: "#a9b0b8", weight: 1.2, opacity: 0.7 };
        }}
      />
    </Pane>
  );
}

export function OnlineTiles() {
  return (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      crossOrigin="anonymous"
      subdomains="abcd"
      maxZoom={12}
    />
  );
}

const REGION_LABELS: [string, [number, number]][] = [
  ["INDIA", [24.6, 77.4]],
  ["PAKISTAN", [29.6, 68.6]],
  ["JAMMU & KASHMIR", [33.35, 75.75]],
  ["LADAKH", [34.6, 77.9]],
  ["PUNJAB", [30.5, 75.9]],
  ["RAJASTHAN", [26.6, 73.4]],
  ["GUJARAT", [22.7, 71.5]],
  ["PUNJAB (PAK)", [30.3, 72.6]],
  ["SINDH", [26.0, 68.6]],
  ["KHYBER PAKHTUNKHWA", [34.7, 71.6]],
  ["BALOCHISTAN", [28.3, 65.8]],
  ["ARABIAN SEA", [21.3, 65.0]],
];

export function RegionLabels() {
  return (
    <>
      {REGION_LABELS.map(([name, pos]) => (
        <CircleMarker key={name} center={pos} radius={0} stroke={false} interactive={false}>
          <Tooltip permanent direction="center" className="region-label">
            {name}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

/** Broad operational sectors – illustrative shapes, not official area boundaries. */
export const SECTORS: { id: string; name: string; color: string; poly: [number, number][] }[] = [
  {
    id: "SEC-N",
    name: "Northern sector – LoC (J&K / Ladakh)",
    color: "#9aa874",
    poly: [
      [35.7, 73.6],
      [35.8, 77.8],
      [32.6, 77.8],
      [32.5, 75.5],
      [32.6, 73.6],
    ],
  },
  {
    id: "SEC-W",
    name: "Western sector – Punjab / IB",
    color: "#9aa874",
    poly: [
      [32.5, 73.4],
      [32.5, 76.9],
      [29.6, 76.9],
      [29.6, 73.4],
    ],
  },
  {
    id: "SEC-SW",
    name: "South-western sector – Rajasthan",
    color: "#9aa874",
    poly: [
      [29.6, 69.8],
      [29.6, 74.6],
      [24.6, 74.6],
      [24.6, 69.8],
    ],
  },
  {
    id: "SEC-G",
    name: "Gujarat / Sir Creek sector",
    color: "#9aa874",
    poly: [
      [24.6, 67.9],
      [24.6, 72.2],
      [22.2, 72.2],
      [22.2, 67.9],
    ],
  },
  {
    id: "SEC-M",
    name: "Maritime – northern Arabian Sea",
    color: "#4f8fe6",
    poly: [
      [24.0, 61.5],
      [24.0, 67.6],
      [19.5, 70.0],
      [18.5, 61.5],
    ],
  },
];

export function SectorLayer() {
  return (
    <Pane name="sectors" style={{ zIndex: 350 }}>
      {SECTORS.map((s) => (
        <Polygon
          key={s.id}
          positions={s.poly}
          pathOptions={{ color: s.color, weight: 1, opacity: 0.35, dashArray: "2 6", fillColor: s.color, fillOpacity: 0.035 }}
        >
          <Tooltip sticky className="map-tip">
            {s.name} <span style={{ color: "#8a9098" }}>· illustrative sector</span>
          </Tooltip>
        </Polygon>
      ))}
    </Pane>
  );
}

const DEFENDED = TARGETS.filter(
  (t) => t.country === "India" && (t.category === "military_station" || t.category === "air_base") && t.markerLayer === "military"
);

/** Defensive coverage and surveillance illustrations – NOT actual system ranges or radar cover. */
export function CoverageLayer() {
  return (
    <Pane name="coverage" style={{ zIndex: 360 }}>
      {[
        [33.6, 75.4],
        [30.9, 75.3],
        [26.8, 72.0],
        [23.6, 69.8],
      ].map((c, i) => (
        <Circle
          key={`s${i}`}
          center={c as [number, number]}
          radius={230_000}
          pathOptions={{ color: "#5fbf7a", weight: 1, opacity: 0.3, dashArray: "1 6", fillOpacity: 0.025 }}
          interactive={false}
        />
      ))}
      {DEFENDED.map((t) => (
        <Circle
          key={t.id}
          center={[t.lat, t.lng]}
          radius={35_000}
          pathOptions={{ color: "#5fbf7a", weight: 1, opacity: 0.5, fillColor: "#5fbf7a", fillOpacity: 0.06 }}
        >
          <Tooltip className="map-tip">{t.name}: illustrative defended area (notional radius, not a system range)</Tooltip>
        </Circle>
      ))}
    </Pane>
  );
}
