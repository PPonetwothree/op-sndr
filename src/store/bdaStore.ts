import { create } from "zustand";
import { BASELINE_BDA, type BdaRecord } from "@/engine/bdaEngine";
import { audit, diffRecords } from "./auditStore";

const baselineOf = (id: string) => BASELINE_BDA.find((r) => r.targetId === id);

const KEY = "sindoor.bdaEdits.v1";

function loadEdits(): Record<string, BdaRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, BdaRecord>) : {};
  } catch {
    return {};
  }
}
function persist(edits: Record<string, BdaRecord>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(edits));
  } catch {
    /* storage unavailable */
  }
}

interface BdaState {
  edits: Record<string, BdaRecord>; // only edited records are stored
  update: (rec: BdaRecord) => void;
  reset: (targetId: string) => void;
  resetAll: () => void;
  replaceEdits: (edits: Record<string, BdaRecord>) => void;
}

export const useBda = create<BdaState>((set, get) => ({
  edits: loadEdits(),
  update: (rec) => {
    const before = get().edits[rec.targetId] ?? baselineOf(rec.targetId);
    const changes = before ? diffRecords(before, rec, ["edited", "editedAt"]) : [];
    if (changes.length)
      audit({ action: "bda.update", target: rec.targetId, summary: `Edited BDA record ${rec.targetName} (${changes.length} field(s))`, changes });
    const next = { ...get().edits, [rec.targetId]: { ...rec, edited: true, editedAt: new Date().toISOString() } };
    persist(next);
    set({ edits: next });
  },
  reset: (id) => {
    const cur = get().edits[id];
    const base = baselineOf(id);
    if (cur && base)
      audit({
        action: "bda.reset",
        target: id,
        summary: `Restored source-derived baseline for ${base.targetName}`,
        changes: diffRecords(cur, base, ["edited", "editedAt"]),
      });
    const next = { ...get().edits };
    delete next[id];
    persist(next);
    set({ edits: next });
  },
  resetAll: () => {
    const n = Object.keys(get().edits).length;
    if (n) audit({ action: "bda.resetAll", target: "*", summary: `Discarded edits on ${n} BDA record(s)` });
    persist({});
    set({ edits: {} });
  },
  replaceEdits: (edits) => {
    persist(edits);
    set({ edits });
  },
}));

export function mergeBda(edits: Record<string, BdaRecord>): BdaRecord[] {
  return BASELINE_BDA.map((r) => edits[r.targetId] ?? r);
}

export function useBdaRecords(): BdaRecord[] {
  const edits = useBda((s) => s.edits);
  return mergeBda(edits);
}
