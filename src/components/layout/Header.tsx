import { useSim } from "@/store/simulationStore";
import { formatIst } from "@/engine/timelineEngine";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { SessionMenu } from "./SessionMenu";
import { ShareButton } from "./ShareButton";
import { HelpButton } from "./HelpPanel";
import { APP_VERSION } from "@/version";
import { cn } from "@/utils/cn";

export function Header() {
  const simTime = useSim((s) => s.simTime);
  const playing = useSim((s) => s.playing);
  const mode = useSim((s) => s.scenarioMode);
  const setMode = useSim((s) => s.setScenarioMode);
  return (
    <header className="no-print flex h-[60px] shrink-0 items-center gap-5 border-b border-ink-700 bg-ink-950 px-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 bg-olive-500" />
          <h1 className="text-[15px] font-bold tracking-[0.2em] text-ink-100">OPERATION SINDOOR</h1>
        </div>
        <div className="text-[10px] tracking-wider text-ink-400">
          HISTORICAL SIMULATION · 7–10 MAY 2025 · MULTI-DOMAIN CAMPAIGN RECONSTRUCTION
          {import.meta.env.VITE_OFFLINE_EDITION === "1" && (
            <span className="ml-2 border border-olive-500/60 px-1 text-olive-300" title="Self-contained file: no server or internet needed">
              OFFLINE EDITION v{APP_VERSION}
            </span>
          )}
        </div>
      </div>

      <div className="h-8 w-px bg-ink-700" />

      <div className="flex flex-col">
        <span className="label-caps">Simulation clock</span>
        <span className={cn("mono text-[14px] font-semibold", playing ? "text-warn" : "text-ink-100")}>{formatIst(simTime)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="label-caps">Scenario mode</span>
        <div className="flex overflow-hidden rounded-[3px] border border-ink-700 text-[11px]">
          {(["historical", "hypothetical"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "h-6 px-2 uppercase tracking-wider",
                mode === m ? (m === "historical" ? "bg-olive-700 text-olive-300" : "bg-warn/20 text-warn") : "bg-ink-800 text-ink-400 hover:text-ink-100"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <PlaybackControls />

      <div className="flex-1" />
      <ConfidenceIndicator />
      <HelpButton />
      <ShareButton />
      <SessionMenu />
    </header>
  );
}
