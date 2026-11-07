import { useMemo, useState } from "react";
import { Polyline, Polygon, Circle, Marker, Tooltip, Pane, useMapEvents } from "react-leaflet";
import type { FeatureCollection, MultiLineString } from "geojson";
import boundariesRaw from "@/data/geo/boundaries.json";
import { useSim } from "@/store/simulationStore";
import { arcPoints, arrowHead, midpoint, resolveEndpoint, VECTOR_STYLES, frontSamples, ANCHORS, type LatLng } from "@/engine/vectorRenderer";
import { formationIcon } from "./icons";
import type { TimedEvent } from "@/engine/eventEngine";
import type { EventVector, LayerVisibility } from "@/types";
import type { MapEventSet } from "@/modules/geospatial/useMapEvents";

const boundaries = boundariesRaw as unknown as FeatureCollection<MultiLineString>;
const FRONT_LINES: LatLng[][] = boundaries.features
  .filter((f) => f.properties?.kind === "LoC" || f.properties?.kind === "IB")
  .flatMap((f) => f.geometry.coordinates.map((line) => line.map(([x, y]) => [y, x] as LatLng)));
const FRONT_SAMPLES = frontSamples(FRONT_LINES, 16);

function styleAllowed(v: EventVector, layers: LayerVisibility) {
  if (!layers.vectors) return false;
  if (v.style === "artillery") return layers.artillery;
  if (v.style === "uav") return layers.uav;
  return true;
}

function useZoom() {
  const [zoom, setZoom] = useState(5);
  useMapEvents({ zoomend: (e) => setZoom(e.target.getZoom()) });
  return zoom;
}

function formationKind(e: TimedEvent): "air" | "uav" | "ground" | "naval" {
  if (e.domain === "sea") return "naval";
  if (e.eventType === "artillery_shelling") return "ground";
  if (e.eventType === "counter_uas" || /drone|uav/i.test(e.weaponCategory)) return "uav";
  return "air";
}

function VectorShape({
  e,
  v,
  i,
  animated,
  nonce,
  zoom,
  fade = 1,
}: {
  e: TimedEvent;
  v: EventVector;
  i: number;
  animated: boolean;
  nonce: number;
  zoom: number;
  fade?: number; // 0–1 age factor for non-selected vectors
}) {
  const st = VECTOR_STYLES[v.style];
  const scale = Math.pow(2, 5 - zoom);
  // Special: intrusion front along the LoC/IB
  if (v.from.startsWith("FRONT:")) {
    return (
      <>
        {FRONT_LINES.map((line, k) => (
          <Polyline
            key={`front-${k}-${nonce}-${animated}`}
            positions={line}
            interactive={false}
            className={animated ? "vec-flow" : undefined}
            pathOptions={{ color: st.color, weight: animated ? 5 : 3, opacity: animated ? 0.55 : 0.25 * fade, dashArray: "10 14" }}
          />
        ))}
        {FRONT_SAMPLES.map((s, k) => {
          const pts = arcPoints(s.from, s.to, 0.1, 10);
          return (
            <Polyline
              key={`fs-${k}-${nonce}-${animated}`}
              positions={pts}
              className={animated ? "vec-flow" : undefined}
              pathOptions={{ color: st.color, weight: 1.6, opacity: animated ? 0.95 : 0.45 * fade, dashArray: "3 4" }}
              interactive={false}
            />
          );
        })}
        {animated && <Marker position={[30.6, 71.0]} icon={formationIcon("uav", st.color, "UAV ACTIVITY · ILLUSTRATIVE DISTRIBUTION")} interactive={false} />}
      </>
    );
  }
  const from = resolveEndpoint(v.from);
  const to = resolveEndpoint(v.to);
  if (!from || !to) return null;
  // Point events (same origin and destination): defended point or disputed claim ring
  if (v.from === v.to) {
    return (
      <Circle
        key={`ring-${e.id}-${i}-${nonce}-${animated}`}
        center={to}
        className={animated ? "vec-flow" : undefined}
        radius={animated ? 42_000 : 28_000}
        pathOptions={{
          color: st.color,
          weight: animated ? 2 : 1.2,
          opacity: animated ? 0.95 : 0.45 * fade,
          dashArray: st.dash ?? (v.style === "indian_defensive" ? "5 4" : undefined),
          fillColor: st.color,
          fillOpacity: animated ? 0.12 : 0.04,
        }}
        interactive={false}
      />
    );
  }
  const bow = v.style === "artillery" ? 0.05 : 0.16 + (i % 3) * 0.04;
  const pts = arcPoints(from, to, bow);
  const head = arrowHead(pts, 0.14 * scale);
  const opacity = animated ? 1 : 0.75 * fade;
  return (
    <>
      <Polyline
        key={`v-${e.id}-${i}-${nonce}-${animated}`}
        positions={pts}
        // className must be a constructor option: Leaflet ignores it in setStyle (pathOptions)
        className={animated ? "vec-draw" : undefined}
        pathOptions={{
          color: st.color,
          weight: animated ? st.weight + 0.8 : st.weight,
          opacity,
          dashArray: animated ? undefined : st.dash,
          lineCap: v.style === "artillery" ? "butt" : "round",
        }}
      >
        <Tooltip sticky className="map-tip">
          {st.label} · <i>illustrative geographic representation – not a flight path, trajectory or firing solution</i>
        </Tooltip>
      </Polyline>
      {v.style !== "artillery" && (
        <Polygon
          key={`h-${e.id}-${i}-${nonce}-${animated}`}
          positions={head}
          className={animated ? "fade-in" : undefined}
          pathOptions={{ color: st.color, weight: 1, fillColor: st.color, fillOpacity: opacity, opacity }}
          interactive={false}
        />
      )}
    </>
  );
}

export function VectorLayer({ set, layers }: { set: MapEventSet; layers: LayerVisibility }) {
  const nonce = useSim((s) => s.animationNonce);
  const simTime = useSim((s) => s.simTime);
  const showAll = useSim((s) => s.showAllEvents);
  const zoom = useZoom();
  // Age fade: vectors fade with time since the event (simulation clock); newest stand out.
  // Rounded to 0.05 steps so playback does not restyle every frame.
  const fadeFor = (e: TimedEvent) => {
    if (showAll) return 0.6;
    const ageH = Math.max(0, (simTime - e.t) / 3_600_000);
    return Math.round(Math.max(0.2, Math.exp(-ageH / 12)) * 20) / 20;
  };
  const sel = set.selected;

  const background = useMemo(() => set.shown.filter((e) => e.id !== sel?.id && e.vectors.length), [set.shown, sel]);
  const hl = set.highlightedIds;

  const formationPos = useMemo(() => {
    if (!sel || sel.formation.representation === "none") return null;
    const v = sel.vectors.find((x) => x.from !== x.to && !x.from.startsWith("FRONT:"));
    if (!v) return null;
    const a = resolveEndpoint(v.from),
      b = resolveEndpoint(v.to);
    return a && b ? midpoint(arcPoints(a, b, 0.16)) : null;
  }, [sel]);

  const usedAnchors = useMemo(() => {
    if (!sel) return [];
    const ids = new Set(sel.vectors.flatMap((v) => [v.from, v.to]));
    return ANCHORS.filter((a) => ids.has(a.id));
  }, [sel]);

  return (
    <Pane name="vectors" style={{ zIndex: 420 }}>
      {background.map((e) =>
        e.vectors.map((v, i) =>
          styleAllowed(v, layers) ? (
            <VectorShape
              key={`${e.id}-${i}${hl.has(e.id) ? "-hl" : ""}`}
              e={e}
              v={v}
              i={i}
              animated={hl.has(e.id)}
              nonce={hl.has(e.id) ? nonce : 0}
              zoom={zoom}
              fade={fadeFor(e)}
            />
          ) : null
        )
      )}
      {sel && (
        <Pane name="selected-vectors" style={{ zIndex: 440 }}>
          {sel.vectors.map((v, i) =>
            styleAllowed(v, layers) ? <VectorShape key={`sel-${sel.id}-${i}-${nonce}`} e={sel} v={v} i={i} animated nonce={nonce} zoom={zoom} /> : null
          )}
          {formationPos && layers.vectors && (
            <Marker
              key={`form-${sel.id}-${nonce}`}
              position={formationPos}
              interactive={false}
              icon={formationIcon(
                formationKind(sel),
                VECTOR_STYLES[sel.vectors[0]?.style ?? "unverified"].color,
                sel.formation.status === "partially_disclosed" ? "FORMATION PARTIALLY DISCLOSED · ABSTRACT" : "FORMATION UNKNOWN – ABSTRACT REPRESENTATION"
              )}
            />
          )}
          {layers.vectors &&
            usedAnchors.map((a) => (
              <Circle
                key={`anc-${a.id}-${nonce}`}
                center={a.pos}
                radius={18_000}
                pathOptions={{ color: "#8a9098", weight: 1, dashArray: "2 3", fillOpacity: 0 }}
              >
                <Tooltip permanent direction="bottom" offset={[0, 8]} className="anchor-label">
                  {a.label}
                </Tooltip>
              </Circle>
            ))}
        </Pane>
      )}
    </Pane>
  );
}
