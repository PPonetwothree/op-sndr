import { useMemo, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import { AAR_SECTIONS, type Basis } from "@/data/afterAction";
import { useSim, allSources, ALL_EVENTS } from "@/store/simulationStore";
import { useBdaRecords } from "@/store/bdaStore";
import { Card, CardHeader, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "../ModuleHeader";
import { buildScorecard } from "./scorecard";
import { PrintReport } from "./PrintReport";

const BASIS: Record<Basis, { label: string; color: string }> = {
  official_claim: { label: "Official claim", color: "#4f8fe6" },
  official_acknowledgement: { label: "Official acknowledgement", color: "#4f8fe6" },
  corroborated: { label: "Corroborated", color: "#5fbf7a" },
  analytical: { label: "Analytical", color: "#e3a83b" },
  unresolved: { label: "Unresolved", color: "#8a8f98" },
};

export function AfterActionModule() {
  const bda = useBdaRecords();
  const userSources = useSim((s) => s.userSources);
  const sources = allSources(userSources);
  const score = useMemo(() => buildScorecard(ALL_EVENTS, bda), [bda]);
  const [printing, setPrinting] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="F" title="After-Action Review">
        <Button variant="secondary" size="sm" onClick={() => setPrinting(true)}>
          <Printer /> Print-friendly report
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            import("@/utils/reportExports")
              .then((m) => m.exportCampaignPdf({ events: ALL_EVENTS, bda, sources }))
              .catch((err: Error) => alert(`PDF export failed: ${err.message}`))
              .finally(() => setBusy(false));
          }}
        >
          <FileDown /> {busy ? "Building…" : "Full campaign PDF"}
        </Button>
      </ModuleHeader>
      <div tabIndex={0} aria-label="After-action review content" className="flex-1 space-y-3 overflow-auto p-3">
        <Card>
          <CardHeader
            title="Analytical scorecard"
            right={<span className="text-[10px] text-ink-500">No numerical effectiveness scores are generated where evidence is unavailable</span>}
          />
          <div className="overflow-auto p-2">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-ink-400">
                  {[
                    "Dimension",
                    "Official account",
                    "Measures (record counts / stated facts)",
                    "Independent corroboration",
                    "Evidence status",
                    "Numerical score",
                  ].map((h) => (
                    <th key={h} className="border-b border-ink-700 px-2 py-1.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {score.map((r) => (
                  <tr key={r.dimension} className="border-b border-ink-800 align-top">
                    <td className="px-2 py-1.5 font-medium text-ink-100">{r.dimension}</td>
                    <td className="px-2 py-1.5 text-ink-300">{r.officialAccount}</td>
                    <td className="px-2 py-1.5">
                      {r.measures.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <span className="text-ink-400">{k}</span>
                          <span className="mono text-ink-100">{v}</span>
                        </div>
                      ))}
                    </td>
                    <td className="mono px-2 py-1.5 text-center text-ink-100">{r.independent}</td>
                    <td className="px-2 py-1.5 text-warn">{r.status}</td>
                    <td className="px-2 py-1.5 text-ink-400">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {AAR_SECTIONS.map((s) => (
            <Card key={s.id}>
              <CardHeader title={`${s.id} · ${s.title}`} />
              <div className="space-y-2.5 p-3">
                {s.blocks.map((b) => (
                  <div key={b.heading}>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-olive-300">{b.heading}</div>
                    <ul className="space-y-1">
                      {b.items.map((it, i) => (
                        <li key={i} className="flex gap-2 text-[12px] leading-snug text-ink-200">
                          <Badge color={BASIS[it.basis].color} className="shrink-0 self-start">
                            {BASIS[it.basis].label}
                          </Badge>
                          <span>
                            {it.text}
                            {it.sources.length > 0 && <span className="mono ml-1 text-[10px] text-ink-500">({it.sources.join(", ")})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      {printing && <PrintReport events={ALL_EVENTS} bda={bda} sources={sources} score={score} onClose={() => setPrinting(false)} />}
    </div>
  );
}
