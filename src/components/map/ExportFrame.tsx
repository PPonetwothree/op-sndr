import { useSim, ALL_EVENTS, allSources } from "@/store/simulationStore";
import { formatIst, formatDateLabel } from "@/engine/timelineEngine";
import { APP_VERSION, DATA_AS_OF } from "@/version";

/** Title block and footer drawn over the map only while a PNG export is rendered. */
export function ExportFrame() {
  const simTime = useSim((s) => s.simTime);
  const selectedId = useSim((s) => s.selectedEventId);
  const filters = useSim((s) => s.filters);
  const userSources = useSim((s) => s.userSources);
  const sel = ALL_EVENTS.find((e) => e.id === selectedId);
  const sources = sel ? allSources(userSources).filter((s) => sel.sources.includes(s.id)) : [];
  const filterText = [
    filters.days.map(formatDateLabel).join(", "),
    filters.actors.join(", "),
    filters.domains.join(", "),
    filters.evidence.join(", "),
    filters.types.join(", "),
    filters.search && `“${filters.search}”`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-[1100] flex items-start justify-between border-b border-ink-600 bg-ink-950/95 px-4 py-2">
        <div>
          <div className="text-[15px] font-bold tracking-[0.2em] text-ink-100">OPERATION SINDOOR · MAP VIEW</div>
          <div className="text-[11px] text-ink-300">
            {sel ? (
              <>
                {sel.id} · {sel.title} · {sel.time ? `${formatDateLabel(sel.date)} ${sel.time} IST` : `${formatDateLabel(sel.date)} (time not stated)`} ·
                evidence {sel.evidenceClass}
              </>
            ) : (
              "No event selected"
            )}
          </div>
          {filterText && <div className="text-[10px] text-ink-400">Filters: {filterText}</div>}
        </div>
        <div className="mono text-right text-[10px] text-ink-400">
          <div className="text-[12px] text-warn">{formatIst(simTime)}</div>
          <div>
            Simulator v{APP_VERSION} · data as of {DATA_AS_OF}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-[1100] border-t border-ink-600 bg-ink-950/95 px-4 py-1.5 text-[9.5px] leading-snug text-ink-400">
        <ExportLegend />
        {sources.length > 0 && (
          <div className="text-ink-300">Sources: {sources.map((s) => `${s.publisher}, “${s.title}” (${s.publicationDate})`).join("; ")}</div>
        )}
        <div>
          Vectors are illustrative geographic representations from abstract anchors – not flight paths, trajectories or firing solutions. Positions are
          town/district level. Boundaries: Natural Earth 1:10m (India point of view; de facto LoC/LAC/AGPL) – approximate, not a Survey of India map.
          Reconstruction from public Indian government accounts. Exported {new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.
        </div>
      </div>
    </>
  );
}

const LINES: [string, string | undefined, number, string][] = [
  ["#5e78e6", undefined, 2, "Indian-reported offensive (illustrative)"],
  ["#16a08a", undefined, 2, "Indian defensive"],
  ["#d24848", undefined, 2, "Pakistani attack (as reported by India)"],
  ["#b28c16", "6 6", 2, "UAV activity"],
  ["#8a8f98", "4 6", 2, "Unverified / disputed claim"],
  ["#efe6c4", "12 4 2 4", 1.8, "Boundary of India (official view)"],
  ["#e3a83b", "6 4", 1.6, "LoC (de facto)"],
  ["#c77ad6", "6 4", 1.5, "LAC – western sector (de facto)"],
  ["#a9b0b8", undefined, 1.2, "International Border"],
  ["#8b929a", "5 3 1 3", 1, "State / province boundary"],
];

/** Compact legend drawn only in PNG exports. */
export function ExportLegend() {
  return (
    <div className="mb-1.5 border-b border-ink-700 pb-1.5 text-[9.5px] text-ink-300">
      <div className="grid grid-cols-3 gap-x-5 gap-y-0.5">
        {LINES.map(([c, d, w, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <svg width="26" height="6" aria-hidden>
              <line x1="1" y1="3" x2="25" y2="3" stroke={c} strokeWidth={w} strokeDasharray={d} />
            </svg>
            {l}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <svg width="26" height="9" aria-hidden>
            <rect x="1" y="1" width="24" height="7" fill="url(#contested-hatch)" stroke="#e3a83b" strokeDasharray="3 3" />
          </svg>
          Contested area (claimed by India)
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="26" height="10" aria-hidden>
            <circle cx="13" cy="5" r="4" fill="none" stroke="#d3d7dc" strokeDasharray="2 2" />
          </svg>
          Position uncertainty ring
        </div>
      </div>
      <div className="mt-1 border-t border-ink-700 pt-1 text-ink-400">
        Symbols APP-6 / MIL-STD-2525C (Indian perspective): red frame hostile, cyan frame friendly · Evidence: GREEN corroborated · BLUE official Indian · AMBER
        media/analytical · GREY disputed
      </div>
    </div>
  );
}
