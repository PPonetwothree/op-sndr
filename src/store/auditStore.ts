// Append-only audit log of analyst changes (BDA edits, sources, session loads).
// Stored in this browser and carried in saved sessions; exportable as CSV.
import { create } from "zustand";

export type AuditAction = "bda.update" | "bda.reset" | "bda.resetAll" | "source.add" | "source.remove" | "source.link" | "source.unlink" | "session.load";

export interface FieldChange {
  field: string;
  before: string;
  after: string;
}

export interface AuditEntry {
  id: string;
  ts: string; // ISO timestamp
  analyst: string;
  action: AuditAction;
  target: string; // record id (target, source, event, session name)
  summary: string;
  changes: FieldChange[];
}

const LOG_KEY = "sindoor.audit.v1";
const ANALYST_KEY = "sindoor.analyst.v1";
const MAX = 2000;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

interface AuditState {
  entries: AuditEntry[];
  analyst: string;
  setAnalyst: (name: string) => void;
  record: (e: Omit<AuditEntry, "id" | "ts" | "analyst" | "changes"> & { changes?: FieldChange[] }) => void;
  replace: (entries: AuditEntry[]) => void;
  clear: () => void;
}

export const useAudit = create<AuditState>((set, get) => ({
  entries: load<AuditEntry[]>(LOG_KEY, []),
  analyst: load<string>(ANALYST_KEY, ""),
  setAnalyst: (analyst) => {
    save(ANALYST_KEY, analyst);
    set({ analyst });
  },
  record: (e) => {
    const entry: AuditEntry = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      ts: new Date().toISOString(),
      analyst: get().analyst.trim() || "Unnamed analyst",
      changes: [],
      ...e,
    };
    const entries = [entry, ...get().entries].slice(0, MAX);
    save(LOG_KEY, entries);
    set({ entries });
  },
  replace: (entries) => {
    save(LOG_KEY, entries);
    set({ entries });
  },
  clear: () => {
    save(LOG_KEY, []);
    set({ entries: [] });
  },
}));

export const audit = (e: Parameters<AuditState["record"]>[0]) => useAudit.getState().record(e);

const show = (v: unknown): string => {
  const s = v === null || v === undefined ? "∅" : Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 160 ? `${s.slice(0, 157)}…` : s;
};

/** Field-by-field differences between two flat-ish records. */
export function diffRecords<T extends object>(before: T, after: T, ignore: string[] = []): FieldChange[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out: FieldChange[] = [];
  keys.forEach((k) => {
    if (ignore.includes(k)) return;
    const a = (before as Record<string, unknown>)[k];
    const b = (after as Record<string, unknown>)[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push({ field: k, before: show(a), after: show(b) });
  });
  return out;
}
