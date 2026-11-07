import { useState } from "react";
import { Quote, ExternalLink } from "lucide-react";
import { useSim, allSources } from "@/store/simulationStore";
import { EvidenceBadge } from "./EvidenceBadge";
import type { Citation, CitationField } from "@/types";
import { cn } from "@/utils/cn";

const FIELD_LABEL: Record<CitationField, string> = {
  time: "Time",
  location: "Location",
  description: "Description",
  casualties: "Casualties",
  damage: "Damage / outcome",
  weapons: "Weapons",
  formation: "Formation",
  attribution: "Attribution",
};

/** Inline marker next to a field: number of citations, click to jump to the evidence trail entry. */
export function CiteMark({ citations, field, onOpen }: { citations: Citation[]; field: CitationField; onOpen: (f: CitationField) => void }) {
  const n = citations.filter((c) => c.field === field).length;
  if (!n)
    return (
      <span className="ml-1 text-[9px] uppercase tracking-wider text-ink-500" title="No field-level citation">
        uncited
      </span>
    );
  return (
    <button
      onClick={() => onOpen(field)}
      className="ml-1 inline-flex items-center gap-0.5 rounded-[2px] border border-friendly/40 px-1 text-[9px] font-semibold text-friendly hover:bg-friendly/10"
      title={`${n} citation(s) – show evidence`}
      aria-label={`Show ${n} citation(s) for ${FIELD_LABEL[field]}`}
    >
      <Quote className="size-2.5" />
      {n}
    </button>
  );
}

export function EvidenceTrail({ citations, focus }: { citations: Citation[]; focus: CitationField | null }) {
  const sources = allSources(useSim((s) => s.userSources));
  const [all, setAll] = useState(false);
  const fields = [...new Set(citations.map((c) => c.field))];
  const shown = all || !focus ? fields : fields.filter((f) => f === focus);
  return (
    <div className="space-y-2" data-testid="evidence-trail">
      {focus && !all && (
        <button className="text-[10px] text-ink-400 underline hover:text-ink-100" onClick={() => setAll(true)}>
          Showing {FIELD_LABEL[focus]} · show all fields
        </button>
      )}
      {shown.map((f) => (
        <div key={f}>
          <div className={cn("mb-1 text-[10px] font-semibold uppercase tracking-wider", f === focus ? "text-warn" : "text-olive-300")}>{FIELD_LABEL[f]}</div>
          <div className="space-y-1.5">
            {citations
              .filter((c) => c.field === f)
              .map((c, i) => {
                const s = sources.find((x) => x.id === c.sourceId);
                return (
                  <figure key={i} className="border-l-2 border-ink-600 bg-ink-900 py-1 pl-2 pr-1">
                    <blockquote className="text-[12px] italic leading-snug text-ink-100">“{c.excerpt}”</blockquote>
                    {c.note && <div className="mt-0.5 text-[10px] text-ink-400">{c.note}</div>}
                    <figcaption className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-ink-400">
                      {s && <EvidenceBadge cls={s.evidenceClass} />}
                      {s ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-ink-300 hover:text-olive-300">
                          {s.title} <ExternalLink className="inline size-2.5" />
                        </a>
                      ) : (
                        c.sourceId
                      )}
                      <span>· {c.locator}</span>
                    </figcaption>
                  </figure>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
