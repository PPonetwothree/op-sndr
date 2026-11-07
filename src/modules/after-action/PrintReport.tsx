import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import { ESCALATION_LADDER } from "@/data/escalation";
import { AAR_SECTIONS } from "@/data/afterAction";
import { CLAIM_LABEL, type BdaRecord } from "@/engine/bdaEngine";
import { formatDateLabel } from "@/engine/timelineEngine";
import { EVIDENCE } from "@/engine/assessmentEngine";
import type { TimedEvent } from "@/engine/eventEngine";
import type { Source } from "@/types";
import type { ScoreRow } from "./scorecard";

const th = "border border-neutral-400 bg-neutral-200 px-1.5 py-1 text-left font-semibold";
const td = "border border-neutral-300 px-1.5 py-0.5 align-top";

export function PrintReport({ events, bda, sources, score, onClose }: { events: TimedEvent[]; bda: BdaRecord[]; sources: Source[]; score: ScoreRow[]; onClose: () => void }) {
  useEffect(() => {
    document.body.classList.add("printing-report");
    return () => document.body.classList.remove("printing-report");
  }, []);
  return createPortal(
    <div className="print-report fixed inset-0 z-[5000] overflow-auto bg-white text-[11px] text-neutral-900">
      <div className="no-print sticky top-0 flex justify-end gap-2 border-b border-neutral-300 bg-neutral-100 p-2">
        <button onClick={() => window.print()} className="flex items-center gap-1 rounded bg-neutral-800 px-3 py-1 text-white">
          <Printer className="size-3.5" /> Print / Save as PDF
        </button>
        <button onClick={onClose} className="flex items-center gap-1 rounded border border-neutral-400 px-3 py-1">
          <X className="size-3.5" /> Close
        </button>
      </div>
      <article className="mx-auto max-w-[1000px] p-8">
        <h1 className="text-2xl font-bold tracking-wider">OPERATION SINDOOR – CAMPAIGN REPORT</h1>
        <p className="text-neutral-600">Historical reconstruction · 7–10 May 2025 · generated {new Date().toLocaleString()}</p>
        <p className="mt-2 border-l-4 border-neutral-500 pl-2 text-neutral-700">
          Built from public Indian government accounts. Official claims are not independently verified unless marked GREEN. Map vectors and formations are illustrative. Unavailable data is shown as UNKNOWN; no numerical effectiveness scores are assigned.
        </p>
        <p className="mt-1 text-neutral-600">Evidence classes: {Object.entries(EVIDENCE).map(([k, v]) => `${k} – ${v.desc}`).join(" · ")}</p>

        <h2 className="mt-6 text-lg font-bold">Analytical scorecard</h2>
        <table className="mt-1 w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Dimension</th>
              <th className={th}>Official account</th>
              <th className={th}>Measures (record counts / stated facts)</th>
              <th className={th}>Evidence status</th>
              <th className={th}>Numerical score</th>
            </tr>
          </thead>
          <tbody>
            {score.map((r) => (
              <tr key={r.dimension}>
                <td className={td}>{r.dimension}</td>
                <td className={td}>{r.officialAccount}</td>
                <td className={td}>{r.measures.map(([k, v]) => `${k}: ${v}`).join("; ")}</td>
                <td className={td}>{r.status}</td>
                <td className={td}>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-6 text-lg font-bold">Escalation matrix</h2>
        <table className="mt-1 w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Lvl</th>
              <th className={th}>Rung</th>
              <th className={th}>Date / time</th>
              <th className={th}>Indian government account</th>
              <th className={th}>Indian response</th>
              <th className={th}>Significance (analytical)</th>
            </tr>
          </thead>
          <tbody>
            {ESCALATION_LADDER.map((l) => (
              <tr key={l.level}>
                <td className={td}>{l.level}</td>
                <td className={td}>{l.name}</td>
                <td className={td}>{l.dateTime}</td>
                <td className={td}>{l.governmentAccount}</td>
                <td className={td}>{l.indianResponse}</td>
                <td className={td}>{l.significance}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-6 text-lg font-bold">After-action review</h2>
        {AAR_SECTIONS.map((s) => (
          <section key={s.id} className="mt-2 break-inside-avoid">
            <h3 className="font-bold">
              {s.id}. {s.title}
            </h3>
            {s.blocks.map((b) => (
              <div key={b.heading} className="ml-2">
                <div className="font-semibold">{b.heading}</div>
                <ul className="ml-4 list-disc">
                  {b.items.map((it, i) => (
                    <li key={i}>
                      <span className="text-neutral-500">[{it.basis.replace(/_/g, " ")}]</span> {it.text} {it.sources.length > 0 && <span className="text-neutral-500">({it.sources.join(", ")})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <h2 className="mt-6 text-lg font-bold">Event timeline ({events.length})</h2>
        <table className="mt-1 w-full border-collapse">
          <thead>
            <tr>
              {["ID", "Date", "Time", "Event", "Actor", "Evidence", "Sources"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="break-inside-avoid">
                <td className={td}>{e.id}</td>
                <td className={td}>{formatDateLabel(e.date)}</td>
                <td className={td}>{e.time ?? "UNKNOWN"}</td>
                <td className={td}>{e.title}</td>
                <td className={td}>{e.actor.replace("_", " ")}</td>
                <td className={td}>{e.evidenceClass}</td>
                <td className={td}>{e.sources.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-6 text-lg font-bold">Battle damage assessment ({bda.length})</h2>
        <table className="mt-1 w-full border-collapse">
          <thead>
            <tr>
              {["Target", "Region", "Level", "Claim status", "Condition", "Confidence"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bda.map((r) => (
              <tr key={r.targetId} className="break-inside-avoid">
                <td className={td}>{r.targetName}</td>
                <td className={td}>{r.region}</td>
                <td className={td}>{r.damageLevel ?? "UNKNOWN"}</td>
                <td className={td}>{CLAIM_LABEL[r.claimStatus]}</td>
                <td className={td}>{r.infrastructureCondition}</td>
                <td className={td}>{r.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-6 text-lg font-bold">Sources ({sources.length})</h2>
        <ol className="ml-4 list-decimal">
          {sources.map((s) => (
            <li key={s.id}>
              <b>{s.id}</b> – {s.title}. {s.publisher}, {formatDateLabel(s.publicationDate)}. [{s.evidenceClass}; {s.retrieval.replace(/_/g, " ")}] <span className="break-all text-neutral-600">{s.url}</span>
            </li>
          ))}
        </ol>
      </article>
    </div>,
    document.body
  );
}
