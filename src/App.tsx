import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSim } from "@/store/simulationStore";
import { usePlaybackLoop } from "@/store/usePlaybackLoop";
import { GeospatialModule } from "@/modules/geospatial/GeospatialModule";
import { OverviewModule } from "@/modules/overview/OverviewModule";
import { ForcesModule } from "@/modules/forces/ForcesModule";
import { AssessmentModule } from "@/modules/assessment/AssessmentModule";
import { EscalationModule } from "@/modules/escalation/EscalationModule";
import { AfterActionModule } from "@/modules/after-action/AfterActionModule";
import { SourcesModule } from "@/modules/sources/SourcesModule";
import type { ModuleId } from "@/types";
import { DATA_ISSUES } from "@/data";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { MapPatternDefs } from "@/components/map/IndiaBoundaryLayers";

const MODULES: Record<ModuleId, () => JSX.Element> = {
  overview: OverviewModule,
  geospatial: GeospatialModule,
  forces: ForcesModule,
  assessment: AssessmentModule,
  escalation: EscalationModule,
  "after-action": AfterActionModule,
  sources: SourcesModule,
};

export default function App() {
  usePlaybackLoop();
  const module = useSim((s) => s.module);
  const mode = useSim((s) => s.scenarioMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const s = useSim.getState();
      if (e.code === "Space") {
        e.preventDefault();
        s.togglePlay();
      } else if (e.key === "ArrowRight") s.stepForward();
      else if (e.key === "ArrowLeft") s.stepBackward();
      else if (e.key === "Home") s.restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <MapPatternDefs />
      <Header />
      {mode === "hypothetical" && (
        <div className="no-print border-b border-warn/40 bg-warn/10 px-4 py-1 text-[11px] text-warn">
          HYPOTHETICAL MODE — educational tabletop analysis, separate from the historical reconstruction. Tabletop tools: Escalation Matrix (injects and trace)
          and Force Database (package builder). Map, charts and BDA always show historical data.
        </div>
      )}
      {DATA_ISSUES.length > 0 && (
        <div className="no-print border-b border-hostile/40 bg-hostile/10 px-4 py-1 text-[11px] text-hostile">
          Data validation: {DATA_ISSUES.length} issue(s) — see browser console.
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <ErrorBoundary resetKey={module}>
            {(() => {
              const M = MODULES[module];
              return <M />;
            })()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
