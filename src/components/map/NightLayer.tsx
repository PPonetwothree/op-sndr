import { useMemo } from "react";
import { Pane, Polygon, Tooltip } from "react-leaflet";
import { useSim } from "@/store/simulationStore";
import { nightPolygon } from "@/engine/solar";
import { formatIst } from "@/engine/timelineEngine";

/** Night-side shading at the simulation clock (recomputed once per simulated 5 minutes). */
export function NightLayer() {
  const simTime = useSim((s) => s.simTime);
  const bucket = Math.floor(simTime / 300_000) * 300_000;
  const poly = useMemo(() => nightPolygon(bucket, 2), [bucket]);
  return (
    <Pane name="night" style={{ zIndex: 265, pointerEvents: "none" }}>
      <Polygon
        positions={poly}
        interactive={false}
        pathOptions={{ stroke: true, color: "#9fb4d8", weight: 1, opacity: 0.35, dashArray: "2 4", fillColor: "#05070d", fillOpacity: 0.38 }}
      >
        <Tooltip sticky className="map-tip">
          Night at {formatIst(bucket)} (sun below horizon)
        </Tooltip>
      </Polygon>
    </Pane>
  );
}
