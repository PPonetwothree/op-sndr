import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, FileDown, X } from "lucide-react";
import { ESCALATION_LADDER } from "@/data/escalation";
import { useSim, ALL_EVENTS } from "@/store/simulationStore";
import { Card, CardHeader, KV } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SourceList } from "@/components/event-cards/EventDetail";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import { EscalationLineChart } from "@/components/charts/CampaignCharts";
import { formatDateLabel } from "@/engine/timelineEngine";
import { ModuleHeader } from "../ModuleHeader";
import { TabletopExercise } from "@/components/escalation/TabletopExercise";
import { cn } from "@/utils/cn";

const LEVEL_TINT = ["#5a6068", "#4a86dc", "#bf8219", "#a35bc0", "#d9773a", "#c98a1e", "#d24848", "#1f9a9a"];

function Ladder({ selected, onSelect, counts }: { selected: number | null; onSelect: (l: number) => void; counts: number[] }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      {ESCALATION_LADDER.map((l) => (
        <button
          key={l.level}
          onClick={() => onSelect(l.level)}
          className={cn(
            "flex items-stretch border text-left transition-colors",
            selected === l.level ? "border-warn bg-ink-800" : "border-ink-700 bg-ink-850 hover:border-olive-600"
          )}
          style={{ marginLeft: `${l.level * 10}px` }}
        >
          <span className="mono flex w-10 shrink-0 items-center justify-center text-[14px] font-bold text-ink-950" style={{ background: LEVEL_TINT[l.level] }}>
            {l.level}
          </span>
          <span className="flex-1 px-2.5 py-1.5">
            <span className="block text-[12px] font-medium text-ink-100">{l.name}</span>
            <span className="mono block text-[10px] text-ink-400">
              {l.dateTime} · {counts[l.level]} events
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function LevelDetail({ level }: { level: number }) {
  const l = ESCALATION_LADDER[level];
  const { setModule, selectEvent, setEscalationHighlight } = useSim.getState();
  const events = ALL_EVENTS.filter((e) => e.escalationLevel === level);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mono text-[11px] text-ink-400">LEVEL {l.level}</div>
          <h2 className="text-[16px] font-semibold">{l.name}</h2>
          <div className="mono text-[12px] text-warn">{l.dateTime}</div>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEscalationHighlight(level);
            if (l.triggerEventIds[0]) selectEvent(l.triggerEventIds[0]);
            setModule("geospatial");
          }}
        >
          <MapIcon /> Show on map & timeline
        </Button>
      </div>
      <Card>
        <CardHeader title="Historical record" right={<EvidenceBadge cls="BLUE" />} />
        <div className="p-3">
          <KV
            k="Triggering event"
            v={
              <span className="flex flex-wrap gap-1">
                {l.triggerEventIds.map((id) => {
                  const e = ALL_EVENTS.find((x) => x.id === id);
                  return (
                    <button key={id} onClick={() => selectEvent(id)} className="border border-ink-600 px-1 text-left text-[11px] hover:border-olive-500">
                      <span className="mono text-ink-400">{id}</span> {e?.title}
                    </button>
                  );
                })}
              </span>
            }
          />
          <KV k="Date and time" v={l.dateTime} />
          <KV k="Domain" v={l.domain} />
          <KV k="Indian government account" v={l.governmentAccount} />
          <KV k="Reported adversary action" v={l.adversaryAction} />
          <KV k="Indian response" v={l.indianResponse} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Analysis" right={<EvidenceBadge cls="AMBER" />} />
        <div className="p-3">
          <KV k="Political implications" v={l.politicalImplications} />
          <KV k="Escalation significance" v={l.significance} />
          <p className="mt-1 text-[10px] text-ink-500">Analytical reconstruction – not an official statement.</p>
        </div>
      </Card>
      <Card>
        <CardHeader title={`Events tagged at level ${level} (${events.length})`} />
        <div className="space-y-1 p-2">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                selectEvent(e.id);
                setEscalationHighlight(level);
                setModule("geospatial");
              }}
              className="flex w-full items-center gap-2 border border-ink-700 bg-ink-900 px-2 py-1 text-left hover:border-olive-500"
            >
              <EvidenceBadge cls={e.evidenceClass} />
              <span className="mono text-[10px] text-ink-400">
                {e.id} {formatDateLabel(e.date)} {e.time ?? ""}
              </span>
              <span className="text-[12px] text-ink-100">{e.title}</span>
            </button>
          ))}
        </div>
      </Card>
      <div>
        <div className="label-caps mb-1">Source references</div>
        <SourceList ids={l.sources} />
      </div>
    </div>
  );
}

export function EscalationModule() {
  const mode = useSim((s) => s.scenarioMode);
  const highlight = useSim((s) => s.escalationHighlight);
  const setHighlight = useSim((s) => s.setEscalationHighlight);
  const [tab, setTab] = useState<"historical" | "tabletop">(mode === "hypothetical" ? "tabletop" : "historical");
  useEffect(() => setTab(mode === "hypothetical" ? "tabletop" : "historical"), [mode]);
  const [selected, setSelected] = useState<number>(highlight ?? 1);
  const counts = useMemo(() => ESCALATION_LADDER.map((l) => ALL_EVENTS.filter((e) => e.escalationLevel === l.level).length), []);

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="E" title="Escalation Matrix">
        <div className="flex overflow-hidden rounded-[3px] border border-ink-700 text-[11px]">
          <button
            onClick={() => setTab("historical")}
            className={`h-6 px-2 ${tab === "historical" ? "bg-olive-700 text-olive-300" : "bg-ink-800 text-ink-400"}`}
          >
            Historical ladder
          </button>
          <button onClick={() => setTab("tabletop")} className={`h-6 px-2 ${tab === "tabletop" ? "bg-warn/20 text-warn" : "bg-ink-800 text-ink-400"}`}>
            Hypothetical tabletop
          </button>
        </div>
        {highlight !== null && (
          <Button variant="ghost" size="sm" onClick={() => setHighlight(null)}>
            <X /> Clear highlight (L{highlight})
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => import("@/utils/reportExports").then((m) => m.exportEscalationPdf())}>
          <FileDown /> Matrix PDF
        </Button>
      </ModuleHeader>
      <div className="flex-1 overflow-auto p-3">
        {tab === "tabletop" ? (
          <TabletopExercise />
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[420px_1fr]">
            <div className="space-y-3">
              <Card className="p-3">
                <div className="label-caps mb-2">Escalation ladder (click a rung)</div>
                <Ladder
                  selected={selected}
                  counts={counts}
                  onSelect={(l) => {
                    setSelected(l);
                    setHighlight(l);
                  }}
                />
              </Card>
              <EscalationLineChart events={ALL_EVENTS} height={240} />
            </div>
            <LevelDetail level={selected} />
          </div>
        )}
      </div>
    </div>
  );
}
