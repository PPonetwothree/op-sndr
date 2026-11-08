import { ExternalLink, Satellite } from "lucide-react";
import { useSim, allSources } from "@/store/simulationStore";
import { Badge } from "@/components/ui/primitives";
import { IMAGERY_KIND_LABEL, type ImageryRecord } from "@/data/imagery";

/** Links to published imagery. Nothing is embedded: the images stay with their publishers. */
export function PublishedImagery({ items }: { items: ImageryRecord[] }) {
  const sources = allSources(useSim((s) => s.userSources));
  if (!items.length) return <p className="text-[11px] text-ink-500">No published imagery is registered for this item.</p>;
  return (
    <ul className="space-y-2" data-testid="published-imagery">
      {items.map((i) => {
        const s = sources.find((x) => x.id === i.sourceId);
        return (
          <li key={i.id} className="border-l-2 border-ink-600 pl-2">
            <div className="flex flex-wrap items-center gap-1">
              <Satellite className="size-3 text-ink-400" aria-hidden />
              <Badge color="#8a8f98">{IMAGERY_KIND_LABEL[i.kind]}</Badge>
              {!i.read && <Badge color="#b28c16">Headline only</Badge>}
            </div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-200">{i.shows}</p>
            <p className="text-[10.5px] text-ink-400">
              {i.provider} · collected {i.collected}
            </p>
            {s && (
              <a href={s.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-ink-400 hover:text-olive-300">
                View at {s.publisher} · {s.publicationDate}
                <ExternalLink className="size-2.5" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
