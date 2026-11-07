import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { WEAPON_BY_ID } from "@/data";
import type { TimedEvent } from "@/engine/eventEngine";
import type { WeaponSystem } from "@/types";
import { Button } from "@/components/ui/button";

type ElementKind = "aircraft" | "uav" | "ad" | "support" | "naval" | "munition" | "artillery";

const GLYPH: Record<ElementKind, string> = {
  aircraft: "M4 14 l6 -8 l6 8 M10 6 v10",
  uav: "M3 6 h6 v6 h-6 z M11 6 h6 v6 h-6 z",
  ad: "M3 15 A7 7 0 0 1 17 15 M10 15 L14 8",
  support: "M4 10 h12 M10 4 v12",
  naval: "M3 12 h14 l-3 4 h-8 z M10 5 v7",
  munition: "M4 10 h10 l3 0 l-3 -2 M14 10 l-3 2",
  artillery: "M3 15 h14 M6 15 l8 -9",
};

function kindOf(w: WeaponSystem): ElementKind {
  const c = `${w.platformCategory} ${w.weaponClass}`.toLowerCase();
  if (/carrier|naval/.test(c)) return "naval";
  if (/loitering|uav|drone|uas/.test(c)) return "uav";
  if (/fighter|aircraft/.test(c)) return "aircraft";
  if (/missile|munition|bomb|rocket/.test(c) && !/surface-to-air|sam/.test(c)) return "munition";
  if (/sam|air defence|air-defence|ad gun|counter|c2|control/.test(c)) return "ad";
  if (/artillery|indirect/.test(c)) return "artillery";
  return "support";
}

function Element({ kind, title, sub, unknown }: { kind: ElementKind; title: string; sub: string; unknown?: boolean }) {
  return (
    <div
      className={`flex w-[150px] flex-col items-center gap-1 border p-2 ${unknown ? "border-dashed border-ink-600 bg-ink-900" : "border-ink-600 bg-ink-850"}`}
    >
      <svg width="40" height="22" viewBox="0 0 20 20" className="text-ink-300">
        <path d={GLYPH[kind]} fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <div className="text-center text-[11px] font-medium leading-tight text-ink-100">{title}</div>
      <div className="mono text-center text-[9px] uppercase tracking-wider text-warn">{sub}</div>
    </div>
  );
}

/** Abstract package for a historical event. Uses only publicly named systems; numbers are never shown. */
export function HistoricalPackage({ event }: { event: TimedEvent }) {
  const systems = event.weaponSystemIds.map((id) => WEAPON_BY_ID.get(id)).filter((w): w is WeaponSystem => !!w);
  const status = event.formation.status;
  const banner =
    status === "publicly_described"
      ? "PUBLICLY DESCRIBED"
      : status === "partially_disclosed"
        ? "PARTIALLY DISCLOSED – ABSTRACT REPRESENTATION"
        : "FORMATION UNKNOWN – ABSTRACT REPRESENTATION";
  const isDefensive = ["air_defence_engagement", "counter_uas", "briefing"].includes(event.eventType);
  return (
    <div>
      <div className="mono mb-2 inline-block border border-warn/50 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold text-warn">{banner}</div>
      {event.formation.publicDescription && <p className="mb-2 text-[11px] text-ink-300">{event.formation.publicDescription}</p>}
      <div className="flex flex-wrap items-stretch gap-2">
        {systems.length > 0 ? (
          systems.map((w) => <Element key={w.id} kind={kindOf(w)} title={w.name} sub={`${w.usageStatus.replace(/_/g, " ")} · number undisclosed`} />)
        ) : (
          <Element kind={isDefensive ? "ad" : event.domain === "land" ? "artillery" : "aircraft"} title="Element(s) not identified" sub="unknown" unknown />
        )}
        {!isDefensive && event.actor === "India" && event.domain !== "sea" && (
          <>
            <Element kind="support" title="Support / escort elements" sub="unknown" unknown />
            <Element kind="ad" title="SEAD / EW support" sub="unknown" unknown />
          </>
        )}
      </div>
      <p className="mt-2 text-[10px] text-ink-500">
        Elements shown only where a cited source names a system for this event. Numbers, routing, timing and weapon-to-target pairing are not disclosed and are
        not represented.
      </p>
    </div>
  );
}

interface HypoGroup {
  id: string;
  kind: ElementKind;
  label: string;
  count: number;
  role: string;
}
const KEY = "sindoor.hypoPackage.v1";
const loadGroups = (): HypoGroup[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** Configurable package – hypothetical/educational only. */
export function HypotheticalPackageBuilder() {
  const [groups, setGroups] = useState<HypoGroup[]>(loadGroups);
  const [draft, setDraft] = useState<Omit<HypoGroup, "id">>({ kind: "aircraft", label: "Strike group", count: 2, role: "Strike" });
  const save = (g: HypoGroup[]) => {
    setGroups(g);
    try {
      localStorage.setItem(KEY, JSON.stringify(g));
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="border border-warn/40 bg-warn/5 p-3">
      <div className="mono mb-2 text-[11px] font-semibold text-warn">HYPOTHETICAL PACKAGE BUILDER – EDUCATIONAL TABLETOP ONLY · NOT HISTORICAL</div>
      <div className="flex flex-wrap items-end gap-2 text-[11px]">
        <label className="flex flex-col gap-0.5">
          <span className="text-ink-400">Element</span>
          <select
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value as ElementKind })}
            className="h-7 border border-ink-600 bg-ink-900 px-1"
          >
            {Object.keys(GLYPH).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-ink-400">Label</span>
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            className="h-7 w-36 border border-ink-600 bg-ink-900 px-1.5"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-ink-400">Count (notional)</span>
          <input
            type="number"
            min={1}
            max={99}
            value={draft.count}
            onChange={(e) => setDraft({ ...draft, count: Math.max(1, Number(e.target.value)) })}
            className="h-7 w-20 border border-ink-600 bg-ink-900 px-1.5"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-ink-400">Role</span>
          <input
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            className="h-7 w-32 border border-ink-600 bg-ink-900 px-1.5"
          />
        </label>
        <Button size="sm" onClick={() => save([...groups, { ...draft, id: crypto.randomUUID() }])}>
          <Plus /> Add group
        </Button>
        {groups.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => save([])}>
            Clear
          </Button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {groups.map((g) => (
          <div key={g.id} className="relative">
            <Element kind={g.kind} title={`${g.label} ×${g.count}`} sub={`${g.role} · notional`} />
            <button
              onClick={() => save(groups.filter((x) => x.id !== g.id))}
              className="absolute right-1 top-1 text-ink-500 hover:text-hostile"
              aria-label="Remove group"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        {groups.length === 0 && <div className="text-[11px] text-ink-500">No groups yet. Add abstract groups to explore package composition concepts.</div>}
      </div>
    </div>
  );
}
