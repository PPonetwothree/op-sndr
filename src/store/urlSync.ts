// Keeps the URL hash in step with the view and restores it on load.
import { useSim, DEFAULT_LAYERS } from "./simulationStore";
import { decodeUrlState, encodeUrlState } from "@/utils/urlState";
import { CAMPAIGN_START } from "@/engine/timelineEngine";

function currentHash(): string {
  const s = useSim.getState();
  return encodeUrlState(
    {
      module: s.module,
      // An untouched clock is not written: restoring it would move the playhead past the prelude.
      simTime: s.playIdx < 0 && s.simTime === CAMPAIGN_START ? undefined : s.simTime,
      eventId: s.selectedEventId ?? undefined,
      filters: s.filters,
      layers: s.layers,
      showAll: s.showAllEvents,
      view: s.mapView,
      escalation: s.escalationHighlight ?? undefined,
      briefingStep: s.briefingStep ?? undefined,
    },
    DEFAULT_LAYERS
  );
}

/** Apply a shared link's state. Call before the first render so the map opens at the shared view. */
export function applyUrlState(hash = window.location.hash) {
  if (!hash || hash === "#") return;
  const u = decodeUrlState(hash, DEFAULT_LAYERS);
  const s = useSim.getState();
  if (u.layers) useSim.setState({ layers: { ...s.layers, ...u.layers } });
  if (u.filters) s.setFilters(u.filters);
  if (u.showAll) s.setShowAllEvents(true);
  if (u.escalation !== undefined) s.setEscalationHighlight(u.escalation);
  if (u.view) s.setMapView(u.view.center, u.view.zoom);
  if (u.briefingStep !== undefined) s.startBriefing(u.briefingStep);
  else if (u.eventId) s.selectEvent(u.eventId);
  else if (u.simTime !== undefined) s.seek(u.simTime);
  if (u.module) s.setModule(u.module);
}

/** Write the hash whenever relevant state changes (debounced; replaceState, no history spam). */
export function startUrlSync() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // A hash edited by hand or reached via back/forward is applied (replaceState does not fire this).
  window.addEventListener("hashchange", () => {
    clearTimeout(timer);
    applyUrlState(window.location.hash);
  });
  return useSim.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const h = currentHash();
      const url = `${window.location.pathname}${window.location.search}${h ? `#${h}` : ""}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) history.replaceState(null, "", url);
    }, 400);
  });
}

/** Absolute link to the current view (state written immediately, not debounced). */
export function shareableLink(): string {
  const h = currentHash();
  return `${window.location.origin}${window.location.pathname}${h ? `#${h}` : ""}`;
}
