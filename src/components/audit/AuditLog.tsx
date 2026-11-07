import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useAudit, type AuditEntry } from "@/store/auditStore";
import { Card, CardHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { downloadText, toCsv } from "@/utils/download";

const ACTION_LABEL: Record<AuditEntry["action"], string> = {
  "bda.update": "BDA edit",
  "bda.reset": "BDA baseline restored",
  "bda.resetAll": "All BDA edits discarded",
  "source.add": "Source added",
  "source.remove": "Source removed",
  "source.link": "Source linked",
  "source.unlink": "Source unlinked",
  "session.load": "Session loaded",
};

function Changes({ e }: { e: AuditEntry }) {
  if (!e.changes.length) return null;
  return (
    <table className="mt-1 w-full text-[11px]">
      <tbody>
        {e.changes.map((c) => (
          <tr key={c.field} className="align-top">
            <td className="mono w-[150px] py-0.5 pr-2 text-ink-400">{c.field}</td>
            <td className="py-0.5 pr-2 text-hostile/90 line-through decoration-hostile/40">{c.before}</td>
            <td className="py-0.5 text-defensive">{c.after}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AuditEntries({ entries, empty }: { entries: AuditEntry[]; empty: string }) {
  if (!entries.length) return <div className="p-2 text-[11px] text-ink-500">{empty}</div>;
  return (
    <ol className="space-y-2">
      {entries.map((e) => (
        <li key={e.id} className="border-l-2 border-ink-600 pl-2" data-testid="audit-entry">
          <div className="mono text-[10px] text-ink-500">
            {new Date(e.ts).toLocaleString()} · {e.analyst} · {ACTION_LABEL[e.action]} · {e.target}
          </div>
          <div className="text-[12px] text-ink-100">{e.summary}</div>
          <Changes e={e} />
        </li>
      ))}
    </ol>
  );
}

/** Revision history for one record (e.g. a BDA target). */
export function RevisionHistory({ target }: { target: string }) {
  const all = useAudit((s) => s.entries);
  const entries = useMemo(() => all.filter((e) => e.target === target && e.action.startsWith("bda.")), [all, target]);
  return (
    <Card>
      <CardHeader title={`Revision history (${entries.length})`} />
      <div className="p-3">
        <AuditEntries entries={entries} empty="No analyst edits – the record shows the source-derived baseline." />
      </div>
    </Card>
  );
}

export function AuditLogPanel() {
  const { entries, analyst, setAnalyst, clear } = useAudit();
  const [filter, setFilter] = useState("");
  const shown = entries.filter((e) => !filter || e.action.startsWith(filter));
  const exportCsv = () =>
    downloadText(
      "sindoor-audit-log.csv",
      "﻿" +
        toCsv(
          entries.map((e) => ({
            timestamp: e.ts,
            analyst: e.analyst,
            action: e.action,
            target: e.target,
            summary: e.summary,
            changes: e.changes.map((c) => `${c.field}: ${c.before} -> ${c.after}`),
          }))
        ),
      "text/csv"
    );
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title={`Audit log (${entries.length})`}
          right={
            <div className="flex items-center gap-1">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-6 border border-ink-600 bg-ink-900 px-1 text-[11px]"
                aria-label="Filter audit log"
              >
                <option value="">All actions</option>
                <option value="bda.">BDA</option>
                <option value="source.">Sources</option>
                <option value="session.">Sessions</option>
              </select>
              <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!entries.length}>
                <Download /> Audit CSV
              </Button>
            </div>
          }
        />
        <div className="max-h-[calc(100vh-220px)] overflow-auto p-3">
          <AuditEntries entries={shown} empty="No changes recorded in this browser yet." />
        </div>
      </Card>
      <div className="space-y-3">
        <Card className="p-3">
          <label className="block">
            <span className="label-caps">Analyst name (recorded with each change)</span>
            <input
              value={analyst}
              onChange={(e) => setAnalyst(e.target.value)}
              placeholder="e.g. A. Analyst"
              className="mt-1 h-7 w-full border border-ink-600 bg-ink-900 px-1.5 text-[12px] outline-none focus:border-olive-500"
            />
          </label>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-500">
            The log is append-only during use, stored in this browser, included in saved sessions and exportable as CSV. It records BDA edits with field-level
            before/after values, source additions, removals and links, and session loads.
          </p>
        </Card>
        <Card className="p-3">
          <Button
            variant="danger"
            size="sm"
            disabled={!entries.length}
            onClick={() => confirm("Permanently clear the audit log in this browser? Export it first if you need it.") && clear()}
          >
            <Trash2 /> Clear audit log
          </Button>
        </Card>
      </div>
    </div>
  );
}
