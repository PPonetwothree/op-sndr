import { useState } from "react";
import { Layers, X } from "lucide-react";
import { useSim } from "@/store/simulationStore";
import { Switch } from "@/components/ui/primitives";
import type { LayerVisibility } from "@/types";

const GROUPS: { title: string; items: [keyof LayerVisibility, string][] }[] = [
  {
    title: "Markers",
    items: [
      ["targets", "Target markers (terrorist infrastructure)"],
      ["military", "Military installations"],
      ["airDefence", "Air-defence / radar sites"],
      ["uav", "UAV activity"],
      ["civilian", "Civilian impact / LoC sectors"],
      ["eventLocations", "Event locations"],
    ],
  },
  {
    title: "Overlays",
    items: [
      ["vectors", "Illustrative vectors"],
      ["artillery", "Artillery event corridors"],
      ["coverage", "Defensive / radar coverage (illustrative)"],
      ["sectors", "Operational sectors"],
      ["indiaBoundary", "India boundary (official view)"],
      ["contested", "Contested areas"],
      ["admin1", "State / province boundaries"],
      ["boundaries", "De facto lines (LoC, IB, LAC, AGPL)"],
      ["labels", "Region labels"],
    ],
  },
  {
    title: "Basemap & symbology",
    items: [
      ["relief", "Terrain relief (offline)"],
      ["milSymbols", "APP-6 / MIL-STD-2525 symbols"],
      ["uncertainty", "Position uncertainty & stated distances"],
      ["onlineTiles", "Online dark tiles (needs internet)"],
    ],
  },
];

export function LayerPanel() {
  const [open, setOpen] = useState(false);
  const layers = useSim((s) => s.layers);
  const toggle = useSim((s) => s.toggleLayer);
  return (
    <div className="absolute right-3 top-3 z-[1000]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 border border-ink-600 bg-ink-950/92 px-2.5 py-1.5 text-[11px] text-ink-200 hover:text-ink-100"
        >
          <Layers className="size-3.5" /> Layers
        </button>
      ) : (
        <div className="w-[260px] border border-ink-600 bg-ink-950/95 p-2.5 text-[11px] shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <span className="label-caps">Map layers</span>
            <button onClick={() => setOpen(false)} aria-label="Close layers" className="text-ink-400 hover:text-ink-100">
              <X className="size-3.5" />
            </button>
          </div>
          {GROUPS.map((g) => (
            <div key={g.title} className="mt-2">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-olive-400">{g.title}</div>
              {g.items.map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between gap-2 py-0.5 text-ink-300 hover:text-ink-100">
                  <span>{label}</span>
                  <Switch checked={layers[k]} onCheckedChange={() => toggle(k)} aria-label={label} />
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
