import { useMemo } from "react";
import { useSim, playlistOf } from "@/store/simulationStore";
import { indexAtTime } from "@/engine/eventEngine";
import { EVIDENCE } from "@/engine/assessmentEngine";
import type { EvidenceClass } from "@/types";

/** Share of events up to the current clock by evidence class. Counts only – no derived "score". */
export function ConfidenceIndicator() {
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  const showAll = useSim((s) => s.showAllEvents);
  const counts = useMemo(() => {
    const list = playlistOf(filters);
    const shown = showAll ? list : list.slice(0, indexAtTime(list, simTime) + 1);
    const c: Record<EvidenceClass, number> = { GREEN: 0, BLUE: 0, AMBER: 0, GREY: 0 };
    shown.forEach((e) => c[e.evidenceClass]++);
    return { c, total: shown.length };
  }, [filters, simTime, showAll]);
  const order: EvidenceClass[] = ["GREEN", "BLUE", "AMBER", "GREY"];
  return (
    <div className="flex flex-col gap-1" title="Evidence classification of events shown up to the current clock">
      <div className="label-caps">Data confidence · {counts.total} events</div>
      <div className="flex h-2 w-40 overflow-hidden rounded-[1px] bg-ink-800">
        {counts.total > 0 &&
          order.map((k) => (counts.c[k] ? <div key={k} style={{ width: `${(counts.c[k] / counts.total) * 100}%`, background: EVIDENCE[k].color }} /> : null))}
      </div>
      <div className="mono flex gap-2 text-[10px] text-ink-400">
        {order.map((k) => (
          <span key={k} style={{ color: EVIDENCE[k].color }}>
            {k[0]}:{counts.c[k]}
          </span>
        ))}
      </div>
    </div>
  );
}
