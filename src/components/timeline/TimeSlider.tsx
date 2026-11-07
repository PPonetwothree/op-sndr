import { useMemo } from "react";
import { useSim, playlistOf, playbackStart } from "@/store/simulationStore";
import { dayStart, formatIst, toMs } from "@/engine/timelineEngine";
import { VECTOR_STYLES } from "@/engine/vectorRenderer";
import type { TimedEvent } from "@/engine/eventEngine";

const ACTOR_COLOR: Record<string, string> = {
  India: VECTOR_STYLES.indian_offensive.color,
  Pakistan: VECTOR_STYLES.pakistani_attack.color,
  Terrorist_group: "#b04a4a",
  Bilateral: "#d3d7dc",
  International: "#9aa874",
};

/**
 * Campaign time slider. The track is piecewise: the prelude (22–23 Apr) is compressed into a fixed
 * share so that 7–12 May stays readable.
 */
export function TimeSlider() {
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  const selectedId = useSim((s) => s.selectedEventId);
  const seek = useSim((s) => s.seek);
  const selectEvent = useSim((s) => s.selectEvent);
  const hl = useSim((s) => s.escalationHighlight);
  const list = useMemo(() => playlistOf(filters), [filters]);

  const start = playbackStart(list);
  const campaignStart = toMs("2025-05-07T00:00");
  const end = list.length ? Math.max(list[list.length - 1].t + 3600_000, toMs("2025-05-11T00:00")) : toMs("2025-05-11T00:00");
  const hasPrelude = start < campaignStart - 1;
  const PRE = hasPrelude ? 0.08 : 0; // fraction of track for prelude

  const toFrac = (t: number) => {
    if (t <= campaignStart && hasPrelude) return ((t - start) / (campaignStart - start)) * PRE;
    return PRE + ((t - campaignStart) / (end - campaignStart)) * (1 - PRE);
  };
  const fromFrac = (f: number) => {
    if (f <= PRE && hasPrelude) return start + (f / PRE) * (campaignStart - start);
    return campaignStart + ((f - PRE) / (1 - PRE)) * (end - campaignStart);
  };

  const days = ["2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10", "2025-05-11", "2025-05-12"].filter((d) => dayStart(d) < end);
  const frac = Math.max(0, Math.min(1, toFrac(simTime)));

  return (
    <div className="no-print border-t border-ink-700 bg-ink-950 px-4 pb-2 pt-1.5">
      <div className="flex items-center justify-between">
        <span className="label-caps">Time slider · {list.length} events in filter</span>
        <span className="mono text-[11px] text-warn">{formatIst(simTime)}</span>
      </div>
      <div className="relative mt-1 h-[52px]">
        {/* day bands */}
        {hasPrelude && (
          <div className="absolute top-0 h-[14px] border-l border-ink-600 pl-1 text-[9px] text-ink-500" style={{ left: 0, width: `${PRE * 100}%` }}>
            PRELUDE 22–23 APR
          </div>
        )}
        {days.map((d) => (
          <div
            key={d}
            className="absolute top-0 h-full border-l border-ink-700 pl-1 text-[9px] text-ink-400 mono"
            style={{ left: `${toFrac(dayStart(d)) * 100}%` }}
          >
            {Number(d.slice(8))} MAY
          </div>
        ))}
        {/* event ticks */}
        <div className="absolute inset-x-0 top-[16px] h-[16px]">
          {list.map((e: TimedEvent) => (
            <button
              key={e.id}
              title={`${e.id} · ${e.title}\n${e.timeLabel}`}
              onClick={() => selectEvent(e.id)}
              className="absolute top-0 h-full w-[3px] -translate-x-1/2 hover:scale-y-125"
              style={{
                left: `${toFrac(e.t) * 100}%`,
                background: ACTOR_COLOR[e.actor] ?? "#888",
                opacity: hl !== null ? (e.escalationLevel === hl ? 1 : 0.15) : e.t <= simTime ? 1 : 0.35,
                top: hl !== null && e.escalationLevel === hl ? -4 : 0,
                height: hl !== null && e.escalationLevel === hl ? 24 : undefined,
                outline: e.id === selectedId ? "1px solid #e3a83b" : hl !== null && e.escalationLevel === hl ? "1px solid #e3a83b88" : undefined,
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
        <input
          type="range"
          className="timeline absolute inset-x-0 bottom-0"
          min={0}
          max={1000}
          value={Math.round(frac * 1000)}
          onChange={(ev) => seek(fromFrac(Number(ev.target.value) / 1000))}
          aria-label="Simulation time"
        />
      </div>
    </div>
  );
}
