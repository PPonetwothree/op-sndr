import { useState } from "react";
import { Plus, Trash2, Gavel, RotateCcw, ChevronsRight, Download, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useScenario, canAdvance, rungByTurn, currentRung, movesInTurn, type Inject, type Outcome, type Team } from "@/store/scenarioStore";
import { useAudit } from "@/store/auditStore";
import { Card, CardHeader, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { AXIS, GRID, TOOLTIP } from "@/components/charts/ChartCard";
import { ESCALATION_LEVELS, DOMAIN_LABEL } from "@/engine/assessmentEngine";
import { downloadText, toCsv } from "@/utils/download";

const input = "h-7 w-full border border-ink-600 bg-ink-900 px-1.5 text-[12px] outline-none focus:border-olive-500";
const TEAM_COLOR: Record<Team, string> = { Blue: "#5e78e6", Red: "#d24848", "Third party": "#aeb4bb" };
const OUTCOME_COLOR: Record<Outcome, string> = { accepted: "#16a08a", modified: "#b28c16", rejected: "#8a8f98" };

function MoveForm({ team }: { team: Team }) {
  const proposeMove = useScenario((s) => s.proposeMove);
  const [d, setD] = useState({ domain: "diplomatic" as Inject["domain"], description: "", level: 1, rationale: "" });
  const id = team.replace(" ", "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <label className="block">
        <span className="label-caps">{team} move</span>
        <input
          aria-label={`${team} move`}
          className={input}
          value={d.description}
          onChange={(e) => setD({ ...d, description: e.target.value })}
          placeholder="What does the team do?"
        />
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        <select
          aria-label={`${team} move domain`}
          className={input}
          value={d.domain}
          onChange={(e) => setD({ ...d, domain: e.target.value as Inject["domain"] })}
        >
          {["air", "land", "sea", "cyber_info", "diplomatic"].map((k) => (
            <option key={k} value={k}>
              {DOMAIN_LABEL[k]}
            </option>
          ))}
        </select>
        <select aria-label={`${team} intended rung`} className={input} value={d.level} onChange={(e) => setD({ ...d, level: Number(e.target.value) })}>
          {ESCALATION_LEVELS.map((_, i) => (
            <option key={i} value={i}>
              Intends L{i}
            </option>
          ))}
        </select>
      </div>
      <input
        aria-label={`${team} rationale`}
        className={input}
        value={d.rationale}
        onChange={(e) => setD({ ...d, rationale: e.target.value })}
        placeholder="Rationale / intended signal"
      />
      <Button
        size="sm"
        id={`propose-${id}`}
        disabled={!d.description.trim()}
        onClick={() => {
          proposeMove({ actor: team, ...d });
          setD({ ...d, description: "", rationale: "" });
        }}
      >
        <Plus /> Submit {team} move
      </Button>
    </div>
  );
}

function Ruling({ move }: { move: Inject }) {
  const { adjudicate, reopen, removeInject } = useScenario.getState();
  const umpire = useAudit((s) => s.analyst);
  const before = currentRung(useScenario.getState().scenario);
  const [outcome, setOutcome] = useState<Outcome>("accepted");
  const [rung, setRung] = useState(move.level);
  const [note, setNote] = useState("");
  if (move.adjudication) {
    const a = move.adjudication;
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge color={OUTCOME_COLOR[a.outcome]}>{a.outcome}</Badge>
        <span className="text-ink-300">→ L{a.rung}</span>
        {a.note && <span className="text-ink-400">“{a.note}”</span>}
        <span className="text-ink-500">· {a.umpire}</span>
        <button onClick={() => reopen(move.id)} className="ml-auto text-ink-400 hover:text-ink-100" aria-label="Reopen ruling" title="Reopen ruling">
          <RotateCcw className="size-3" />
        </button>
      </div>
    );
  }
  return (
    <div className="mt-1.5 grid grid-cols-[110px_90px_1fr_auto_auto] items-center gap-1">
      <select
        aria-label="Ruling"
        className={input}
        value={outcome}
        onChange={(e) => {
          const o = e.target.value as Outcome;
          setOutcome(o);
          if (o === "rejected") setRung(before);
          if (o === "accepted") setRung(move.level);
        }}
      >
        <option value="accepted">Accept</option>
        <option value="modified">Modify</option>
        <option value="rejected">Reject</option>
      </select>
      <select aria-label="Resulting rung" className={input} value={rung} disabled={outcome !== "modified"} onChange={(e) => setRung(Number(e.target.value))}>
        {ESCALATION_LEVELS.map((_, i) => (
          <option key={i} value={i}>
            → L{i}
          </option>
        ))}
      </select>
      <input aria-label="Umpire note" className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ruling note / effect" />
      <Button size="sm" onClick={() => adjudicate(move.id, { outcome, rung, note, umpire: umpire.trim() || "Umpire" })}>
        <Gavel /> Rule
      </Button>
      <Button variant="ghost" size="iconSm" onClick={() => removeInject(move.id)} aria-label="Withdraw move">
        <Trash2 />
      </Button>
    </div>
  );
}

export function TabletopExercise() {
  const { scenario, setMeta, advanceTurn, clear } = useScenario();
  const umpire = useAudit((s) => s.analyst);
  const setUmpire = useAudit((s) => s.setAnalyst);
  const turnMoves = movesInTurn(scenario, scenario.currentTurn);
  const trace = rungByTurn(scenario);
  const log = scenario.injects.filter((i) => i.adjudication).sort((a, b) => a.turn - b.turn || (a.adjudication!.ts > b.adjudication!.ts ? 1 : -1));
  const rows = log.map((i) => ({
    turn: i.turn,
    team: i.actor,
    domain: i.domain,
    move: i.description,
    rationale: i.rationale,
    intended_rung: i.level,
    ruling: i.adjudication!.outcome,
    resulting_rung: i.adjudication!.rung,
    umpire_note: i.adjudication!.note,
    umpire: i.adjudication!.umpire,
    ruled_at: i.adjudication!.ts,
  }));
  const fileBase = `tabletop-${scenario.title.replace(/\W+/g, "_").slice(0, 40)}`;

  return (
    <div className="space-y-3">
      <div className="border border-warn/50 bg-warn/10 px-3 py-2 text-[12px] text-warn">
        HYPOTHETICAL TABLETOP – educational exercise. Moves and rulings are invented by participants, stored separately, and never alter the historical
        reconstruction.
      </div>
      <Card className="grid grid-cols-1 gap-2 p-3 lg:grid-cols-[1fr_1fr_160px_200px]">
        <label>
          <span className="label-caps">Exercise title</span>
          <input className={input} value={scenario.title} onChange={(e) => setMeta({ title: e.target.value })} />
        </label>
        <label>
          <span className="label-caps">Premise</span>
          <input className={input} value={scenario.premise} onChange={(e) => setMeta({ premise: e.target.value })} />
        </label>
        <label>
          <span className="label-caps">Starting rung</span>
          <select className={input} value={scenario.startRung} onChange={(e) => setMeta({ startRung: Number(e.target.value) })}>
            {ESCALATION_LEVELS.map((n, i) => (
              <option key={i} value={i}>
                L{i} {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-caps">Umpire name</span>
          <input className={input} value={umpire} onChange={(e) => setUmpire(e.target.value)} placeholder="Recorded with each ruling (same as audit-log analyst)" />
        </label>
      </Card>

      <Card>
        <CardHeader
          title={`Turn ${scenario.currentTurn} · current rung L${currentRung(scenario)} – ${ESCALATION_LEVELS[currentRung(scenario)]}`}
          right={
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-ink-400">
                {turnMoves.filter((m) => m.adjudication).length}/{turnMoves.length} moves ruled
              </span>
              <Button size="sm" disabled={!canAdvance(scenario)} onClick={advanceTurn} title="All moves this turn need a ruling first">
                <ChevronsRight /> End turn {scenario.currentTurn}
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-2">
          {(["Blue", "Red"] as const).map((team) => (
            <div key={team} className="border-l-2 pl-3" style={{ borderColor: TEAM_COLOR[team] }}>
              <MoveForm team={team} />
              <div className="mt-2 space-y-1.5">
                {turnMoves
                  .filter((m) => m.actor === team)
                  .map((m) => (
                    <div key={m.id} className="border border-ink-700 bg-ink-900 p-2" data-testid="tabletop-move">
                      <div className="flex items-center gap-1.5">
                        <Badge color={TEAM_COLOR[team]}>{team}</Badge>
                        <span className="text-[12px] text-ink-100">{m.description}</span>
                        <span className="ml-auto mono text-[10px] text-ink-400">intends L{m.level}</span>
                      </div>
                      {m.rationale && <div className="text-[10px] text-ink-400">{m.rationale}</div>}
                      <Ruling move={m} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title={`Umpire log (${log.length} rulings)`}
            right={
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!rows.length}
                  onClick={() => downloadText(`${fileBase}-log.csv`, "﻿" + toCsv(rows), "text/csv")}
                >
                  <Download /> CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    downloadText(
                      `${fileBase}.json`,
                      JSON.stringify({ ...scenario, exportedAt: new Date().toISOString(), hypothetical: true }, null, 2),
                      "application/json"
                    )
                  }
                >
                  <Download /> Exercise JSON
                </Button>
                {scenario.injects.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => confirm("Clear the whole exercise?") && clear()}>
                    <X /> Clear
                  </Button>
                )}
              </div>
            }
          />
          <div className="max-h-[320px] overflow-auto" tabIndex={0} aria-label="Umpire log">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-ink-400">
                  {["Turn", "Team", "Move", "Ruling", "Rung", "Note", "Umpire"].map((h) => (
                    <th key={h} className="border-b border-ink-700 px-2 py-1 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map((i) => (
                  <tr key={i.id} className="border-b border-ink-800 align-top" data-testid="umpire-log-row">
                    <td className="mono px-2 py-1">{i.turn}</td>
                    <td className="px-2 py-1">{i.actor}</td>
                    <td className="px-2 py-1 text-ink-100">{i.description}</td>
                    <td className="px-2 py-1">{i.adjudication!.outcome}</td>
                    <td className="mono px-2 py-1">
                      L{i.level}→L{i.adjudication!.rung}
                    </td>
                    <td className="px-2 py-1 text-ink-300">{i.adjudication!.note}</td>
                    <td className="px-2 py-1 text-ink-400">{i.adjudication!.umpire}</td>
                  </tr>
                ))}
                {!log.length && (
                  <tr>
                    <td colSpan={7} className="px-2 py-2 text-ink-500">
                      No rulings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Rung at end of each turn" right={<Badge color="#b28c16">Hypothetical</Badge>} />
          <div className="h-[240px] p-2">
            <ResponsiveContainer>
              <LineChart data={trace} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="turn" {...AXIS} />
                <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} {...AXIS} />
                <Tooltip {...TOOLTIP} formatter={(v: number) => [`L${v} – ${ESCALATION_LEVELS[v]}`, "Rung"]} labelFormatter={(t) => `Turn ${t}`} />
                <Line isAnimationActive={false} type="stepAfter" dataKey="rung" stroke="#b28c16" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
