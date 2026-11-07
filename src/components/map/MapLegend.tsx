import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { VECTOR_STYLES } from "@/engine/vectorRenderer";
import { EVIDENCE } from "@/engine/assessmentEngine";
import type { VectorStyle, EvidenceClass } from "@/types";
import { SIDC_LEGEND, symbolSvg } from "./milSymbols";
import { useSim } from "@/store/simulationStore";

const MARKERS: { label: string; svg: string }[] = [
  {
    label: "Reported terrorist infrastructure (Indian strike, 7 May)",
    svg: `<path d="M12 3 L21 12 L12 21 L3 12 Z" fill="#4f8fe633" stroke="#4f8fe6" stroke-width="1.6"/><path d="M12 7v10M7 12h10" stroke="#4f8fe6" stroke-width="1.2"/>`,
  },
  {
    label: "Pakistani military installation (Indian strike)",
    svg: `<path d="M12 4 L20.5 19 L3.5 19 Z" fill="#4f8fe62a" stroke="#4f8fe6" stroke-width="1.6"/>`,
  },
  {
    label: "Air-defence / radar site (Indian strike)",
    svg: `<path d="M5 17 A8 8 0 0 1 19 17" fill="none" stroke="#4f8fe6" stroke-width="1.8"/><rect x="4" y="17" width="16" height="2.5" fill="#4f8fe655" stroke="#4f8fe6"/>`,
  },
  {
    label: "Indian location targeted (as reported by India)",
    svg: `<path d="M12 4 L20.5 19 L3.5 19 Z" fill="#e052522a" stroke="#e05252" stroke-width="1.6"/>`,
  },
  {
    label: "LoC sector / civilian impact",
    svg: `<circle cx="12" cy="12" r="7" fill="#d9773a22" stroke="#d9773a" stroke-width="1.6"/><circle cx="12" cy="12" r="2.2" fill="#d9773a"/>`,
  },
  {
    label: "UAV front end-point",
    svg: `<rect x="5" y="5" width="14" height="14" fill="#e0525222" stroke="#e05252" stroke-width="1.5"/><path d="M8 8l8 8M16 8l-8 8" stroke="#e05252" stroke-width="1.3"/>`,
  },
  { label: "Context / event location", svg: `<circle cx="12" cy="12" r="4" fill="#9aa874"/>` },
];

export function MapLegend() {
  const [open, setOpen] = useState(false);
  const mil = useSim((s) => s.layers.milSymbols);
  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-[300px] border border-ink-600 bg-ink-950/92 text-[11px] shadow-lg">
      <button className="flex w-full items-center justify-between px-2.5 py-1.5" onClick={() => setOpen(!open)}>
        <span className="label-caps">Legend</span>
        {open ? <ChevronDown className="size-3.5 text-ink-400" /> : <ChevronUp className="size-3.5 text-ink-400" />}
      </button>
      {open && (
        <div className="space-y-2 border-t border-ink-700 px-2.5 py-2">
          <div className="space-y-1">
            {(Object.keys(VECTOR_STYLES) as VectorStyle[]).map((k) => {
              const s = VECTOR_STYLES[k];
              return (
                <div key={k} className="flex items-center gap-2">
                  <svg width="34" height="8">
                    <line x1="1" y1="4" x2="33" y2="4" stroke={s.color} strokeWidth={k === "artillery" ? 4 : 2} strokeDasharray={s.dash} />
                  </svg>
                  <span className="text-ink-300">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-ink-800 pt-2">
            {(
              [
                ["#efe6c4", "12 4 2 4", 1.8, "Boundary of India (official view, approx.)"],
                ["#e3a83b", "6 4", 1.6, "Line of Control (de facto)"],
                ["#c77ad6", "6 4", 1.5, "Line of Actual Control – western sector (de facto)"],
                ["#e3a83b", "1 4", 1.6, "AGPL – Siachen (de facto)"],
                ["#a9b0b8", undefined, 1.2, "International Border (approx.)"],
              ] as [string, string | undefined, number, string][]
            ).map(([c, d, w, l]) => (
              <div key={l} className="flex items-center gap-2">
                <svg width="34" height="8">
                  <line x1="1" y1="4" x2="33" y2="4" stroke={c} strokeWidth={w} strokeDasharray={d} />
                </svg>
                <span className="text-ink-300">{l}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <svg width="34" height="12">
                <rect x="1" y="1" width="32" height="10" fill="url(#contested-hatch)" stroke="#e3a83b" strokeDasharray="3 3" />
              </svg>
              <span className="text-ink-300">Contested area (administered by another state, claimed by India)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="34" height="14">
                <circle cx="17" cy="7" r="6" fill="#d3d7dc10" stroke="#d3d7dc" strokeDasharray="2 2" />
              </svg>
              <span className="text-ink-300">Position uncertainty (town 5 km · district 15 km · regional 50 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="34" height="8">
                <line x1="1" y1="4" x2="33" y2="4" stroke="#e3a83b" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
              </svg>
              <span className="text-ink-300">Stated vs measured distance to LoC/IB (red = mismatch)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex w-[34px] justify-center">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4f8fe6", boxShadow: "0 0 0 1.5px #0b0d0e" }} />
              </span>
              <span className="text-ink-300">Evidence pip on symbol (GREEN/BLUE/AMBER/GREY)</span>
            </div>
          </div>
          <div className="space-y-1 border-t border-ink-800 pt-2">
            {mil && (
              <>
                <div className="text-[10px] uppercase tracking-wider text-ink-500">APP-6 / MIL-STD-2525C (Indian perspective)</div>
                {SIDC_LEGEND.map((m) => (
                  <div key={m.sidc} className="flex items-center gap-2">
                    <span className="flex w-[22px] justify-center" dangerouslySetInnerHTML={{ __html: symbolSvg(m.sidc, 11) }} />
                    <span className="text-ink-300">{m.label}</span>
                  </div>
                ))}
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Other locations</div>
              </>
            )}
            {MARKERS.filter((m) => !mil || /LoC|Context|UAV/.test(m.label)).map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: m.svg }} />
                <span className="text-ink-300">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-ink-800 pt-2">
            {(Object.keys(EVIDENCE) as EvidenceClass[]).map((k) => (
              <span key={k} className="flex items-center gap-1" title={EVIDENCE[k].desc}>
                <span className="inline-block h-2 w-2" style={{ background: EVIDENCE[k].color }} />
                <span className="text-ink-300">
                  {k} <span className="text-ink-500">{EVIDENCE[k].desc}</span>
                </span>
              </span>
            ))}
          </div>
          <p className="border-t border-ink-800 pt-2 text-[10px] leading-snug text-warn/90">
            Vectors are illustrative geographic representations from abstract sector anchors – not actual aircraft flight paths, firing solutions or verified
            weapon trajectories. Marker positions are town/district level. Boundaries: Natural Earth 1:10m (India point-of-view and de facto layers) –
            approximate, not a Survey of India map.
          </p>
        </div>
      )}
    </div>
  );
}
