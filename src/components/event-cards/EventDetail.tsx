import { ExternalLink, RotateCw, X } from "lucide-react";
import { useSim, allSources, ALL_EVENTS } from "@/store/simulationStore";
import { TARGET_BY_ID, WEAPON_BY_ID } from "@/data";
import { Badge, KV } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "./EvidenceBadge";
import { CiteMark, EvidenceTrail } from "./Provenance";
import { useEffect, useRef, useState } from "react";
import type { CitationField } from "@/types";
import { damageLabel, DOMAIN_LABEL, EVENT_TYPE_LABEL, ESCALATION_LEVELS, EVIDENCE } from "@/engine/assessmentEngine";
import { formatDateLabel } from "@/engine/timelineEngine";
import { anchorLabel, VECTOR_STYLES } from "@/engine/vectorRenderer";
import type { TimedEvent } from "@/engine/eventEngine";

const NO_LINKS: string[] = [];

const RETRIEVAL: Record<string, string> = {
  read_in_full: "Read in full for this build",
  partially_read: "Partially read / confirmed via excerpt",
  cited_not_retrieved: "Cited – full text not retrieved",
  user_added: "Added manually",
};

export function SourceList({ ids }: { ids: string[] }) {
  const userSources = useSim((s) => s.userSources);
  const srcs = allSources(userSources);
  return (
    <div className="space-y-2">
      {ids.map((id) => {
        const s = srcs.find((x) => x.id === id);
        if (!s)
          return (
            <div key={id} className="text-hostile">
              Unknown source {id}
            </div>
          );
        return (
          <div key={id} className="border border-ink-700 bg-ink-900 p-2">
            <div className="flex items-start justify-between gap-2">
              <a href={s.url} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-ink-100 hover:text-olive-300">
                {s.title} <ExternalLink className="ml-0.5 inline size-3 text-ink-400" />
              </a>
              <EvidenceBadge cls={s.evidenceClass} />
            </div>
            <div className="mono mt-1 text-[10px] text-ink-400">
              {s.publisher} · {formatDateLabel(s.publicationDate)} · {s.id}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-ink-500">
              <span>{RETRIEVAL[s.retrieval]}</span>
              {s.archiveUrl ? (
                <a href={s.archiveUrl} target="_blank" rel="noreferrer" className="text-olive-300 hover:underline">
                  Archived copy ({s.archivedAt})
                </a>
              ) : (
                <span>No archive capture found</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventDetail({ e, onClose }: { e: TimedEvent; onClose?: () => void }) {
  const replay = () => useSim.setState((s) => ({ animationNonce: s.animationNonce + 1 }));
  const selectTarget = useSim((s) => s.selectTarget);
  const linked = useSim((s) => s.eventSourceLinks[e.id]) ?? NO_LINKS;
  const [focus, setFocus] = useState<CitationField | null>(null);
  const trailRef = useRef<HTMLElement>(null);
  useEffect(() => setFocus(null), [e.id]);
  const openCite = (f: CitationField) => {
    setFocus(f);
    requestAnimationFrame(() => trailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const cite = (f: CitationField) => <CiteMark citations={e.provenance} field={f} onOpen={openCite} />;
  const locs = [...new Set([...e.location.locationIds, ...e.targetIds])].map((id) => TARGET_BY_ID.get(id)).filter(Boolean);
  const vectorStyles = [...new Set(e.vectors.map((v) => v.style))];
  const origins = [...new Set(e.vectors.filter((v) => v.from !== v.to && !v.from.startsWith("FRONT:")).map((v) => anchorLabel(v.from)))];
  const ev = EVIDENCE[e.evidenceClass];
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-700 p-3" style={{ borderTop: `3px solid ${ev.color}` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="mono text-[11px] text-ink-400">{e.id}</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="iconSm" onClick={replay} title="Replay animation">
              <RotateCw />
            </Button>
            {onClose && (
              <Button variant="ghost" size="iconSm" onClick={onClose} title="Close">
                <X />
              </Button>
            )}
          </div>
        </div>
        <h3 className="mt-0.5 text-[14px] font-semibold leading-snug text-ink-100">{e.title}</h3>
        <div className="mono mt-1 text-[12px] text-warn">
          {formatDateLabel(e.date)} · {e.time ? `${e.time} IST` : "TIME UNKNOWN"}
        </div>
        <div className="text-[11px] text-ink-400">
          {e.timeLabel}
          {cite("time")}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <EvidenceBadge cls={e.evidenceClass} withDesc />
          <Badge color="#aeb4bb">{EVENT_TYPE_LABEL[e.eventType]}</Badge>
          <Badge color="#9aa874">{DOMAIN_LABEL[e.domain]}</Badge>
          <Badge color="#e3a83b">L{e.escalationLevel}</Badge>
          {e.sample && <Badge color="#e05252">SAMPLE DATA</Badge>}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-3">
        <p className="text-[12px] leading-relaxed text-ink-200">
          {e.description}
          {cite("description")}
        </p>

        <section>
          <div className="label-caps mb-1">Event record</div>
          <KV k="Actor" v={e.actor.replace("_", " ")} />
          <KV k="Reported by" v={e.reportedBy} />
          <KV
            k="Location"
            v={
              <>
                {`${e.location.name} (${e.location.region})`}
                {cite("location")}
              </>
            }
          />
          <KV k="Location precision" v={e.location.precision === "undisclosed" ? "UNDISCLOSED – not plotted" : e.location.precision} />
          <KV k="Escalation level" v={`${e.escalationLevel} – ${ESCALATION_LEVELS[e.escalationLevel]}`} />
          <KV k="Evidence type" v={e.evidenceType.replace(/_/g, " ")} />
          <KV k="Verified" v={e.verified ? "Yes – independently corroborated" : "No"} />
        </section>

        <section>
          <div className="label-caps mb-1">Weapon-system category {cite("weapons")}</div>
          <div className="text-[12px] text-ink-200">{e.weaponCategory || "UNKNOWN"}</div>
          {e.weaponSystemIds.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {e.weaponSystemIds.map((id) => {
                const w = WEAPON_BY_ID.get(id);
                return (
                  <span key={id} title={w?.usageNote} className="border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-[11px] text-ink-200">
                    {w?.name ?? id}
                    <span className="ml-1 text-[9px] uppercase text-ink-500">{w?.usageStatus.replace(/_/g, " ")}</span>
                  </span>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="label-caps mb-1">Formation {e.formation.representation !== "none" && cite("formation")}</div>
          {e.formation.representation === "none" ? (
            <div className="text-[12px] text-ink-400">Not applicable</div>
          ) : (
            <div className="border border-dashed border-ink-600 bg-ink-900 p-2">
              <div className="mono text-[11px] font-semibold text-warn">
                {e.formation.status === "publicly_described"
                  ? "PUBLICLY DESCRIBED"
                  : e.formation.status === "partially_disclosed"
                    ? "PARTIALLY DISCLOSED – ABSTRACT REPRESENTATION"
                    : "FORMATION UNKNOWN – ABSTRACT REPRESENTATION"}
              </div>
              {e.formation.publicDescription && <div className="mt-1 text-[11px] text-ink-300">{e.formation.publicDescription}</div>}
            </div>
          )}
        </section>

        <section>
          <div className="label-caps mb-1">Damage / outcome (as reported) {cite("damage")}</div>
          <KV k="Assessment" v={damageLabel(e)} />
          <KV k="Status" v={e.damageAssessment.status.replace(/_/g, " ")} />
          <KV k="Confidence" v={e.damageAssessment.confidence.toUpperCase()} />
          {e.casualties && (
            <KV
              k="Casualties"
              v={
                <span>
                  {e.casualties.killed !== null ? `${e.casualties.killed} killed` : "killed: UNKNOWN"}
                  {cite("casualties")}
                  {e.casualties.injured !== null ? `, ${e.casualties.injured} injured` : ""} — {e.casualties.category}
                  <span className="block text-[10px] text-ink-500">Stated by {e.casualties.statedBy}</span>
                </span>
              }
            />
          )}
        </section>

        {e.vectors.length > 0 && (
          <section>
            <div className="label-caps mb-1">Map representation</div>
            <div className="flex flex-wrap gap-1">
              {vectorStyles.map((s) => (
                <Badge key={s} color={VECTOR_STYLES[s].color}>
                  {VECTOR_STYLES[s].label}
                </Badge>
              ))}
            </div>
            {origins.length > 0 && <div className="mt-1 text-[11px] text-ink-400">Origin shown as: {origins.join("; ")}</div>}
            <div className="mt-1 text-[10px] text-warn/90">
              Illustrative geographic representation – not an actual flight path, firing solution or verified trajectory.
            </div>
          </section>
        )}

        {locs.length > 0 && (
          <section>
            <div className="label-caps mb-1">Locations ({locs.length})</div>
            <div className="flex flex-wrap gap-1">
              {locs.map((t) => (
                <button
                  key={t!.id}
                  onClick={() => selectTarget(t!.id)}
                  className="border border-ink-700 bg-ink-900 px-1.5 py-0.5 text-[11px] text-ink-300 hover:border-olive-500 hover:text-ink-100"
                >
                  {t!.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <section ref={trailRef}>
          <div className="label-caps mb-1">Evidence trail · {e.provenance.length} field-level citations</div>
          <EvidenceTrail key={e.id} citations={e.provenance} focus={focus} />
        </section>

        <section>
          <div className="label-caps mb-1">Sources ({e.sources.length})</div>
          <SourceList ids={e.sources} />
          {linked.length > 0 && (
            <>
              <div className="label-caps mb-1 mt-2">Analyst-linked sources ({linked.length}) · do not change the evidence class</div>
              <SourceList ids={linked} />
            </>
          )}
        </section>

        {e.notes && (
          <section>
            <div className="label-caps mb-1">Assessment notes</div>
            <p className="text-[11px] leading-relaxed text-ink-300">{e.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export function TargetDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const t = TARGET_BY_ID.get(id);
  const selectEvent = useSim((s) => s.selectEvent);
  if (!t) return null;
  const related = ALL_EVENTS.filter((e) => e.location.locationIds.includes(id) || e.targetIds.includes(id) || e.vectors.some((v) => v.to === id));
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-700 p-3">
        <div className="flex items-start justify-between">
          <div className="mono text-[11px] text-ink-400">{t.id}</div>
          <Button variant="ghost" size="iconSm" onClick={onClose} title="Close">
            <X />
          </Button>
        </div>
        <h3 className="text-[14px] font-semibold">{t.name}</h3>
        <div className="text-[11px] text-ink-400">
          {t.region} · {t.country}
        </div>
        <div className="mt-2 flex gap-1">
          <EvidenceBadge cls={t.evidenceClass} />
          <Badge color="#aeb4bb">{t.category.replace(/_/g, " ")}</Badge>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        <section>
          <KV k="Attributed to" v={t.attribution ?? "—"} />
          <KV
            k="Role in campaign"
            v={
              t.side === "indian_strike_target"
                ? "Indian-reported strike target"
                : t.side === "pakistani_attack_target"
                  ? "Location attacked (as reported by India)"
                  : "Context location"
            }
          />
          <KV
            k="Position"
            v={
              <span className="mono">
                {t.lat.toFixed(2)}, {t.lng.toFixed(2)}
              </span>
            }
          />
          <KV k="Precision" v={`${t.precision} – public gazetteer position, not a reported impact point`} />
        </section>
        {t.officialDescription && (
          <section>
            <div className="label-caps mb-1">Official description</div>
            <p className="text-[12px] leading-relaxed text-ink-200">{t.officialDescription}</p>
          </section>
        )}
        <section>
          <div className="label-caps mb-1">Associated events ({related.length})</div>
          <div className="space-y-1">
            {related.map((e) => (
              <button
                key={e.id}
                onClick={() => selectEvent(e.id)}
                className="block w-full border border-ink-700 bg-ink-900 p-1.5 text-left hover:border-olive-500"
              >
                <div className="mono text-[10px] text-ink-400">
                  {e.id} · {formatDateLabel(e.date)} {e.time ?? ""}
                </div>
                <div className="text-[12px] text-ink-100">{e.title}</div>
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="label-caps mb-1">Sources</div>
          <SourceList ids={t.sources} />
        </section>
        <p className="text-[10px] text-ink-500">
          Battle-damage assessment records for this location are part of Module D (next phase). No imagery is shown or simulated.
        </p>
      </div>
    </div>
  );
}
