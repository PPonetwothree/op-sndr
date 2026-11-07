// Hypothetical tabletop exercise (educational), run in turns with umpire adjudication.
// Kept completely separate from the historical data.
import { create } from "zustand";

export type Team = "Blue" | "Red" | "Third party";
export type Outcome = "accepted" | "modified" | "rejected";

export interface Adjudication {
  outcome: Outcome;
  rung: number; // resulting rung 0–7 (for rejected moves, the rung before the move)
  note: string;
  umpire: string;
  ts: string;
}

export interface Inject {
  id: string;
  turn: number;
  actor: Team;
  domain: "air" | "land" | "sea" | "cyber_info" | "diplomatic";
  description: string;
  level: number; // rung the team intends (0–7)
  rationale: string;
  adjudication: Adjudication | null; // null = awaiting umpire
  step?: number; // legacy ordering (v1)
}

export interface Scenario {
  title: string;
  premise: string;
  currentTurn: number;
  startRung: number;
  injects: Inject[];
}

const KEY = "sindoor.scenario.v2";
const LEGACY_KEY = "sindoor.scenario.v1";
export const EMPTY_SCENARIO: Scenario = {
  title: "Untitled tabletop exercise",
  premise: "Hypothetical premise for educational discussion. Not a historical reconstruction.",
  currentTurn: 1,
  startRung: 0,
  injects: [],
};

/** Accepts v1 (flat inject list) or v2 scenarios. v1 injects become adjudicated moves, one per turn. */
export function migrateScenario(raw: unknown): Scenario {
  const s = (raw ?? {}) as Partial<Scenario> & { injects?: Partial<Inject>[] };
  const injects = (s.injects ?? []).map((i, idx) => ({
    id: i.id ?? `legacy-${idx}`,
    turn: i.turn ?? i.step ?? idx + 1,
    actor: (i.actor ?? "Blue") as Team,
    domain: (i.domain ?? "diplomatic") as Inject["domain"],
    description: i.description ?? "",
    level: i.level ?? 0,
    rationale: i.rationale ?? "",
    adjudication:
      i.adjudication !== undefined
        ? i.adjudication
        : { outcome: "accepted" as Outcome, rung: i.level ?? 0, note: "Imported from an earlier version (no ruling recorded).", umpire: "—", ts: "" },
  }));
  const maxTurn = injects.reduce((m, i) => Math.max(m, i.turn), 1);
  return {
    title: s.title ?? EMPTY_SCENARIO.title,
    premise: s.premise ?? EMPTY_SCENARIO.premise,
    currentTurn: s.currentTurn ?? maxTurn,
    startRung: s.startRung ?? 0,
    injects,
  };
}

function load(): Scenario {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    return raw ? migrateScenario(JSON.parse(raw)) : EMPTY_SCENARIO;
  } catch {
    return EMPTY_SCENARIO;
  }
}
function save(s: Scenario) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// ── Pure helpers (unit-tested) ─────────────────────────────────────
export const movesInTurn = (s: Scenario, turn: number) => s.injects.filter((i) => i.turn === turn);

/** A turn can close when it has at least one move and every move has a ruling. */
export const canAdvance = (s: Scenario) => {
  const m = movesInTurn(s, s.currentTurn);
  return m.length > 0 && m.every((i) => i.adjudication);
};

/** Rung at the end of each turn: the highest adjudicated rung so far that turn, carried forward. */
export function rungByTurn(s: Scenario): { turn: number; rung: number; moves: number }[] {
  const out: { turn: number; rung: number; moves: number }[] = [];
  let rung = s.startRung;
  for (let t = 1; t <= s.currentTurn; t++) {
    const ruled = movesInTurn(s, t).filter((i) => i.adjudication && i.adjudication.outcome !== "rejected");
    if (ruled.length) rung = Math.max(...ruled.map((i) => i.adjudication!.rung));
    out.push({ turn: t, rung, moves: movesInTurn(s, t).length });
  }
  return out;
}

export const currentRung = (s: Scenario) => rungByTurn(s).at(-1)?.rung ?? s.startRung;

interface ScenarioState {
  scenario: Scenario;
  setMeta: (p: Partial<Pick<Scenario, "title" | "premise" | "startRung">>) => void;
  proposeMove: (i: Omit<Inject, "id" | "turn" | "adjudication">) => void;
  adjudicate: (id: string, a: Omit<Adjudication, "ts">) => void;
  reopen: (id: string) => void;
  removeInject: (id: string) => void;
  advanceTurn: () => void;
  clear: () => void;
  replace: (s: unknown) => void;
}

export const useScenario = create<ScenarioState>((set, get) => {
  const commit = (s: Scenario) => {
    save(s);
    set({ scenario: s });
  };
  const map = (id: string, f: (i: Inject) => Inject) => ({ ...get().scenario, injects: get().scenario.injects.map((i) => (i.id === id ? f(i) : i)) });
  return {
    scenario: load(),
    setMeta: (p) => commit({ ...get().scenario, ...p }),
    proposeMove: (i) => {
      const s = get().scenario;
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());
      commit({ ...s, injects: [...s.injects, { ...i, id, turn: s.currentTurn, adjudication: null }] });
    },
    adjudicate: (id, a) => commit(map(id, (i) => ({ ...i, adjudication: { ...a, ts: new Date().toISOString() } }))),
    reopen: (id) => commit(map(id, (i) => ({ ...i, adjudication: null }))),
    removeInject: (id) => commit({ ...get().scenario, injects: get().scenario.injects.filter((x) => x.id !== id) }),
    advanceTurn: () => {
      const s = get().scenario;
      if (canAdvance(s)) commit({ ...s, currentTurn: s.currentTurn + 1 });
    },
    clear: () => commit(EMPTY_SCENARIO),
    replace: (s) => commit(migrateScenario(s)),
  };
});
