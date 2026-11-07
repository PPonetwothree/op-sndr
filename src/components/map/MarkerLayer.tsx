import { Marker, Tooltip } from "react-leaflet";
import { TARGETS } from "@/data";
import { useSim } from "@/store/simulationStore";
import type { LayerVisibility, Target } from "@/types";
import { makeIcon, markerKind, sideColor } from "./icons";
import { milIcon } from "./milSymbols";
import type { MapEventSet } from "@/modules/geospatial/useMapEvents";

export const LAYER_OF: Record<Target["markerLayer"], keyof LayerVisibility> = {
  targets: "targets",
  infrastructure: "infrastructure",
  military: "military",
  airDefence: "airDefence",
  uav: "uav",
  civilian: "civilian",
  eventLocations: "eventLocations",
};

export function MarkerLayer({ set, layers }: { set: MapEventSet; layers: LayerVisibility }) {
  const selectTarget = useSim((s) => s.selectTarget);
  const selectedTargetId = useSim((s) => s.selectedTargetId);
  return (
    <>
      {TARGETS.filter((t) => layers[LAYER_OF[t.markerLayer]]).map((t) => {
        const selected = set.selectedTargetIds.has(t.id) || selectedTargetId === t.id;
        const active = set.activeTargetIds.has(t.id);
        const state = selected ? "selected" : active ? "active" : "dim";
        return (
          <Marker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={(layers.milSymbols && milIcon(t, state)) || makeIcon(markerKind(t), sideColor(t), state)}
            zIndexOffset={selected ? 1000 : active ? 200 : 0}
            eventHandlers={{ click: () => selectTarget(t.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]} className="map-tip">
              <div className="font-semibold">{t.name}</div>
              <div style={{ color: "#8a9098" }}>
                {t.region} · {t.precision === "town" ? "town-level position" : t.precision === "district" ? "district-level position" : t.precision}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
