import { useSim, allSources } from "@/store/simulationStore";
import { FIELD_LABEL, RECORD_HISTORY, historyFor } from "@/data/recordHistory";

/** What changed in this event's record, release by release, and which sources came in with it. */
export function RecordHistory({ eventId }: { eventId: string }) {
  const sources = allSources(useSim((s) => s.userSources));
  const revs = historyFor(eventId);
  const first = RECORD_HISTORY.releases[0]?.version;
  if (!revs.length) return <p className="text-[11px] text-ink-500">Unchanged since version {first}, the first tracked release.</p>;
  const title = (id: string) => sources.find((s) => s.id === id)?.title ?? id;
  return (
    <ol className="space-y-2" data-testid="record-history">
      {[...revs].reverse().map((r) => (
        <li key={r.version} className="border-l-2 border-ink-600 pl-2">
          <div className="mono text-[10.5px] text-ink-400">
            v{r.version} · {r.date}
          </div>
          <ul className="text-[11.5px] text-ink-200">
            {r.changes.map((c, i) => (
              <li key={i}>
                {c.field === "event" ? (
                  <span>Event {c.to}</span>
                ) : (
                  <span>
                    {FIELD_LABEL[c.field] ?? c.field}: <span className="text-ink-400">{c.from}</span> → {c.to}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {r.sourcesAdded.length > 0 && <p className="text-[10.5px] text-ink-400">With: {r.sourcesAdded.map(title).join(" · ")}</p>}
          {r.sourcesRemoved.length > 0 && <p className="text-[10.5px] text-ink-400">Removed: {r.sourcesRemoved.map(title).join(" · ")}</p>}
        </li>
      ))}
    </ol>
  );
}
