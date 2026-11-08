import { useEffect, useRef } from "react";
import { create } from "zustand";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSim } from "@/store/simulationStore";
import { EVIDENCE } from "@/engine/assessmentEngine";
import { APP_VERSION } from "@/version";

export const useHelp = create<{ open: boolean; setOpen: (open: boolean) => void; toggle: () => void }>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));

export const SHORTCUTS: [string, string][] = [
  ["Space", "Play / pause"],
  ["→ / ←", "Next / previous event (next / previous step in the briefing)"],
  ["Home", "Back to the start"],
  ["Esc", "Leave the briefing; close this panel"],
  ["?", "Open or close this panel"],
];

const QUICK_START: [string, string][] = [
  ["Watch it unfold", "Geospatial Operations → Guided briefing, or press Space to play the clock."],
  ["Check a fact", "Select an event; click a quote marker next to a field to see the source passage in the Evidence trail."],
  ["See both sides", "Accounts compared on an event card puts Pakistani and independent accounts beside the Indian one."],
  ["Share a view", "Copy link gives a URL to this exact view. Session → Export JSON carries your edits."],
  ["Run an exercise", "Escalation Matrix → tabletop exercise: hypothetical, umpired turns, kept apart from the record."],
];

export function HelpButton() {
  const toggle = useHelp((s) => s.toggle);
  return (
    <Button variant="secondary" onClick={toggle} title="Help and keyboard shortcuts (?)" aria-haspopup="dialog">
      <CircleHelp /> Help
    </Button>
  );
}

export function HelpPanel() {
  const { open, setOpen } = useHelp();
  const setModule = useSim((s) => s.setModule);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-[3000] flex items-start justify-center bg-black/60 p-6" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="max-h-full w-full max-w-[640px] overflow-y-auto border border-ink-600 bg-ink-900 p-5 text-[12.5px] text-ink-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="help-title" className="text-[15px] font-semibold text-ink-100">
              Using the simulator
            </h2>
            <p className="text-[11px] text-ink-400">Version {APP_VERSION}. A reconstruction from public accounts – not an intelligence product.</p>
          </div>
          <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close help" className="p-1 text-ink-400 hover:text-ink-100">
            <X className="size-4" />
          </button>
        </div>

        <h3 className="label-caps mb-1">Quick start</h3>
        <dl className="mb-4 space-y-1.5">
          {QUICK_START.map(([k, v]) => (
            <div key={k}>
              <dt className="font-semibold text-ink-100">{k}</dt>
              <dd className="text-ink-300">{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="label-caps mb-1">Evidence classes</h3>
        <ul className="mb-1 space-y-1">
          {Object.values(EVIDENCE).map((e) => (
            <li key={e.label} className="flex items-baseline gap-2">
              <span className="mono w-14 shrink-0 font-semibold" style={{ color: e.color }}>
                {e.label}
              </span>
              <span className="text-ink-300">{e.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 text-[11px] text-ink-400">
          GREEN corroborates that an event happened, not its damage or casualty figures. Vectors are illustrative, not flight paths; no imagery is generated.
        </p>

        <h3 className="label-caps mb-1">Keyboard</h3>
        <table className="mb-1 w-full">
          <tbody>
            {SHORTCUTS.map(([k, v]) => (
              <tr key={k} className="border-b border-ink-800">
                <td className="py-1 pr-3">
                  <kbd className="mono rounded border border-ink-600 bg-ink-800 px-1.5 py-0.5 text-[11px] text-ink-100">{k}</kbd>
                </td>
                <td className="py-1 text-ink-300">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mb-4 text-[11px] text-ink-400">Shortcuts are ignored while typing in a text field.</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setModule("methods");
              setOpen(false);
            }}
          >
            Methods, rules and limitations
          </Button>
          <span className="text-[11px] text-ink-400">The full user guide is USER_GUIDE.md, beside the offline file or in the project's docs folder.</span>
        </div>
      </div>
    </div>
  );
}
