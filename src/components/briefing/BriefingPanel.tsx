import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, X, ExternalLink } from "lucide-react";
import { BRIEFING } from "@/data/briefing";
import { useSim, allSources } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";

const AUTO_MS = 14_000;

export function BriefingPanel() {
  const step = useSim((s) => s.briefingStep);
  const speed = useSim((s) => s.speed);
  const userSources = useSim((s) => s.userSources);
  const { briefingGo, stopBriefing } = useSim.getState();
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto || step === null) return;
    if (step >= BRIEFING.length - 1) {
      setAuto(false);
      return;
    }
    const t = setTimeout(() => briefingGo(step + 1), AUTO_MS / speed);
    return () => clearTimeout(t);
  }, [auto, step, speed, briefingGo]);

  if (step === null) return null;
  const s = BRIEFING[step];
  const sources = allSources(userSources).filter((x) => s.sources.includes(x.id));
  const chapters = [...new Set(BRIEFING.map((b) => b.chapter))];

  return (
    <section
      aria-label="Guided briefing"
      aria-live="polite"
      className="no-export absolute left-1/2 top-3 z-[1050] w-[min(600px,calc(100%-170px))] -translate-x-1/2 border border-olive-500/70 bg-ink-950/96 shadow-xl"
    >
      <div className="flex items-center gap-2 border-b border-ink-700 px-3 py-1.5">
        <span className="label-caps text-olive-300">Guided briefing</span>
        <select
          aria-label="Jump to chapter"
          value={s.chapter}
          onChange={(e) => briefingGo(BRIEFING.findIndex((b) => b.chapter === e.target.value))}
          className="h-6 min-w-0 flex-1 truncate border border-ink-700 bg-ink-900 px-1 text-[11px] text-ink-200"
        >
          {chapters.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span className="mono text-[11px] text-ink-400">
          {step + 1} / {BRIEFING.length}
        </span>
        <Button variant="ghost" size="iconSm" onClick={stopBriefing} aria-label="Exit briefing (Esc)" title="Exit briefing (Esc)">
          <X />
        </Button>
      </div>
      <div className="h-0.5 bg-ink-800">
        <div className="h-full bg-olive-400 transition-all" style={{ width: `${((step + 1) / BRIEFING.length) * 100}%` }} />
      </div>
      <div className="px-3 py-2">
        <h2 className="text-[15px] font-semibold text-ink-100">{s.title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-200">{s.narration}</p>
        {s.caveat && <p className="mt-1.5 border-l-2 border-warn/70 pl-2 text-[11px] leading-snug text-warn">{s.caveat}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {sources.map((x) => (
            <a key={x.id} href={x.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10.5px] text-ink-300 hover:text-olive-300">
              <EvidenceBadge cls={x.evidenceClass} />
              <span className="max-w-[230px] truncate">{x.title}</span>
              <span className="mono text-ink-500">{x.publicationDate}</span>
              <ExternalLink className="size-2.5 shrink-0" />
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-ink-700 px-3 py-1.5">
        <Button variant="secondary" size="sm" onClick={() => briefingGo(step - 1)} disabled={step === 0} aria-label="Previous step (←)">
          <ChevronLeft /> Previous
        </Button>
        <Button size="sm" onClick={() => briefingGo(step + 1)} disabled={step === BRIEFING.length - 1} aria-label="Next step (→)">
          Next <ChevronRight />
        </Button>
        <Button variant={auto ? "active" : "secondary"} size="sm" onClick={() => setAuto(!auto)} aria-pressed={auto}>
          {auto ? <Pause /> : <Play />} Auto
        </Button>
        <span className="ml-auto text-[10px] text-ink-500">← → step · Esc exit · auto pace follows playback speed</span>
      </div>
    </section>
  );
}
