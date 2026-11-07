import { Badge } from "@/components/ui/primitives";
import { EVIDENCE } from "@/engine/assessmentEngine";
import type { EvidenceClass } from "@/types";

export function EvidenceBadge({ cls, withDesc = false }: { cls: EvidenceClass; withDesc?: boolean }) {
  const e = EVIDENCE[cls];
  return (
    <Badge color={e.color} title={e.desc}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
      {e.label}
      {withDesc && <span className="normal-case tracking-normal font-normal opacity-80">· {e.desc}</span>}
    </Badge>
  );
}
