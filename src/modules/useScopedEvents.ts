import { useMemo } from "react";
import { useSim, playlistOf } from "@/store/simulationStore";
import { indexAtTime } from "@/engine/eventEngine";

/** Filtered events, optionally limited to the simulation clock. Drives every dashboard chart. */
export function useScopedEvents(upToClock: boolean) {
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  return useMemo(() => {
    const list = playlistOf(filters);
    return upToClock ? list.slice(0, indexAtTime(list, simTime) + 1) : list;
  }, [filters, simTime, upToClock]);
}
