import type { ReactNode } from "react";

export function ModuleHeader({ code, title, children }: { code: string; title: string; children?: ReactNode }) {
  return (
    <div className="no-print flex h-10 shrink-0 items-center gap-2 border-b border-ink-700 bg-ink-900 px-3">
      <span className="label-caps text-olive-400">
        {code} · {title}
      </span>
      <div className="flex-1" />
      {children}
    </div>
  );
}

export function ScopeToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex overflow-hidden rounded-[3px] border border-ink-700 text-[11px]" title="Chart scope">
      {[
        [false, "All filtered events"],
        [true, "Up to simulation clock"],
      ].map(([v, l]) => (
        <button key={String(v)} onClick={() => onChange(v as boolean)} className={`h-6 px-2 ${value === v ? "bg-olive-700 text-olive-300" : "bg-ink-800 text-ink-400 hover:text-ink-100"}`}>
          {l as string}
        </button>
      ))}
    </div>
  );
}
