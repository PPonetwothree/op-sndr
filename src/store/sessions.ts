// Saved simulation sessions (LocalStorage) and JSON import/export.
import { useSim, type SessionSnapshot } from "./simulationStore";
import { downloadText } from "@/utils/download";
import { useBda } from "./bdaStore";
import { useScenario, type Scenario } from "./scenarioStore";
import type { BdaRecord } from "@/engine/bdaEngine";

function fullSnapshot(name: string): SessionSnapshot {
  return { ...useSim.getState().snapshot(name), bdaEdits: useBda.getState().edits, scenario: useScenario.getState().scenario };
}

const KEY = "sindoor.sessions.v1";

export function listSessions(): SessionSnapshot[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(list: SessionSnapshot[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function saveSession(name: string): SessionSnapshot {
  const snap = fullSnapshot(name);
  writeSessions([snap, ...listSessions().filter((s) => s.name !== name)].slice(0, 30));
  return snap;
}

export function deleteSession(name: string) {
  writeSessions(listSessions().filter((s) => s.name !== name));
}

export function loadSession(snap: SessionSnapshot) {
  useSim.getState().restore(snap);
  if (snap.bdaEdits) useBda.getState().replaceEdits(snap.bdaEdits as Record<string, BdaRecord>);
  if (snap.scenario) useScenario.getState().replace(snap.scenario as Scenario);
}

export function exportSessionJson(name = "session") {
  const snap = fullSnapshot(name);
  downloadText(`sindoor-session-${name.replace(/\W+/g, "_")}.json`, JSON.stringify(snap, null, 2), "application/json");
}

export function parseSessionJson(text: string): SessionSnapshot {
  const obj = JSON.parse(text);
  if (obj?.version !== 1 || typeof obj.simTime !== "number" || !obj.filters || !obj.layers) {
    throw new Error("Not a valid Operation Sindoor session file");
  }
  return obj as SessionSnapshot;
}
