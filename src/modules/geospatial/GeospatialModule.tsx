import { useMemo, useRef, useState } from "react";
import { Columns2, Download, FileSpreadsheet, Image as ImageIcon, LocateFixed, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSim, playlistOf, ALL_EVENTS } from "@/store/simulationStore";
import { OperationsMap } from "@/components/map/OperationsMap";
import { MapLegend } from "@/components/map/MapLegend";
import { LayerPanel } from "@/components/map/LayerPanel";
import { InsetMap } from "@/components/map/MapFurniture";
import { ExportFrame } from "@/components/map/ExportFrame";
import { TimeSlider } from "@/components/timeline/TimeSlider";
import { EventPanel } from "@/components/timeline/EventPanel";
import { EventDetail, TargetDetail } from "@/components/event-cards/EventDetail";
import { Button } from "@/components/ui/button";
import { exportEventsCsv, exportMapPng, exportTargetsCsv } from "@/utils/exports";
import { formatDateLabel } from "@/engine/timelineEngine";
import { cn } from "@/utils/cn";
import { ESCALATION_LEVELS } from "@/engine/assessmentEngine";

const COMPARE_DAYS = ["2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10"];

function DaySelect({ value, onChange, label }: { value: string; onChange: (d: string) => void; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-6 border border-ink-600 bg-ink-900 px-1 text-[11px] text-ink-200"
    >
      {COMPARE_DAYS.map((d) => (
        <option key={d} value={d}>
          {formatDateLabel(d)}
        </option>
      ))}
    </select>
  );
}

export function GeospatialModule() {
  const selectedId = useSim((s) => s.selectedEventId);
  const selectedTargetId = useSim((s) => s.selectedTargetId);
  const compare = useSim((s) => s.compare);
  const filters = useSim((s) => s.filters);
  const escalation = useSim((s) => s.escalationHighlight);
  const { setCompare, selectEvent, selectTarget } = useSim.getState();
  const [leftOpen, setLeftOpen] = useState(true);
  const [follow, setFollow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => ALL_EVENTS.find((e) => e.id === selectedId) ?? null, [selectedId]);

  const doPng = async () => {
    if (!mapRef.current) return;
    setBusy(true);
    setExporting(true);
    // let React paint the export frame and the opened legend before capturing
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150))));
    try {
      await exportMapPng(mapRef.current);
    } catch (err) {
      alert(`Map export failed: ${(err as Error).message}. If online tiles are on, try with them off.`);
    } finally {
      setBusy(false);
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* module toolbar */}
      <div className="no-print flex h-10 shrink-0 items-center gap-2 border-b border-ink-700 bg-ink-900 px-3">
        <Button variant="ghost" size="iconSm" onClick={() => setLeftOpen(!leftOpen)} title={leftOpen ? "Hide event panel" : "Show event panel"}>
          {leftOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
        <span className="label-caps text-olive-400">B · Geospatial Operations Simulator</span>
        <div className="mx-2 h-5 w-px bg-ink-700" />
        <Button
          variant={compare.enabled ? "active" : "secondary"}
          size="sm"
          onClick={() => setCompare({ enabled: !compare.enabled })}
          title="Compare two campaign days side by side"
        >
          <Columns2 /> Compare days
        </Button>
        {compare.enabled && (
          <div className="flex items-center gap-1 text-[11px] text-ink-400">
            <DaySelect label="First comparison day" value={compare.dayA} onChange={(d) => setCompare({ dayA: d })} />
            <span>vs</span>
            <DaySelect label="Second comparison day" value={compare.dayB} onChange={(d) => setCompare({ dayB: d })} />
          </div>
        )}
        <Button variant={follow ? "active" : "secondary"} size="sm" onClick={() => setFollow(!follow)} title="Pan the map to the selected event">
          <LocateFixed /> Follow
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={() => exportEventsCsv(playlistOf(filters))} title="Export the filtered event timeline as CSV">
          <FileSpreadsheet /> Events CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={() => exportTargetsCsv()} title="Export the target/location database as CSV">
          <Download /> Targets CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={doPng} disabled={busy} title="Export current map view as PNG">
          <ImageIcon /> {busy ? "Rendering…" : "Map PNG"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className={cn("no-print shrink-0 border-r border-ink-700 bg-ink-900", leftOpen ? "w-[300px]" : "w-0 overflow-hidden")}>
          {leftOpen && <EventPanel />}
        </aside>

        <section className={cn("relative min-w-0 flex-1", exporting && "exporting")} ref={mapRef}>
          {compare.enabled ? (
            <div className="grid h-full grid-cols-2 gap-px bg-ink-700">
              <OperationsMap key="A" dayOverride={compare.dayA} sync caption={formatDateLabel(compare.dayA)} follow={false} />
              <OperationsMap key="B" dayOverride={compare.dayB} sync caption={formatDateLabel(compare.dayB)} follow={false} />
            </div>
          ) : (
            <OperationsMap follow={follow} />
          )}
          {!exporting && <MapLegend />}
          {exporting && <ExportFrame />}
          {!compare.enabled && <InsetMap />}
          {escalation !== null && (
            <div className="no-export absolute right-3 top-[52px] z-[1000] flex items-center gap-2 border border-warn/60 bg-ink-950/92 px-2.5 py-1.5 text-[11px] text-warn">
              Highlighting escalation level {escalation} – {ESCALATION_LEVELS[escalation]}
              <button
                onClick={() => useSim.getState().setEscalationHighlight(null)}
                className="text-ink-300 hover:text-ink-100"
                aria-label="Clear escalation highlight"
              >
                ✕
              </button>
            </div>
          )}
          <div className="no-export">
            <LayerPanel />
          </div>
          {selected && !compare.enabled && (
            <div className="no-export pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 border border-warn/50 bg-ink-950/92 px-3 py-1 text-center">
              <div className="mono text-[11px] text-warn">
                {selected.time ? `${formatDateLabel(selected.date)} · ${selected.time} IST` : `${formatDateLabel(selected.date)} · TIME UNKNOWN`}
              </div>
              <div className="text-[11px] text-ink-200">{selected.title}</div>
            </div>
          )}
        </section>

        <aside className="no-print w-[360px] shrink-0 border-l border-ink-700 bg-ink-900">
          {selectedTargetId ? (
            <TargetDetail id={selectedTargetId} onClose={() => selectTarget(null)} />
          ) : selected ? (
            <EventDetail e={selected} onClose={() => selectEvent(null)} />
          ) : (
            <div className="p-4 text-[12px] leading-relaxed text-ink-400">
              <div className="label-caps mb-2">Information panel</div>
              Press <span className="mono text-ink-200">Play</span> (or Space) to run the campaign, or select an event from the list, the time slider or the
              map. Selecting an event highlights its location, animates its illustrative vector, and shows its timestamp, category, weapon-system category,
              sources and confidence here.
              <div className="mt-3 text-[11px] text-ink-500">Keyboard: Space play/pause · ← → step · Home restart</div>
            </div>
          )}
        </aside>
      </div>
      <TimeSlider />
    </div>
  );
}
