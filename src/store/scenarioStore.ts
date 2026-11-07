// Hypothetical tabletop scenario (educational). Kept completely separate from the historical data.
import { create } from "zustand";

export interface Inject {
  id: string;
  step: number;
  actor: "Blue" | "Red" | "Third party";
  domain: "air" | "land" | "sea" | "cyber_info" | "diplomatic";
  description: string;
  level: number; // 0–7 on the same ladder
  rationale: string;
}

export interface Scenario {
  title: string;
  premise: string;
  injects: Inject[];
}

const KEY = "sindoor.scenario.v1";
const EMPTY: Scenario = {
  title: "Untitled tabletop exercise",
  premise: "Hypothetical premise for educational discussion. Not a historical reconstruction.",
  injects: [],
};

function load(): Scenario {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Scenario) : EMPTY;
  } catch {
    return EMPTY;
  }
}
function save(s: Scenario) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

interface ScenarioState {
  scenario: Scenario;
  setMeta: (p: Partial<Pick<Scenario, "title" | "premise">>) => void;
  addInject: (i: Omit<Inject, "id" | "step">) => void;
  removeInject: (id: string) => void;
  moveInject: (id: string, dir: -1 | 1) => void;
  clear: () => void;
  replace: (s: Scenario) => void;
}

const renumber = (inj: Inject[]) => inj.map((x, i) => ({ ...x, step: i + 1 }));

export const useScenario = create<ScenarioState>((set, get) => ({
  scenario: load(),
  setMeta: (p) => {
    const s = { ...get().scenario, ...p };
    save(s);
    set({ scenario: s });
  },
  addInject: (i) => {
    const s = { ...get().scenario, injects: renumber([...get().scenario.injects, { ...i, id: crypto.randomUUID(), step: 0 }]) };
    save(s);
    set({ scenario: s });
  },
  removeInject: (id) => {
    const s = { ...get().scenario, injects: renumber(get().scenario.injects.filter((x) => x.id !== id)) };
    save(s);
    set({ scenario: s });
  },
  moveInject: (id, dir) => {
    const arr = [...get().scenario.injects];
    const i = arr.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const s = { ...get().scenario, injects: renumber(arr) };
    save(s);
    set({ scenario: s });
  },
  clear: () => {
    save(EMPTY);
    set({ scenario: EMPTY });
  },
  replace: (s) => {
    save(s);
    set({ scenario: s });
  },
}));
