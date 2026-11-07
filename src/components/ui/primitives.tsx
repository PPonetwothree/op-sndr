import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-ink-700 bg-ink-850 rounded-[3px]", className)} {...props} />;
}

export function CardHeader({ className, title, right, ...props }: React.HTMLAttributes<HTMLDivElement> & { title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-2 border-b border-ink-700 px-3 py-2", className)} {...props}>
      <div className="label-caps">{title}</div>
      {right}
    </div>
  );
}

export function Badge({ className, color, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { color?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] text-[10px] font-semibold tracking-wider uppercase", className)}
      style={color ? { color, borderColor: `${color}66`, background: `${color}14` } : undefined}
      {...props}
    >
      {children}
    </span>
  );
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-ink-600 bg-ink-800 transition-colors data-[state=checked]:bg-olive-600 data-[state=checked]:border-olive-500",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-3 w-3 rounded-full bg-ink-300 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-ink-100" />
    </SwitchPrimitive.Root>
  )
);
Switch.displayName = "Switch";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label-caps">{label}</span>
      {children}
    </div>
  );
}

export function KV({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-ink-800 last:border-0">
      <span className="text-ink-400 text-[11px]">{k}</span>
      <span className={cn("text-ink-100 text-[12px]", mono && "mono")}>{v}</span>
    </div>
  );
}
