import { useMemo } from "react";
import { useSim, playlistOf, ALL_EVENTS } from "@/store/simulationStore";
import { indexAtTime, type TimedEvent } from "@/engine/eventEngine";

export interface MapEventSet {
  shown: TimedEvent[]; // events drawn on the map
  selected: TimedEvent | null;
  activeTargetIds: Set<string>; // locations referenced by shown events
  selectedTargetIds: Set<string>;
  highlightedIds: Set<string>; // escalation-level highlight
}

/**
 * Events to draw. Normally: filtered events up to the simulation clock.
 * `dayOverride` (compare mode) shows every filtered event of one day, ignoring the clock.
 */
export function useMapEvents(dayOverride?: string): MapEventSet {
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  const showAll = useSim((s) => s.showAllEvents);
  const selectedId = useSim((s) => s.selectedEventId);
  const escalation = useSim((s) => s.escalationHighlight);

  return useMemo(() => {
    let list = playlistOf(filters);
    if (dayOverride) list = list.filter((e) => e.date === dayOverride);
    const shown = dayOverride || showAll ? list : list.slice(0, indexAtTime(list, simTime) + 1);
    const selected = ALL_EVENTS.find((e) => e.id === selectedId) ?? null;
    const sel = selected && (!dayOverride || selected.date === dayOverride) ? selected : null;
    const ids = (e: TimedEvent) => [...e.location.locationIds, ...e.targetIds];
    return {
      shown,
      selected: sel,
      activeTargetIds: new Set(shown.flatMap(ids)),
      selectedTargetIds: new Set(sel ? ids(sel) : []),
      highlightedIds: new Set(escalation === null ? [] : ALL_EVENTS.filter((e) => e.escalationLevel === escalation).map((e) => e.id)),
    };
  }, [filters, simTime, showAll, selectedId, escalation, dayOverride]);
}
