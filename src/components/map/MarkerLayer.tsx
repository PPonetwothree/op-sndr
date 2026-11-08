import { useMemo, useState } from "react";
import L from "leaflet";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { TARGETS } from "@/data";
import { useSim } from "@/store/simulationStore";
import type { LayerVisibility, Target } from "@/types";
import { clusterPoints } from "@/engine/declutter";
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

/** Markers closer than this on screen are grouped (only inactive ones; see below). */
export const CLUSTER_RADIUS_PX = 22;
/** From this zoom on, every marker is drawn on its own. */
export const CLUSTER_MAX_ZOOM = 8;

const clusterIconCache = new Map<string, L.DivIcon>();
function clusterIcon(count: number, color: string): L.DivIcon {
  const key = `${count}|${color}`;
  const hit = clusterIconCache.get(key);
  if (hit) return hit;
  const size = count >= 10 ? 26 : 22;
  const html = `<div class="marker-cluster-badge" style="width:${size}px;height:${size}px;border-color:${color};color:${color}">${count}</div>`;
  const icon = L.divIcon({ className: "leaflet-div-icon clean", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  clusterIconCache.set(key, icon);
  return icon;
}

function precisionText(t: Target) {
  return t.precision === "town" ? "town-level position" : t.precision === "district" ? "district-level position" : t.precision;
}

export function MarkerLayer({ set, layers }: { set: MapEventSet; layers: LayerVisibility }) {
  const map = useMap();
  const selectTarget = useSim((s) => s.selectTarget);
  const selectedTargetId = useSim((s) => s.selectedTargetId);
  const [view, setView] = useState(0);
  useMapEvents({ zoomend: () => setView((v) => v + 1), moveend: () => setView((v) => v + 1) });

  const visible = TARGETS.filter((t) => layers[LAYER_OF[t.markerLayer]]);
  const stateOf = (t: Target) => (set.selectedTargetIds.has(t.id) || selectedTargetId === t.id ? "selected" : set.activeTargetIds.has(t.id) ? "active" : "dim");

  // Selected and active markers are never grouped: what the clock or selection points at stays visible.
  const { singles, clusters } = useMemo(() => {
    const grouping = layers.declutter && map.getZoom() < CLUSTER_MAX_ZOOM;
    const dim = visible.filter((t) => stateOf(t) === "dim");
    if (!grouping) return { singles: visible, clusters: [] };
    const groups = clusterPoints(
      dim.map((t) => {
        const p = map.latLngToContainerPoint([t.lat, t.lng]);
        return { id: t.id, x: p.x, y: p.y, item: t };
      }),
      CLUSTER_RADIUS_PX
    );
    const grouped = groups.filter((g) => g.members.length > 1);
    const groupedIds = new Set(grouped.flatMap((g) => g.members.map((m) => m.id)));
    return { singles: visible.filter((t) => !groupedIds.has(t.id)), clusters: grouped.map((g) => g.members.map((m) => m.item)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, layers, set, selectedTargetId, map]);

  return (
    <>
      {singles.map((t) => {
        const state = stateOf(t);
        return (
          <Marker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={(layers.milSymbols && milIcon(t, state)) || makeIcon(markerKind(t), sideColor(t), state)}
            zIndexOffset={state === "selected" ? 1000 : state === "active" ? 200 : 0}
            eventHandlers={{ click: () => selectTarget(t.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]} className="map-tip">
              <div className="font-semibold">{t.name}</div>
              <div style={{ color: "#8a9098" }}>
                {t.region} · {precisionText(t)}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
      {clusters.map((members) => {
        const colors = new Set(members.map(sideColor));
        const color = colors.size === 1 ? [...colors][0] : "#aeb4bb";
        const lat = members.reduce((a, m) => a + m.lat, 0) / members.length;
        const lng = members.reduce((a, m) => a + m.lng, 0) / members.length;
        const key = members
          .map((m) => m.id)
          .sort()
          .join("+");
        return (
          <Marker
            key={key}
            position={[lat, lng]}
            icon={clusterIcon(members.length, color)}
            eventHandlers={{
              click: () =>
                map.fitBounds(L.latLngBounds(members.map((m) => [m.lat, m.lng] as [number, number])), { padding: [60, 60], maxZoom: CLUSTER_MAX_ZOOM }),
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} className="map-tip">
              <div className="font-semibold">{members.length} nearby locations – click to zoom in</div>
              <div style={{ color: "#8a9098" }}>
                {members
                  .slice(0, 6)
                  .map((m) => m.name)
                  .join(" · ")}
                {members.length > 6 ? ` · +${members.length - 6} more` : ""}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
