import { Fragment } from "react";
import { Circle, Polyline, CircleMarker, Tooltip, Pane } from "react-leaflet";
import { TARGETS, TARGET_BY_ID } from "@/data";
import { useSim } from "@/store/simulationStore";
import { nearestOnLine, PRECISION_RADIUS_KM } from "@/engine/geoMeasure";
import type { MapEventSet } from "@/modules/geospatial/useMapEvents";
import type { Target } from "@/types";

/**
 * Position-uncertainty rings (how precise a plotted point is) and, for selected strike targets,
 * the distance stated by briefers versus the distance measured on this map's approximate LoC/IB.
 */
export function UncertaintyLayer({ set, visible }: { set: MapEventSet; visible: (t: Target) => boolean }) {
  const selectedTargetId = useSim((s) => s.selectedTargetId);
  const focus = new Set([...set.selectedTargetIds, ...(selectedTargetId ? [selectedTargetId] : [])]);
  const measured = [...focus]
    .map((id) => TARGET_BY_ID.get(id))
    .filter((t): t is Target => !!t?.statedDistance)
    .map((t) => ({ t, near: nearestOnLine([t.lat, t.lng], t.statedDistance!.from) }))
    .filter((x) => x.near);

  return (
    <Pane name="uncertainty" style={{ zIndex: 410 }}>
      {TARGETS.filter((t) => visible(t) && (set.activeTargetIds.has(t.id) || focus.has(t.id))).map((t) => (
        <Circle
          key={t.id}
          center={[t.lat, t.lng]}
          radius={PRECISION_RADIUS_KM[t.precision] * 1000}
          interactive={false}
          pathOptions={{ color: "#d3d7dc", weight: 1, opacity: focus.has(t.id) ? 0.7 : 0.25, dashArray: "2 4", fillColor: "#d3d7dc", fillOpacity: focus.has(t.id) ? 0.06 : 0.02 }}
        />
      ))}
      {measured.map(({ t, near }) => {
        const sd = t.statedDistance!;
        const stated = sd.km[0] === sd.km[1] ? `~${sd.km[0]} km` : `${sd.km[0]}–${sd.km[1]} km`;
        const m = Math.round(near!.km);
        const lo = sd.km[0], hi = sd.km[1];
        const tol = Math.max(3, hi * 0.4);
        const mismatch = m < lo - tol || m > hi + tol;
        const mid: [number, number] = [(t.lat + near!.point[0]) / 2, (t.lng + near!.point[1]) / 2];
        return (
          <Fragment key={`m-${t.id}`}>
            <Polyline positions={[near!.point, [t.lat, t.lng]]} interactive={false} pathOptions={{ color: "#e3a83b", weight: 1.5, dashArray: "1 5", lineCap: "round" }} />
            <CircleMarker center={near!.point} radius={3} interactive={false} pathOptions={{ color: "#e3a83b", fillColor: "#0b0d0e", fillOpacity: 1, weight: 1.5 }} />
            <CircleMarker center={mid} radius={0} stroke={false} interactive={false}>
              <Tooltip permanent direction="right" offset={[6, 0]} className={mismatch ? "measure-label mismatch" : "measure-label"}>
                {`Stated ${stated} from ${sd.from} (briefing) · map ≈ ${m} km${mismatch ? " · plotted position imprecise" : ""}`}
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </Pane>
  );
}
