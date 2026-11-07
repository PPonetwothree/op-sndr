import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareableLink } from "@/store/urlSync";

/** Copies a link that reopens the current module, clock, event, filters, layers and map view. */
export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [manual, setManual] = useState("");
  const copy = async () => {
    const url = shareableLink();
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setManual(url);
      setState("manual");
    }
    setTimeout(() => setState((s) => (s === "copied" ? "idle" : s)), 1800);
  };
  return (
    <div className="relative">
      <Button variant="secondary" onClick={copy} title="Copy a link to this exact view" aria-live="polite">
        {state === "copied" ? <Check /> : <Link2 />} {state === "copied" ? "Link copied" : "Copy link"}
      </Button>
      {state === "manual" && (
        <div className="absolute right-0 top-9 z-[2000] w-[360px] border border-ink-600 bg-ink-850 p-2">
          <label className="label-caps" htmlFor="share-url">
            Copy this link
          </label>
          <input
            id="share-url"
            readOnly
            value={manual}
            onFocus={(e) => e.target.select()}
            className="mono mt-1 h-7 w-full border border-ink-600 bg-ink-900 px-1.5 text-[10px]"
          />
          <button className="mt-1 text-[10px] text-ink-400 underline" onClick={() => setState("idle")}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
