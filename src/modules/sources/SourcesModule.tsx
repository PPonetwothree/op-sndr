import { useMemo, useState } from "react";
import { ExternalLink, Plus, Trash2, Link2 } from "lucide-react";
import { SourceSchema } from "@/schemas/referenceSchema";
import { useSim, allSources, ALL_EVENTS } from "@/store/simulationStore";
import { EVENTS, TARGETS, WEAPONS } from "@/data";
import { Card, CardHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import { formatDateLabel } from "@/engine/timelineEngine";
import { EVIDENCE } from "@/engine/assessmentEngine";
import type { EvidenceClass, Source } from "@/types";
import { ModuleHeader } from "../ModuleHeader";
import { AuditLogPanel } from "@/components/audit/AuditLog";
import { useAudit } from "@/store/auditStore";
import { downloadText, toCsv } from "@/utils/download";

const RETRIEVAL: Record<string, string> = {
  read_in_full: "Read in full",
  partially_read: "Partially read",
  cited_not_retrieved: "Cited – not retrieved",
  user_added: "Added manually",
};

const input = "h-7 w-full border border-ink-600 bg-ink-900 px-1.5 text-[12px] outline-none focus:border-olive-500";

function AddSourceForm() {
  const addUserSource = useSim((s) => s.addUserSource);
  const userSources = useSim((s) => s.userSources);
  const [f, setF] = useState({
    title: "",
    publisher: "",
    publicationDate: "",
    url: "",
    sourceType: "media" as Source["sourceType"],
    evidenceClass: "AMBER" as EvidenceClass,
    notes: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const submit = () => {
    const id = `SRC-USER-${String(userSources.length + 1).padStart(3, "0")}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const candidate = { ...f, id, retrieval: "user_added" as const };
    const res = SourceSchema.safeParse(candidate);
    if (!res.success) {
      setErr(res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      setOk(null);
      return;
    }
    if (f.evidenceClass === "GREEN" && f.sourceType !== "independent") {
      setErr("GREEN (independently corroborated) is only available for sources of type 'independent'.");
      return;
    }
    addUserSource(res.data);
    setErr(null);
    setOk(`Added ${id}.`);
    setF({ ...f, title: "", url: "", notes: "" });
  };
  return (
    <Card>
      <CardHeader title="Add a public source" />
      <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label-caps">Title</span>
          <input className={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </label>
        <label>
          <span className="label-caps">Publisher</span>
          <input className={input} value={f.publisher} onChange={(e) => setF({ ...f, publisher: e.target.value })} />
        </label>
        <label>
          <span className="label-caps">Publication date</span>
          <input type="date" className={input} value={f.publicationDate} onChange={(e) => setF({ ...f, publicationDate: e.target.value })} />
        </label>
        <label className="md:col-span-2">
          <span className="label-caps">URL</span>
          <input className={input} value={f.url} placeholder="https://…" onChange={(e) => setF({ ...f, url: e.target.value })} />
        </label>
        <label>
          <span className="label-caps">Source type</span>
          <select className={input} value={f.sourceType} onChange={(e) => setF({ ...f, sourceType: e.target.value as Source["sourceType"] })}>
            {["official_transcript", "official_press_release", "official_backgrounder", "official_statement", "media", "independent"].map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-caps">Evidence class</span>
          <select className={input} value={f.evidenceClass} onChange={(e) => setF({ ...f, evidenceClass: e.target.value as EvidenceClass })}>
            {(Object.keys(EVIDENCE) as EvidenceClass[]).map((k) => (
              <option key={k} value={k}>
                {k} – {EVIDENCE[k].desc}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label-caps">Assessment notes</span>
          <input className={input} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        </label>
        <div className="md:col-span-2">
          <Button onClick={submit}>
            <Plus /> Add source
          </Button>
          {err && <div className="mt-1 text-[11px] text-hostile">{err}</div>}
          {ok && <div className="mt-1 text-[11px] text-olive-300">{ok}</div>}
          <p className="mt-2 text-[10px] text-ink-500">
            Added sources are stored in this browser and included in saved sessions. Linking a source to an event or BDA record never upgrades its evidence
            class automatically – an analyst must change a BDA claim status explicitly, and “independently verified” requires a GREEN source.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function SourcesModule() {
  const userSources = useSim((s) => s.userSources);
  const links = useSim((s) => s.eventSourceLinks);
  const { removeUserSource, linkSource, unlinkSource } = useSim.getState();
  const sources = allSources(userSources);
  const [linkEvent, setLinkEvent] = useState<Record<string, string>>({});
  const usage = useMemo(() => {
    const m = new Map<string, number>();
    const bump = (id: string) => m.set(id, (m.get(id) ?? 0) + 1);
    EVENTS.forEach((e) => e.sources.forEach(bump));
    TARGETS.forEach((t) => t.sources.forEach(bump));
    WEAPONS.forEach((w) => w.sources.forEach(bump));
    Object.values(links).forEach((l) => l.forEach(bump));
    return m;
  }, [links]);

  const [tab, setTab] = useState<"register" | "audit">("register");
  const auditCount = useAudit((s) => s.entries.length);
  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="S" title="Source Management">
        <div className="flex overflow-hidden rounded-[3px] border border-ink-700 text-[11px]" role="tablist">
          {(
            [
              ["register", "Source register"],
              ["audit", `Audit log (${auditCount})`],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`h-6 px-2 ${tab === k ? "bg-olive-700 text-olive-300" : "bg-ink-800 text-ink-400 hover:text-ink-100"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadText("sindoor-sources.csv", "﻿" + toCsv(sources.map((s) => ({ ...s, linked_records: usage.get(s.id) ?? 0 }))), "text/csv")}
        >
          Sources CSV
        </Button>
      </ModuleHeader>
      {tab === "audit" ? (
        <div className="flex-1 overflow-auto p-3">
          <AuditLogPanel />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-auto p-3 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader title={`Source register (${sources.length})`} />
            <div className="overflow-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-ink-400">
                    {["Class", "Source", "Publisher / date", "Retrieval", "Archive", "Used by", "Notes", ""].map((h) => (
                      <th key={h} className="border-b border-ink-700 px-2 py-1.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => {
                    const user = s.retrieval === "user_added";
                    const linkedTo = Object.entries(links)
                      .filter(([, v]) => v.includes(s.id))
                      .map(([k]) => k);
                    return (
                      <tr key={s.id} className="border-b border-ink-800 align-top">
                        <td className="px-2 py-1.5">
                          <EvidenceBadge cls={s.evidenceClass} />
                        </td>
                        <td className="max-w-[340px] px-2 py-1.5">
                          <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-ink-100 hover:text-olive-300">
                            {s.title} <ExternalLink className="inline size-2.5" />
                          </a>
                          <div className="mono text-[10px] text-ink-500">{s.id}</div>
                          {user && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              {linkedTo.map((ev) => (
                                <span key={ev} className="mono flex items-center gap-0.5 border border-ink-600 px-1 text-[10px]">
                                  {ev}
                                  <button onClick={() => unlinkSource(ev, s.id)} aria-label={`Unlink ${ev}`} className="text-ink-500 hover:text-hostile">
                                    ×
                                  </button>
                                </span>
                              ))}
                              <select
                                aria-label={`Link ${s.id} to an event`}
                                value={linkEvent[s.id] ?? ""}
                                onChange={(e) => setLinkEvent({ ...linkEvent, [s.id]: e.target.value })}
                                className="h-6 max-w-[200px] border border-ink-600 bg-ink-900 px-1 text-[10px]"
                              >
                                <option value="">Link to event…</option>
                                {ALL_EVENTS.map((e) => (
                                  <option key={e.id} value={e.id}>
                                    {e.id} {e.title}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={!linkEvent[s.id]}
                                onClick={() => {
                                  linkSource(linkEvent[s.id], s.id);
                                  setLinkEvent({ ...linkEvent, [s.id]: "" });
                                }}
                              >
                                <Link2 />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-ink-300">
                          {s.publisher}
                          <div className="mono text-[10px] text-ink-500">{formatDateLabel(s.publicationDate)}</div>
                        </td>
                        <td className="px-2 py-1.5 text-ink-300">{RETRIEVAL[s.retrieval]}</td>
                        <td className="px-2 py-1.5 text-[10px]">
                          {s.archiveUrl ? (
                            <a href={s.archiveUrl} target="_blank" rel="noreferrer" className="text-olive-300 hover:underline">
                              Wayback {s.archivedAt}
                            </a>
                          ) : (
                            <span className="text-ink-500">none</span>
                          )}
                          {s.archiveUrl && (
                            <div
                              className={
                                s.archiveStatus === "content_verified" ? "text-defensive" : s.archiveStatus === "shell_only" ? "text-warn" : "text-ink-500"
                              }
                            >
                              {s.archiveStatus === "content_verified" ? "text verified" : s.archiveStatus === "shell_only" ? "shell only" : "not checked"}
                            </div>
                          )}
                          {s.lastChecked && <div className="text-ink-500">checked {s.lastChecked}</div>}
                        </td>
                        <td className="mono px-2 py-1.5 text-center text-ink-200">{usage.get(s.id) ?? 0}</td>
                        <td className="max-w-[300px] px-2 py-1.5 text-ink-400">{s.notes}</td>
                        <td className="px-2 py-1.5">
                          {user && (
                            <button onClick={() => removeUserSource(s.id)} aria-label="Remove source" className="text-ink-500 hover:text-hostile">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="space-y-3">
            <AddSourceForm />
            <Card className="p-3 text-[11px] leading-relaxed text-ink-400">
              <div className="label-caps mb-1">Evidence classification</div>
              {(Object.keys(EVIDENCE) as EvidenceClass[]).map((k) => (
                <div key={k} className="flex items-center gap-2 py-0.5">
                  <EvidenceBadge cls={k} /> {EVIDENCE[k].desc}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
