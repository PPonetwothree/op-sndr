import { useMemo, useState } from "react";
import { Pencil, RotateCcw, Map as MapIcon, ExternalLink } from "lucide-react";
import { useBda, useBdaRecords } from "@/store/bdaStore";
import { useSim, allSources, ALL_EVENTS } from "@/store/simulationStore";
import { CLAIM_LABEL, type BdaRecord, type ClaimStatus } from "@/engine/bdaEngine";
import { DAMAGE_RAMP, CLAIM_COLOR } from "@/engine/analytics";
import { formatDateLabel } from "@/engine/timelineEngine";
import { Card, CardHeader, Badge, KV } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import { InfrastructureSchematic, DamageScale } from "@/components/bda/InfrastructureSchematic";
import { BdaEditor } from "@/components/bda/BdaEditor";
import { DamageDistributionChart, InfrastructureStatusChart, ClaimsChart } from "@/components/charts/CampaignCharts";
import { ModuleHeader } from "../ModuleHeader";
import { RevisionHistory } from "@/components/audit/AuditLog";
import { AccountsCompared } from "@/components/event-cards/AccountsCompared";
import { cn } from "@/utils/cn";
import { exportBdaCsv } from "@/utils/exports";

function EvidenceTimeline({ r }: { r: BdaRecord }) {
  const sources = allSources(useSim((s) => s.userSources));
  return (
    <ol className="relative ml-2 border-l border-ink-600">
      {r.evidenceTimeline.map((ev, i) => {
        const s = sources.find((x) => x.id === ev.sourceId);
        return (
          <li key={i} className="mb-2 ml-3">
            <span
              className="absolute -left-[4px] mt-1 h-2 w-2 rounded-full"
              style={{ background: s ? (s.evidenceClass === "GREEN" ? "#5fbf7a" : s.evidenceClass === "BLUE" ? "#4f8fe6" : "#e3a83b") : "#888" }}
            />
            <div className="mono text-[10px] text-ink-400">
              {formatDateLabel(ev.date)} · {ev.sourceId}
              {ev.eventId ? ` · ${ev.eventId}` : ""}
            </div>
            <div className="text-[11px] text-ink-200">
              {s ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-olive-300">
                  {s.title} <ExternalLink className="inline size-2.5" />
                </a>
              ) : (
                ev.sourceId
              )}
            </div>
            <div className="text-[10px] text-ink-500">{ev.note}</div>
          </li>
        );
      })}
    </ol>
  );
}

function RecordView({ r }: { r: BdaRecord }) {
  const [editing, setEditing] = useState(false);
  const { update, reset } = useBda.getState();
  const { selectEvent, setModule } = useSim.getState();
  const events = ALL_EVENTS.filter((e) => r.associatedEventIds.includes(e.id));
  const verified = r.claimStatus === "independently_verified";
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mono text-[11px] text-ink-400">{r.targetId}</div>
          <h2 className="text-[16px] font-semibold">{r.targetName}</h2>
          <div className="text-[11px] text-ink-400">
            {r.region} · {r.country} · {r.category.replace(/_/g, " ")}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge color={CLAIM_COLOR[r.claimStatus]}>{CLAIM_LABEL[r.claimStatus]}</Badge>
            <Badge color="#aeb4bb">Confidence {r.confidence}</Badge>
            {r.edited && <Badge color="#e3a83b">Edited {r.editedAt ? new Date(r.editedAt).toLocaleString() : ""}</Badge>}
          </div>
        </div>
        <div className="flex gap-1">
          {!editing && (
            <Button size="sm" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
          )}
          {r.edited && (
            <Button size="sm" variant="secondary" onClick={() => reset(r.targetId)} title="Discard edits and restore the source-derived baseline">
              <RotateCcw /> Baseline
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <Card className="p-3">
          <BdaEditor
            record={r}
            onCancel={() => setEditing(false)}
            onSave={(x) => {
              update(x);
              setEditing(false);
            }}
          />
        </Card>
      ) : (
        <>
          <InfrastructureSchematic record={r} />
          <div>
            <div className="label-caps mb-1">Damage classification</div>
            <DamageScale level={r.damageLevel} />
            <div className={cn("mt-1 text-[11px]", verified ? "text-defensive" : "text-warn")}>
              {r.damageLevel === 5
                ? verified
                  ? "Destruction independently established."
                  : "Destruction CLAIMED by the government – not independently verified."
                : verified
                  ? "Independently verified assessment."
                  : "Not independently verified."}
            </div>
          </div>
          <Card>
            <CardHeader title="Assessment record" />
            <div className="p-3">
              <KV k="Target ID" v={<span className="mono">{r.targetId}</span>} />
              <KV k="Target name" v={r.targetName} />
              <KV k="Geographic region" v={r.region} />
              <KV k="Target category" v={r.category.replace(/_/g, " ")} />
              <KV
                k="Associated events"
                v={
                  <span className="flex flex-wrap gap-1">
                    {events.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          selectEvent(e.id);
                          setModule("geospatial");
                        }}
                        className="mono border border-ink-600 px-1 text-[10px] hover:border-olive-500"
                        title={e.title}
                      >
                        <MapIcon className="mr-0.5 inline size-2.5" />
                        {e.id}
                      </button>
                    ))}
                  </span>
                }
              />
              <KV k="Reported weapon category" v={r.reportedWeaponCategory} />
              <KV k="Reported damage" v={<span className="whitespace-pre-line">{r.reportedDamage}</span>} />
              <KV k="Infrastructure condition" v={r.infrastructureCondition} />
              <KV k="Functional status" v={r.functionalStatus} />
              <KV k="Secondary damage" v={r.secondaryDamage} />
              <KV k="Civilian impact" v={r.civilianImpact} />
              <KV k="Assessment confidence" v={r.confidence.toUpperCase()} />
              {r.notes && <KV k="Analyst notes" v={r.notes} />}
            </div>
          </Card>
          <Card>
            <CardHeader title="Before / after imagery" />
            <div className="p-3 text-[11px]">
              {r.imagery.length === 0 ? (
                <span className="text-ink-500">
                  No publicly available, properly sourced imagery is linked to this record. Imagery is never generated or simulated. Analysts can attach a
                  sourced link via Edit.
                </span>
              ) : (
                r.imagery.map((im, i) => (
                  <a key={i} href={im.url} target="_blank" rel="noreferrer" className="block text-olive-300 hover:underline">
                    {im.caption} <span className="text-ink-500">({im.sourceId})</span> <ExternalLink className="inline size-2.5" />
                  </a>
                ))
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title="Evidence timeline & sources" />
            <div className="p-3">
              <EvidenceTimeline r={r} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Accounts compared (associated events)" />
            <div className="space-y-3 p-3">
              {events.map((e) => (
                <div key={e.id}>
                  <div className="mono mb-1 text-[10px] text-ink-400">
                    {e.id} · {e.title}
                  </div>
                  <AccountsCompared accounts={e.accounts} />
                </div>
              ))}
            </div>
          </Card>
          <RevisionHistory target={r.targetId} />
        </>
      )}
    </div>
  );
}

const SIDES: [string, string][] = [
  ["indian_strike_target", "Indian strike targets"],
  ["pakistani_attack_target", "Locations attacked (India)"],
  ["context", "Context"],
];

export function AssessmentModule() {
  const records = useBdaRecords();
  const selectedTargetId = useSim((s) => s.selectedTargetId);
  const selectTarget = useSim((s) => s.selectTarget);
  const [side, setSide] = useState<string>("indian_strike_target");
  const [claim, setClaim] = useState<string>("");
  const resetAll = useBda((s) => s.resetAll);
  const edits = useBda((s) => s.edits);

  const list = useMemo(() => records.filter((r) => (!side || r.side === side) && (!claim || r.claimStatus === claim)), [records, side, claim]);
  const current = records.find((r) => r.targetId === selectedTargetId) ?? list[0];

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="D" title="Battle Damage Assessment">
        {Object.keys(edits).length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => confirm("Discard all BDA edits and restore source-derived baselines?") && resetAll()}>
            <RotateCcw /> Reset all edits ({Object.keys(edits).length})
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => exportBdaCsv(records)}>
          BDA CSV
        </Button>
      </ModuleHeader>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-ink-700 bg-ink-900">
          <div className="space-y-1.5 border-b border-ink-700 p-2">
            <select
              aria-label="Filter records by role"
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="h-7 w-full border border-ink-700 bg-ink-900 px-1 text-[12px]"
            >
              <option value="">All records ({records.length})</option>
              {SIDES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l} ({records.filter((r) => r.side === k).length})
                </option>
              ))}
            </select>
            <select
              aria-label="Filter records by claim status"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="h-7 w-full border border-ink-700 bg-ink-900 px-1 text-[12px]"
            >
              <option value="">Any claim status</option>
              {(Object.keys(CLAIM_LABEL) as ClaimStatus[]).map((c) => (
                <option key={c} value={c}>
                  {CLAIM_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-auto p-1">
            {list.map((r) => (
              <button
                key={r.targetId}
                onClick={() => selectTarget(r.targetId)}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-2 border-l-2 px-2 py-1.5 text-left",
                  current?.targetId === r.targetId ? "border-warn bg-ink-800" : "border-transparent hover:bg-ink-850"
                )}
              >
                <span
                  className="mono flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-semibold"
                  style={{ background: r.damageLevel === null ? "#3a3f45" : DAMAGE_RAMP[r.damageLevel], color: (r.damageLevel ?? 0) >= 3 ? "#fff" : "#15171a" }}
                >
                  {r.damageLevel ?? "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] text-ink-100">{r.targetName}</span>
                  <span className="block truncate text-[10px] text-ink-500">{CLAIM_LABEL[r.claimStatus]}</span>
                </span>
                {r.edited && <span className="h-1.5 w-1.5 rounded-full bg-warn" title="Edited" />}
              </button>
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1 overflow-auto p-4">
          {current ? <RecordView key={current.targetId} r={current} /> : <div className="text-ink-400">No records match.</div>}
        </div>
        <aside tabIndex={0} aria-label="BDA charts" className="w-[380px] shrink-0 space-y-3 overflow-auto border-l border-ink-700 bg-ink-900 p-3">
          <ClaimsChart records={records} />
          <InfrastructureStatusChart records={records} />
          <DamageDistributionChart records={records} height={240} />
          <div className="flex flex-wrap gap-1 text-[10px] text-ink-500">
            Evidence colours: <EvidenceBadge cls="GREEN" /> <EvidenceBadge cls="BLUE" /> <EvidenceBadge cls="AMBER" />
          </div>
        </aside>
      </div>
    </div>
  );
}
