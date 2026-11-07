// Historical event engine: ordering, filtering, temporal state and playback scheduling.
import type { CampaignEvent, EventFilters } from "@/types";
import { toMs } from "./timelineEngine";

export interface TimedEvent extends CampaignEvent {
  t: number; // ms since epoch (from sortTime)
}

export function prepareEvents(events: CampaignEvent[]): TimedEvent[] {
  return events
    .map((e) => ({ ...e, t: toMs(e.sortTime) }))
    .sort((a, b) => a.t - b.t || a.id.localeCompare(b.id));
}

export const EMPTY_FILTERS: EventFilters = {
  days: [],
  domains: [],
  actors: [],
  evidence: [],
  types: [],
  search: "",
  showPrelude: true,
};

export function matchesFilters(e: CampaignEvent, f: EventFilters): boolean {
  if (!f.showPrelude && e.phase === "prelude") return false;
  if (f.days.length && !f.days.includes(e.date)) return false;
  if (f.domains.length && !f.domains.includes(e.domain)) return false;
  if (f.actors.length && !f.actors.includes(e.actor)) return false;
  if (f.evidence.length && !f.evidence.includes(e.evidenceClass)) return false;
  if (f.types.length && !f.types.includes(e.eventType)) return false;
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    const hay = `${e.id} ${e.title} ${e.description} ${e.location.name} ${e.location.region} ${e.weaponCategory}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function filterEvents<T extends CampaignEvent>(events: T[], f: EventFilters): T[] {
  return events.filter((e) => matchesFilters(e, f));
}

/** Index of the last event at or before simTime (-1 if none). Events must be sorted. */
export function indexAtTime(events: TimedEvent[], simTime: number): number {
  let lo = 0, hi = events.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (events[mid].t <= simTime) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

export function eventsUpTo(events: TimedEvent[], simTime: number): TimedEvent[] {
  return events.slice(0, indexAtTime(events, simTime) + 1);
}

export function stepIndex(events: TimedEvent[], currentIdx: number, dir: 1 | -1): number {
  if (!events.length) return -1;
  const next = currentIdx + dir;
  return Math.max(0, Math.min(events.length - 1, next));
}

// ── Playback scheduler ──────────────────────────────────────────────
// Playback moves event to event. Each leg = a dwell on the current event (so its animation can play)
// followed by a time-compressed transit of the clock to the next event. All durations scale with speed.
export const DWELL_MS = 2600;
export const TRANSIT_MS_PER_HOUR = 450;
export const MAX_TRANSIT_MS = 3200;

export function legDuration(events: TimedEvent[], idx: number, speed: number): { dwell: number; transit: number } {
  const cur = events[idx];
  const nxt = events[idx + 1];
  const gapH = cur && nxt ? Math.max(0, (nxt.t - cur.t) / 3600_000) : 0;
  const transit = nxt ? Math.min(MAX_TRANSIT_MS, 250 + gapH * TRANSIT_MS_PER_HOUR) : 0;
  return { dwell: DWELL_MS / speed, transit: transit / speed };
}

export interface PlaybackState {
  idx: number; // current event index (-1 = before first)
  elapsed: number; // ms elapsed in current leg
}

export interface TickResult {
  idx: number;
  elapsed: number;
  simTime: number;
  advanced: boolean; // moved to a new event this tick
  finished: boolean;
}

/** Advance playback by dt real milliseconds. Pure function; used by the rAF loop and by tests. */
export function tick(events: TimedEvent[], state: PlaybackState, dt: number, speed: number, startTime: number): TickResult {
  if (!events.length) return { idx: -1, elapsed: 0, simTime: startTime, advanced: false, finished: true };
  let { idx, elapsed } = state;
  let advanced = false;
  if (idx < 0) {
    // lead-in from start time to first event
    const lead = Math.min(MAX_TRANSIT_MS, 250 + Math.max(0, (events[0].t - startTime) / 3600_000) * TRANSIT_MS_PER_HOUR) / speed;
    elapsed += dt;
    if (elapsed < lead) {
      return { idx, elapsed, simTime: startTime + (events[0].t - startTime) * (elapsed / lead), advanced, finished: false };
    }
    idx = 0;
    elapsed = 0;
    advanced = true;
    return { idx, elapsed, simTime: events[0].t, advanced, finished: false };
  }
  elapsed += dt;
  // Consume whole legs if dt is large.
  for (;;) {
    const { dwell, transit } = legDuration(events, idx, speed);
    if (idx >= events.length - 1) {
      return { idx, elapsed, simTime: events[idx].t, advanced, finished: elapsed >= dwell };
    }
    const total = dwell + transit;
    if (elapsed < total) {
      const frac = elapsed <= dwell ? 0 : (elapsed - dwell) / transit;
      const simTime = events[idx].t + (events[idx + 1].t - events[idx].t) * frac;
      return { idx, elapsed, simTime, advanced, finished: false };
    }
    elapsed -= total;
    idx += 1;
    advanced = true;
  }
}

// ── Aggregates used by dashboards ───────────────────────────────────
export function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  items.forEach((i) => {
    const k = key(i);
    out[k] = (out[k] ?? 0) + 1;
  });
  return out;
}

export function maxEscalation(events: CampaignEvent[]): number {
  return events.reduce((m, e) => Math.max(m, e.escalationLevel), 0);
}
