import { useMemo, useState } from "react";
import { Map as MapIcon, X } from "lucide-react";
import { WEAPONS, WEAPON_BY_ID } from "@/data";
import { FORCE_CATEGORIES, USAGE_LABEL } from "@/data/forceCategories";
import { useSim, ALL_EVENTS } from "@/store/simulationStore";
import { Card, CardHeader, Badge, KV } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SourceList } from "@/components/event-cards/EventDetail";
import { HistoricalPackage, HypotheticalPackageBuilder } from "@/components/force-visualisation/ForcePackage";
import { formatDateLabel } from "@/engine/timelineEngine";
import { cn } from "@/utils/cn";
import { ModuleHeader } from "../ModuleHeader";
import { downloadText, toCsv } from "@/utils/download";

function SystemCard({ id, onClose }: { id: string; onClose: () => void }) {
  const w = WEAPON_BY_ID.get(id)!;
  const { selectEvent, setModule } = useSim.getState();
  const events = ALL_EVENTS.filter((e) => w.eventIds.includes(e.id));
  const u = USAGE_LABEL[w.usageStatus];
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-700 p-3">
        <div className="flex justify-between">
          <span className="mono text-[11px] text-ink-400">{w.id}</span>
          <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close system card">
            <X />
          </Button>
        </div>
        <h3 className="text-[15px] font-semibold">{w.name}</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge color={w.operator === "India" ? "#4f8fe6" : "#e05252"}>{w.operator}</Badge>
          <Badge color={u.color}>{u.label}</Badge>
          <Badge color="#aeb4bb">Confidence {w.confidence}</Badge>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        <section>
          <KV k="System name" v={w.name} />
          <KV k="Country of origin" v={w.country} />
          <KV k="Domain" v={w.domain} />
          <KV k="Platform category" v={w.platformCategory} />
          <KV k="Weapon class" v={w.weaponClass} />
          <KV k="Force category" v={w.force} />
          <KV k="Publicly documented role" v={w.publicRole} />
        </section>
        <section>
          <div className="label-caps mb-1">Historical usage status</div>
          <p className="text-[12px] leading-relaxed text-ink-200">{w.usageNote}</p>
          <p className="mt-1 text-[10px] text-ink-500">
            Usage is recorded only as stated in the cited sources. The system is not assumed to have been used in any strike without that support.
          </p>
        </section>
        <section>
          <div className="label-caps mb-1">Associated events ({events.length})</div>
          {events.length === 0 && <div className="text-[11px] text-ink-500">No specific event attribution in sources (operation-wide statement only).</div>}
          <div className="space-y-1">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  selectEvent(e.id);
                  setModule("geospatial");
                }}
                className="flex w-full items-center gap-2 border border-ink-700 bg-ink-900 px-2 py-1 text-left hover:border-olive-500"
              >
                <MapIcon className="size-3 text-ink-400" />
                <span className="mono text-[10px] text-ink-400">
                  {e.id} {formatDateLabel(e.date)}
                </span>
                <span className="text-[12px] text-ink-100">{e.title}</span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="label-caps mb-1">Sources</div>
          <SourceList ids={w.sources} />
        </section>
      </div>
    </div>
  );
}

export function ForcesModule() {
  const [cat, setCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [usage, setUsage] = useState<string>("");
  const mode = useSim((s) => s.scenarioMode);
  const packageEvents = useMemo(() => ALL_EVENTS.filter((e) => e.formation.representation !== "none" || e.weaponSystemIds.length > 0), []);
  const [pkgEvent, setPkgEvent] = useState<string>("EVT-003");
  const pkg = packageEvents.find((e) => e.id === pkgEvent) ?? packageEvents[0];

  const list = WEAPONS.filter((w) => {
    if (cat) {
      const c = FORCE_CATEGORIES.find((x) => x.id === cat);
      if (c && !c.weaponIds.includes(w.id)) return false;
    }
    return !usage || w.usageStatus === usage;
  });

  const exportCsv = () =>
    downloadText(
      "sindoor-weapons-database.csv",
      "﻿" +
        toCsv(
          WEAPONS.map((w) => ({
            id: w.id,
            name: w.name,
            country: w.country,
            operator: w.operator,
            domain: w.domain,
            platform_category: w.platformCategory,
            weapon_class: w.weaponClass,
            public_role: w.publicRole,
            usage_status: w.usageStatus,
            usage_note: w.usageNote,
            event_ids: w.eventIds,
            sources: w.sources,
            confidence: w.confidence,
          }))
        ),
      "text/csv"
    );

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="C" title="Attack Formations & Force Database">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          Weapons CSV
        </Button>
      </ModuleHeader>
      <div className="flex min-h-0 flex-1">
        <aside className="w-[230px] shrink-0 overflow-auto border-r border-ink-700 bg-ink-900 p-2">
          <button
            onClick={() => setCat(null)}
            className={cn("mb-2 block w-full px-2 py-1 text-left text-[12px]", !cat ? "bg-ink-800 text-ink-100" : "text-ink-300 hover:bg-ink-850")}
          >
            All systems ({WEAPONS.length})
          </button>
          {(["India", "Pakistan"] as const).map((side) => (
            <div key={side} className="mb-3">
              <div className="label-caps mb-1 px-2" style={{ color: side === "India" ? "#4f8fe6" : "#e05252" }}>
                {side === "India" ? "Indian forces" : "Adversary forces"}
              </div>
              {FORCE_CATEGORIES.filter((c) => c.side === side).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "flex w-full justify-between px-2 py-1 text-left text-[12px]",
                    cat === c.id ? "bg-ink-800 text-ink-100" : "text-ink-300 hover:bg-ink-850"
                  )}
                >
                  <span>{c.label}</span>
                  <span className="mono text-[10px] text-ink-500">{c.weaponIds.length}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="label-caps mb-1 px-2">Usage status</div>
          <select
            aria-label="Usage status filter"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className="h-7 w-full border border-ink-700 bg-ink-900 px-1 text-[11px]"
          >
            <option value="">Any</option>
            {Object.entries(USAGE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </aside>

        <div className="min-w-0 flex-1 space-y-3 overflow-auto p-3">
          <Card>
            <CardHeader
              title="Force-package visualisation (historical)"
              right={
                <select
                  aria-label="Event for force-package view"
                  value={pkg?.id}
                  onChange={(e) => setPkgEvent(e.target.value)}
                  className="h-6 max-w-[420px] border border-ink-600 bg-ink-900 px-1 text-[11px]"
                >
                  {packageEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} · {e.title}
                    </option>
                  ))}
                </select>
              }
            />
            <div className="p-3">{pkg && <HistoricalPackage event={pkg} />}</div>
          </Card>
          {mode === "hypothetical" ? (
            <HypotheticalPackageBuilder />
          ) : (
            <div className="text-[11px] text-ink-500">Switch the header to HYPOTHETICAL mode to open the configurable (educational) package builder.</div>
          )}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((w) => {
              const u = USAGE_LABEL[w.usageStatus];
              return (
                <button
                  key={w.id}
                  onClick={() => setSelected(w.id)}
                  className={cn(
                    "border p-2.5 text-left transition-colors",
                    selected === w.id ? "border-olive-400 bg-ink-800" : "border-ink-700 bg-ink-850 hover:border-olive-600"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[13px] font-medium text-ink-100">{w.name}</div>
                    <span className="mono text-[9px] text-ink-500">{w.id}</span>
                  </div>
                  <div className="text-[11px] text-ink-400">
                    {w.country} · {w.platformCategory}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge color={w.operator === "India" ? "#4f8fe6" : "#e05252"}>{w.operator}</Badge>
                    <Badge color={u.color}>{u.label}</Badge>
                    <Badge color="#aeb4bb">{w.eventIds.length} events</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="w-[360px] shrink-0 border-l border-ink-700 bg-ink-900">
          {selected ? (
            <SystemCard id={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="p-4 text-[12px] text-ink-400">Select a system card to view its historical context, usage status, linked events and sources.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
