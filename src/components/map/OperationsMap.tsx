import { useEffect, useRef } from "react";
import { MapContainer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useSim } from "@/store/simulationStore";
import { TARGET_BY_ID } from "@/data";
import { useMapEvents as useEventSet } from "@/modules/geospatial/useMapEvents";
import { CountryLayer, Admin1Layer, ReliefLayer, BoundaryLayer, OnlineTiles, RegionLabels, SectorLayer, CoverageLayer } from "./BaseLayers";
import { MarkerLayer, LAYER_OF } from "./MarkerLayer";
import { UncertaintyLayer } from "./UncertaintyLayer";
import { IndiaBoundaryLayer, ContestedAreasLayer } from "./IndiaBoundaryLayers";
import { VectorLayer } from "./VectorLayer";
import { NightLayer } from "./NightLayer";
import { NorthArrow, CoordinateReadout, MapBoundsBridge, Scale } from "./MapFurniture";

const BOUNDS = L.latLngBounds([15, 56], [40, 86]);

function ViewSync({ sync }: { sync: boolean }) {
  const map = useMap();
  const mapView = useSim((s) => s.mapView);
  const setMapView = useSim((s) => s.setMapView);
  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      const z = map.getZoom();
      const cur = useSim.getState().mapView;
      if (Math.abs(cur.center[0] - c.lat) > 1e-4 || Math.abs(cur.center[1] - c.lng) > 1e-4 || cur.zoom !== z) setMapView([c.lat, c.lng], z);
    },
  });
  useEffect(() => {
    if (!sync) return;
    const c = map.getCenter();
    if (Math.abs(mapView.center[0] - c.lat) > 1e-4 || Math.abs(mapView.center[1] - c.lng) > 1e-4 || mapView.zoom !== map.getZoom()) {
      map.setView(mapView.center, mapView.zoom, { animate: false });
    }
  }, [mapView, sync, map]);
  return null;
}

function FollowSelected({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const selectedId = useSim((s) => s.selectedEventId);
  const nonce = useSim((s) => s.animationNonce);
  const set = useEventSet();
  const briefing = useSim((s) => s.briefingStep !== null);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || briefing || !set.selected) return; // the briefing frames the map itself
    if (last.current === `${selectedId}-${nonce}`) return;
    last.current = `${selectedId}-${nonce}`;
    const e = set.selected;
    const pts: L.LatLngExpression[] = [];
    e.location.locationIds.forEach((id) => {
      const t = TARGET_BY_ID.get(id);
      if (t) pts.push([t.lat, t.lng]);
    });
    if (!pts.length && e.location.lat !== null && e.location.lng !== null) pts.push([e.location.lat, e.location.lng]);
    if (!pts.length) return;
    const b = L.latLngBounds(pts);
    const target = pts.length === 1 ? b.pad(2.5) : b.pad(0.35);
    const zoom = Math.min(7, map.getBoundsZoom(target));
    // Only move if the location is off-screen or the zoom is far off – avoids jitter during playback.
    if (!map.getBounds().contains(b) || Math.abs(map.getZoom() - zoom) > 1.5) map.flyToBounds(target, { maxZoom: 7, duration: 0.8 });
  }, [enabled, briefing, set.selected, selectedId, nonce, map]);
  return null;
}

export interface OperationsMapProps {
  dayOverride?: string;
  sync?: boolean;
  follow?: boolean;
  caption?: string;
}

export function OperationsMap({ dayOverride, sync = false, follow = true, caption }: OperationsMapProps) {
  const layers = useSim((s) => s.layers);
  const mapView = useSim((s) => s.mapView);
  const set = useEventSet(dayOverride);
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapView.center}
        zoom={mapView.zoom}
        minZoom={4}
        maxZoom={10}
        maxBounds={BOUNDS}
        zoomSnap={0.5}
        preferCanvas={false}
        attributionControl
        className="h-full w-full"
      >
        {layers.onlineTiles && <OnlineTiles />}
        <CountryLayer online={layers.onlineTiles} />
        {layers.relief && <ReliefLayer online={layers.onlineTiles} />}
        {layers.dayNight && !dayOverride && <NightLayer />}
        {layers.sectors && <SectorLayer />}
        {layers.contested && <ContestedAreasLayer labels={layers.labels} />}
        {layers.admin1 && <Admin1Layer />}
        {layers.indiaBoundary && <IndiaBoundaryLayer />}
        {layers.boundaries && <BoundaryLayer />}
        {layers.coverage && <CoverageLayer />}
        {layers.labels && <RegionLabels />}
        <VectorLayer set={set} layers={layers} />
        {layers.uncertainty && <UncertaintyLayer set={set} visible={(t) => layers[LAYER_OF[t.markerLayer]]} />}
        <MarkerLayer set={set} layers={layers} />
        <ViewSync sync={sync} />
        <Scale />
        <NorthArrow />
        {!dayOverride && <CoordinateReadout />}
        {!dayOverride && <MapBoundsBridge />}
        <FollowSelected enabled={follow && !dayOverride} />
      </MapContainer>
      {caption && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-[1000] -translate-x-1/2 border border-ink-600 bg-ink-950/90 px-3 py-1 mono text-[11px] tracking-wider text-ink-200">
          {caption} · {set.shown.length} events
        </div>
      )}
    </div>
  );
}
