import { create } from "zustand";
import type { LatLngBounds } from "leaflet";
import { EVENTS, BASE_SOURCES } from "@/data";
import { prepareEvents, filterEvents, indexAtTime, stepIndex, tick, EMPTY_FILTERS, type TimedEvent } from "@/engine/eventEngine";
import { CAMPAIGN_START } from "@/engine/timelineEngine";
import { audit } from "./auditStore";
import type { EventFilters, LayerVisibility, ModuleId, PlaybackSpeed, ScenarioMode, Source } from "@/types";

export const ALL_EVENTS: TimedEvent[] = prepareEvents(EVENTS);

export const DEFAULT_LAYERS: LayerVisibility = {
  targets: true,
  infrastructure: true,
  military: true,
  airDefence: true,
  uav: true,
  civilian: true,
  eventLocations: true,
  sectors: true,
  vectors: true,
  coverage: false,
  artillery: true,
  boundaries: true,
  indiaBoundary: true,
  admin1: true,
  contested: true,
  labels: true,
  relief: true,
  dayNight: true,
  milSymbols: true,
  uncertainty: true,
  onlineTiles: false,
};

export interface CompareState {
  enabled: boolean;
  dayA: string;
  dayB: string;
}

export interface SessionSnapshot {
  version: 1;
  name: string;
  savedAt: string;
  module: ModuleId;
  scenarioMode: ScenarioMode;
  simTime: number;
  speed: PlaybackSpeed;
  selectedEventId: string | null;
  filters: EventFilters;
  layers: LayerVisibility;
  compare: CompareState;
  showAllEvents: boolean;
  userSources: Source[];
  mapView?: { center: [number, number]; zoom: number };
  eventSourceLinks?: Record<string, string[]>;
  bdaEdits?: Record<string, unknown>;
  scenario?: unknown;
  audit?: unknown;
}

interface SimState {
  module: ModuleId;
  scenarioMode: ScenarioMode;
  filters: EventFilters;
  layers: LayerVisibility;
  simTime: number;
  playing: boolean;
  speed: PlaybackSpeed;
  playIdx: number;
  playElapsed: number;
  selectedEventId: string | null;
  selectedTargetId: string | null;
  compare: CompareState;
  showAllEvents: boolean;
  escalationHighlight: number | null;
  userSources: Source[];
  eventSourceLinks: Record<string, string[]>; // user-added source links per event (never changes evidence class)
  mapView: { center: [number, number]; zoom: number };
  animationNonce: number; // bump to replay the selected event's animation
  mapBounds: LatLngBounds | null; // main map footprint (for the inset)
  mapCommand: { center: [number, number]; nonce: number } | null; // pan request from the inset
  setMapBounds: (b: LatLngBounds) => void;

  setModule: (m: ModuleId) => void;
  setScenarioMode: (m: ScenarioMode) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  restart: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  seek: (t: number) => void;
  advance: (dtMs: number) => void;
  selectEvent: (id: string | null, opts?: { seek?: boolean }) => void;
  selectTarget: (id: string | null) => void;
  selectDay: (date: string) => void;
  setFilters: (f: Partial<EventFilters>) => void;
  resetFilters: () => void;
  toggleLayer: (k: keyof LayerVisibility) => void;
  setCompare: (c: Partial<CompareState>) => void;
  setShowAllEvents: (v: boolean) => void;
  setEscalationHighlight: (l: number | null) => void;
  addUserSource: (s: Source) => void;
  removeUserSource: (id: string) => void;
  linkSource: (eventId: string, sourceId: string) => void;
  unlinkSource: (eventId: string, sourceId: string) => void;
  setMapView: (center: [number, number], zoom: number) => void;
  snapshot: (name: string) => SessionSnapshot;
  restore: (s: SessionSnapshot) => void;
}

const USER_SOURCES_KEY = "sindoor.userSources.v1";
const LINKS_KEY = "sindoor.eventSourceLinks.v1";
function loadLinks(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}
function saveLinks(l: Record<string, string[]>) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(l));
  } catch {
    /* storage unavailable */
  }
}
function loadUserSources(): Source[] {
  try {
    const raw = localStorage.getItem(USER_SOURCES_KEY);
    return raw ? (JSON.parse(raw) as Source[]) : [];
  } catch {
    return [];
  }
}
function saveUserSources(s: Source[]) {
  try {
    localStorage.setItem(USER_SOURCES_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

/** Events that playback walks through: current filters applied, chronological. */
export function playlistOf(filters: EventFilters): TimedEvent[] {
  return filterEvents(ALL_EVENTS, filters);
}

export function playbackStart(list: TimedEvent[]): number {
  return list.length ? Math.min(list[0].t - 3600_000, CAMPAIGN_START) : CAMPAIGN_START;
}

export const useSim = create<SimState>((set, get) => ({
  module: "geospatial",
  scenarioMode: "historical",
  filters: EMPTY_FILTERS,
  layers: DEFAULT_LAYERS,
  simTime: CAMPAIGN_START,
  playing: false,
  speed: 1,
  playIdx: -1,
  playElapsed: 0,
  selectedEventId: null,
  selectedTargetId: null,
  compare: { enabled: false, dayA: "2025-05-07", dayB: "2025-05-10" },
  showAllEvents: false,
  escalationHighlight: null,
  userSources: loadUserSources(),
  eventSourceLinks: loadLinks(),
  mapView: { center: [29.6, 71.8], zoom: 5.5 },
  animationNonce: 0,
  mapBounds: null,
  mapCommand: null,
  setMapBounds: (mapBounds) => set({ mapBounds }),

  setModule: (module) => set({ module }),
  setScenarioMode: (scenarioMode) => set({ scenarioMode }),

  play: () => {
    const list = playlistOf(get().filters);
    if (!list.length) return;
    const { playIdx, simTime } = get();
    // If at the end, restart.
    if (playIdx >= list.length - 1 && simTime >= list[list.length - 1].t) {
      set({ playIdx: -1, playElapsed: 0, simTime: playbackStart(list), selectedEventId: null });
    }
    set({ playing: true });
  },
  pause: () => set({ playing: false }),
  togglePlay: () => (get().playing ? get().pause() : get().play()),
  restart: () => {
    const list = playlistOf(get().filters);
    set({ playing: false, playIdx: -1, playElapsed: 0, simTime: playbackStart(list), selectedEventId: null, selectedTargetId: null });
  },
  stepForward: () => {
    const list = playlistOf(get().filters);
    if (!list.length) return;
    const cur = get().playIdx;
    const idx = cur < 0 ? 0 : stepIndex(list, cur, 1);
    set((s) => ({ playing: false, playIdx: idx, playElapsed: 0, simTime: list[idx].t, selectedEventId: list[idx].id, animationNonce: s.animationNonce + 1 }));
  },
  stepBackward: () => {
    const list = playlistOf(get().filters);
    if (!list.length) return;
    const cur = get().playIdx;
    if (cur <= 0) return get().restart();
    const idx = stepIndex(list, cur, -1);
    set((s) => ({ playing: false, playIdx: idx, playElapsed: 0, simTime: list[idx].t, selectedEventId: list[idx].id, animationNonce: s.animationNonce + 1 }));
  },
  setSpeed: (speed) => set({ speed }),
  seek: (t) => {
    const list = playlistOf(get().filters);
    const idx = indexAtTime(list, t);
    set({ simTime: t, playIdx: idx, playElapsed: 0, selectedEventId: idx >= 0 ? list[idx].id : null });
  },
  advance: (dt) => {
    const s = get();
    if (!s.playing) return;
    const list = playlistOf(s.filters);
    const r = tick(list, { idx: s.playIdx, elapsed: s.playElapsed }, dt, s.speed, playbackStart(list));
    const patch: Partial<SimState> = { playIdx: r.idx, playElapsed: r.elapsed, simTime: r.simTime };
    if (r.advanced && r.idx >= 0) {
      patch.selectedEventId = list[r.idx].id;
      patch.animationNonce = s.animationNonce + 1;
    }
    if (r.finished) patch.playing = false;
    set(patch);
  },
  selectEvent: (id, opts = { seek: true }) => {
    if (!id) return set({ selectedEventId: null });
    const ev = ALL_EVENTS.find((e) => e.id === id);
    if (!ev) return;
    const list = playlistOf(get().filters);
    const idx = list.findIndex((e) => e.id === id);
    set((s) => ({
      selectedEventId: id,
      animationNonce: s.animationNonce + 1,
      ...(opts.seek ? { simTime: ev.t, playIdx: idx >= 0 ? idx : indexAtTime(list, ev.t), playElapsed: 0 } : {}),
    }));
  },
  selectTarget: (selectedTargetId) => set({ selectedTargetId }),
  selectDay: (date) => {
    const list = playlistOf(get().filters);
    const first = list.find((e) => e.date === date);
    if (first) get().selectEvent(first.id);
  },
  setFilters: (f) => {
    set((s) => ({ filters: { ...s.filters, ...f } }));
    // keep playback index coherent with the new playlist
    const { simTime } = get();
    const list = playlistOf(get().filters);
    set({ playIdx: indexAtTime(list, simTime), playElapsed: 0 });
  },
  resetFilters: () => get().setFilters(EMPTY_FILTERS),
  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  setCompare: (c) => set((s) => ({ compare: { ...s.compare, ...c } })),
  setShowAllEvents: (showAllEvents) => set({ showAllEvents }),
  setEscalationHighlight: (escalationHighlight) => set({ escalationHighlight }),
  addUserSource: (src) => {
    audit({ action: "source.add", target: src.id, summary: `Added source "${src.title}" [${src.evidenceClass}]` });
    const next = [...get().userSources.filter((s) => s.id !== src.id), src];
    saveUserSources(next);
    set({ userSources: next });
  },
  removeUserSource: (id) => {
    audit({ action: "source.remove", target: id, summary: `Removed user source ${id}` });
    const next = get().userSources.filter((s) => s.id !== id);
    saveUserSources(next);
    const links = Object.fromEntries(Object.entries(get().eventSourceLinks).map(([k, v]) => [k, v.filter((x) => x !== id)]));
    saveLinks(links);
    set({ userSources: next, eventSourceLinks: links });
  },
  linkSource: (eventId, sourceId) => {
    const cur = get().eventSourceLinks[eventId] ?? [];
    if (cur.includes(sourceId)) return;
    audit({ action: "source.link", target: eventId, summary: `Linked ${sourceId} to ${eventId} (evidence class unchanged)` });
    const links = { ...get().eventSourceLinks, [eventId]: [...cur, sourceId] };
    saveLinks(links);
    set({ eventSourceLinks: links });
  },
  unlinkSource: (eventId, sourceId) => {
    audit({ action: "source.unlink", target: eventId, summary: `Unlinked ${sourceId} from ${eventId}` });
    const links = { ...get().eventSourceLinks, [eventId]: (get().eventSourceLinks[eventId] ?? []).filter((x) => x !== sourceId) };
    saveLinks(links);
    set({ eventSourceLinks: links });
  },
  setMapView: (center, zoom) => set({ mapView: { center, zoom } }),
  snapshot: (name) => {
    const s = get();
    return {
      version: 1,
      name,
      savedAt: new Date().toISOString(),
      module: s.module,
      scenarioMode: s.scenarioMode,
      simTime: s.simTime,
      speed: s.speed,
      selectedEventId: s.selectedEventId,
      filters: s.filters,
      layers: s.layers,
      compare: s.compare,
      showAllEvents: s.showAllEvents,
      userSources: s.userSources,
      mapView: s.mapView,
      eventSourceLinks: s.eventSourceLinks,
    };
  },
  restore: (snap) => {
    const list = playlistOf(snap.filters);
    saveUserSources(snap.userSources ?? []);
    saveLinks(snap.eventSourceLinks ?? {});
    set({
      module: snap.module,
      scenarioMode: snap.scenarioMode,
      simTime: snap.simTime,
      speed: snap.speed,
      selectedEventId: snap.selectedEventId,
      filters: { ...EMPTY_FILTERS, ...snap.filters },
      layers: { ...DEFAULT_LAYERS, ...snap.layers },
      compare: snap.compare,
      showAllEvents: snap.showAllEvents,
      userSources: snap.userSources ?? [],
      eventSourceLinks: snap.eventSourceLinks ?? {},
      mapView: snap.mapView ?? get().mapView,
      playing: false,
      playIdx: indexAtTime(list, snap.simTime),
      playElapsed: 0,
      animationNonce: get().animationNonce + 1,
    });
  },
}));

export function allSources(userSources: Source[]): Source[] {
  return [...BASE_SOURCES, ...userSources];
}
