import { LayoutDashboard, Map, Plane, Crosshair, TrendingUp, ClipboardCheck, Library, BookOpen } from "lucide-react";
import { useSim } from "@/store/simulationStore";
import type { ModuleId } from "@/types";
import { cn } from "@/utils/cn";

const MODULES: { id: ModuleId; code: string; label: string; icon: typeof Map; phase: 1 | 2 }[] = [
  { id: "overview", code: "A", label: "Campaign Overview", icon: LayoutDashboard, phase: 2 },
  { id: "geospatial", code: "B", label: "Geospatial Operations", icon: Map, phase: 1 },
  { id: "forces", code: "C", label: "Force & Weapons DB", icon: Plane, phase: 2 },
  { id: "assessment", code: "D", label: "Damage Assessment", icon: Crosshair, phase: 2 },
  { id: "escalation", code: "E", label: "Escalation Matrix", icon: TrendingUp, phase: 2 },
  { id: "after-action", code: "F", label: "After-Action Review", icon: ClipboardCheck, phase: 2 },
  { id: "sources", code: "S", label: "Source Management", icon: Library, phase: 2 },
  { id: "methods", code: "M", label: "Methods & Data", icon: BookOpen, phase: 1 },
];

export function Sidebar() {
  const module = useSim((s) => s.module);
  const setModule = useSim((s) => s.setModule);
  return (
    <nav className="no-print flex w-[200px] shrink-0 flex-col border-r border-ink-700 bg-ink-950">
      <div className="border-b border-ink-700 px-3 py-3">
        <div className="label-caps text-olive-400">Modules</div>
      </div>
      <ul className="flex-1 py-1">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const active = module === m.id;
          return (
            <li key={m.id}>
              <button
                onClick={() => setModule(m.id)}
                className={cn(
                  "group flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left text-[12px] transition-colors",
                  active ? "border-olive-400 bg-ink-850 text-ink-100" : "border-transparent text-ink-300 hover:bg-ink-900 hover:text-ink-100"
                )}
              >
                <span className={cn("mono w-3 text-[10px]", active ? "text-olive-300" : "text-ink-500")}>{m.code}</span>
                <Icon className={cn("size-4", active ? "text-olive-300" : "text-ink-400")} />
                <span className="flex-1">{m.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-ink-700 p-3 text-[10px] leading-relaxed text-ink-500">
        Reconstruction from public Indian government accounts. Vectors and formations are illustrative.
      </div>
    </nav>
  );
}
