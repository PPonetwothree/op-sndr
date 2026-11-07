import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, FileDown, Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ESCALATION_LADDER } from "@/data/escalation";
import { useSim, ALL_EVENTS } from "@/store/simulationStore";
import { useScenario, type Inject } from "@/store/scenarioStore";
import { Card, CardHeader, Badge, KV } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SourceList } from "@/components/event-cards/EventDetail";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import { EscalationLineChart } from "@/components/charts/CampaignCharts";
import { AXIS, GRID, TOOLTIP } from "@/components/charts/ChartCard";
import { formatDateLabel } from "@/engine/timelineEngine";
import { ESCALATION_LEVELS, DOMAIN_LABEL } from "@/engine/assessmentEngine";
import { exportEscalationPdf } from "@/utils/reportExports";
import { ModuleHeader } from "../ModuleHeader";
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

function Tabletop() {
  const { scenario, setMeta, addInject, removeInject, moveInject, clear } = useScenario();
  const [d, setD] = useState<Omit<Inject, "id" | "step">>({ actor: "Blue", domain: "diplomatic", description: "", level: 0, rationale: "" });
  const input = "h-7 border border-ink-600 bg-ink-900 px-1.5 text-[12px] outline-none focus:border-olive-500";
  const data = scenario.injects.map((i) => ({ step: i.step, level: i.level, label: `${i.actor}: ${i.description}` }));
  return (
    <div className="space-y-3">
      <div className="border border-warn/50 bg-warn/10 px-3 py-2 text-[12px] text-warn">
        HYPOTHETICAL SCENARIO MODE – educational tabletop analysis. Injects here are invented by the user, are stored separately and never alter the historical
        reconstruction.
      </div>
      <Card className="p-3">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Exercise title</span>
            <input className={input} value={scenario.title} onChange={(e) => setMeta({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Premise</span>
            <input className={input} value={scenario.premise} onChange={(e) => setMeta({ premise: e.target.value })} />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-[100px_130px_1fr_1fr_160px_auto] lg:items-end">
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Actor</span>
            <select className={input} value={d.actor} onChange={(e) => setD({ ...d, actor: e.target.value as Inject["actor"] })}>
              {["Blue", "Red", "Third party"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Domain</span>
            <select className={input} value={d.domain} onChange={(e) => setD({ ...d, domain: e.target.value as Inject["domain"] })}>
              {["air", "land", "sea", "cyber_info", "diplomatic"].map((a) => (
                <option key={a} value={a}>
                  {DOMAIN_LABEL[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Inject / move</span>
            <input
              className={input}
              value={d.description}
              onChange={(e) => setD({ ...d, description: e.target.value })}
              placeholder="e.g. Red announces airspace closure"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Discussion rationale</span>
            <input className={input} value={d.rationale} onChange={(e) => setD({ ...d, rationale: e.target.value })} />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="label-caps">Resulting rung</span>
            <select className={input} value={d.level} onChange={(e) => setD({ ...d, level: Number(e.target.value) })}>
              {ESCALATION_LEVELS.map((n, i) => (
                <option key={i} value={i}>
                  L{i} {n}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={!d.description.trim()}
            onClick={() => {
              addInject(d);
              setD({ ...d, description: "", rationale: "" });
            }}
          >
            <Plus /> Add inject
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={`Inject sequence (${scenario.injects.length})`}
            right={
              scenario.injects.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => confirm("Clear the hypothetical scenario?") && clear()}>
                  <X /> Clear
                </Button>
              )
            }
          />
          <div className="space-y-1 p-2">
            {scenario.injects.length === 0 && <div className="p-2 text-[11px] text-ink-500">No injects yet.</div>}
            {scenario.injects.map((i) => (
              <div key={i.id} className="flex items-center gap-2 border border-ink-700 bg-ink-900 px-2 py-1">
                <span className="mono w-6 text-[11px] text-ink-400">#{i.step}</span>
                <Badge color={i.actor === "Blue" ? "#4a86dc" : i.actor === "Red" ? "#d24848" : "#aeb4bb"}>{i.actor}</Badge>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-ink-100">{i.description}</span>
                  {i.rationale && <span className="block text-[10px] text-ink-500">{i.rationale}</span>}
                </span>
                <Badge color="#e3a83b">L{i.level}</Badge>
                <button onClick={() => moveInject(i.id, -1)} aria-label="Move up" className="text-ink-500 hover:text-ink-100">
                  <ArrowUp className="size-3" />
                </button>
                <button onClick={() => moveInject(i.id, 1)} aria-label="Move down" className="text-ink-500 hover:text-ink-100">
                  <ArrowDown className="size-3" />
                </button>
                <button onClick={() => removeInject(i.id)} aria-label="Delete inject" className="text-ink-500 hover:text-hostile">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Hypothetical escalation trace" right={<Badge color="#e3a83b">Hypothetical</Badge>} />
          <div className="h-[240px] p-2">
            {data.length ? (
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="step" {...AXIS} />
                  <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} {...AXIS} />
                  <Tooltip {...TOOLTIP} formatter={(v: number) => [`L${v} – ${ESCALATION_LEVELS[v]}`, "Rung"]} labelFormatter={(s) => `Step ${s}`} />
                  <Line isAnimationActive={false} type="stepAfter" dataKey="level" stroke="#e3a83b" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="p-2 text-[11px] text-ink-500">Add injects to draw the trace.</div>
            )}
          </div>
        </Card>
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
        <Button variant="secondary" size="sm" onClick={exportEscalationPdf}>
          <FileDown /> Matrix PDF
        </Button>
      </ModuleHeader>
      <div className="flex-1 overflow-auto p-3">
        {tab === "tabletop" ? (
          <Tabletop />
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
