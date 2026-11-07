import { useEffect, useMemo, useRef } from "react";
import { Search, FilterX } from "lucide-react";
import { useSim, playlistOf } from "@/store/simulationStore";
import { Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { EVIDENCE, DOMAIN_LABEL, EVENT_TYPE_LABEL } from "@/engine/assessmentEngine";
import { indexAtTime } from "@/engine/eventEngine";
import { cn } from "@/utils/cn";
import type { EventFilters } from "@/types";

const DAYS: [string, string][] = [
  ["2025-04-22", "22 APR"],
  ["2025-04-23", "23 APR"],
  ["2025-05-07", "7 MAY"],
  ["2025-05-08", "8 MAY"],
  ["2025-05-09", "9 MAY"],
  ["2025-05-10", "10 MAY"],
  ["2025-05-11", "11 MAY"],
  ["2025-05-12", "12 MAY"],
];
const ACTORS: [string, string][] = [
  ["India", "India"],
  ["Pakistan", "Pakistan"],
  ["Terrorist_group", "Terrorist grp"],
  ["Bilateral", "Bilateral"],
];

function Chips({
  field,
  options,
  colors,
}: {
  field: keyof Pick<EventFilters, "days" | "domains" | "actors" | "evidence">;
  options: [string, string][];
  colors?: Record<string, string>;
}) {
  const value = useSim((s) => s.filters[field]);
  const setFilters = useSim((s) => s.setFilters);
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(([v, label]) => {
        const on = value.includes(v);
        return (
          <button
            key={v}
            onClick={() => setFilters({ [field]: on ? value.filter((x) => x !== v) : [...value, v] })}
            className={cn(
              "mono border px-1.5 py-0.5 text-[10px]",
              on ? "border-olive-500 bg-olive-700 text-olive-300" : "border-ink-700 bg-ink-900 text-ink-400 hover:text-ink-100"
            )}
            style={on && colors?.[v] ? { borderColor: colors[v], color: colors[v], background: `${colors[v]}1f` } : undefined}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function EventPanel() {
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  const selectedId = useSim((s) => s.selectedEventId);
  const showAll = useSim((s) => s.showAllEvents);
  const { setFilters, resetFilters, selectEvent, setShowAllEvents, selectDay } = useSim.getState();
  const list = useMemo(() => playlistOf(filters), [filters]);
  const curIdx = indexAtTime(list, simTime);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId) return;
    listRef.current?.querySelector(`[data-evt="${selectedId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const anyFilter =
    filters.days.length + filters.domains.length + filters.actors.length + filters.evidence.length + filters.types.length > 0 ||
    filters.search ||
    !filters.showPrelude;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2.5 border-b border-ink-700 p-3">
        <div className="flex items-center justify-between">
          <span className="label-caps">Filters</span>
          {anyFilter && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <FilterX /> Clear
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1.5 size-3.5 text-ink-500" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search events, places, weapons"
            className="h-7 w-full border border-ink-700 bg-ink-900 pl-7 pr-2 text-[12px] outline-none focus:border-olive-500"
          />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">DATE</div>
          <Chips field="days" options={DAYS} />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">ACTOR</div>
          <Chips field="actors" options={ACTORS} colors={{ India: "#4f8fe6", Pakistan: "#e05252" }} />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">DOMAIN</div>
          <Chips field="domains" options={Object.entries(DOMAIN_LABEL)} />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">EVIDENCE</div>
          <Chips
            field="evidence"
            options={Object.keys(EVIDENCE).map((k) => [k, k])}
            colors={Object.fromEntries(Object.entries(EVIDENCE).map(([k, v]) => [k, v.color]))}
          />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">EVENT TYPE</div>
          <select
            aria-label="Event type filter"
            value={filters.types[0] ?? ""}
            onChange={(e) => setFilters({ types: e.target.value ? [e.target.value] : [] })}
            className="h-7 w-full border border-ink-700 bg-ink-900 px-1.5 text-[12px] text-ink-200 outline-none"
          >
            <option value="">All event types</option>
            {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center justify-between text-[11px] text-ink-300">
          Include prelude (22–23 Apr)
          <Switch checked={filters.showPrelude} onCheckedChange={(v) => setFilters({ showPrelude: v })} />
        </label>
        <label className="flex items-center justify-between text-[11px] text-ink-300" title="Draw every filtered event regardless of the simulation clock">
          Show all events (ignore clock)
          <Switch checked={showAll} onCheckedChange={setShowAllEvents} />
        </label>
        <div>
          <div className="mb-1 text-[10px] text-ink-500">JUMP TO DAY</div>
          <div className="flex gap-1">
            {["2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10"].map((d) => (
              <Button key={d} variant="secondary" size="sm" onClick={() => selectDay(d)}>
                {Number(d.slice(8))} May
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="label-caps">Event sequence · {list.length}</span>
      </div>
      <div ref={listRef} className="flex-1 overflow-auto px-2 pb-2">
        {list.map((e, i) => {
          const sel = e.id === selectedId;
          const past = i <= curIdx;
          return (
            <button
              key={e.id}
              data-evt={e.id}
              onClick={() => selectEvent(e.id)}
              className={cn(
                "mb-1 block w-full border-l-2 px-2 py-1.5 text-left transition-colors",
                sel ? "border-warn bg-ink-800" : "border-transparent hover:bg-ink-850",
                !past && !sel && "[&_*]:!text-ink-500"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: EVIDENCE[e.evidenceClass].color }}
                  title={EVIDENCE[e.evidenceClass].desc}
                />
                <span className="mono text-[10px] text-ink-500">{e.id}</span>
                <span className="mono text-[10px] text-ink-400">
                  {e.date.slice(8)}/{e.date.slice(5, 7)} {e.time ?? "--:--"}
                </span>
                <span className="ml-auto mono text-[9px]" style={{ color: e.actor === "India" ? "#4f8fe6" : e.actor === "Pakistan" ? "#e05252" : "#aeb4bb" }}>
                  {e.actor === "Terrorist_group" ? "TERR" : e.actor.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className={cn("mt-0.5 text-[12px] leading-snug", sel ? "text-ink-100" : "text-ink-200")}>{e.title}</div>
            </button>
          );
        })}
        {list.length === 0 && <div className="p-3 text-[12px] text-ink-500">No events match the filters.</div>}
      </div>
    </div>
  );
}
