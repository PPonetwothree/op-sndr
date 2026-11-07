import { describe, expect, it } from "vitest";
import { migrateScenario, canAdvance, rungByTurn, currentRung, EMPTY_SCENARIO, type Scenario, type Inject } from "./scenarioStore";

const move = (p: Partial<Inject>): Inject => ({
  id: Math.random().toString(),
  turn: 1,
  actor: "Blue",
  domain: "diplomatic",
  description: "m",
  level: 1,
  rationale: "",
  adjudication: null,
  ...p,
});
const ruled = (outcome: "accepted" | "modified" | "rejected", rung: number) => ({ outcome, rung, note: "", umpire: "U", ts: "t" });

describe("tabletop turns", () => {
  it("cannot advance an empty turn or one with unruled moves", () => {
    expect(canAdvance(EMPTY_SCENARIO)).toBe(false);
    const s: Scenario = { ...EMPTY_SCENARIO, injects: [move({ adjudication: ruled("accepted", 1) }), move({})] };
    expect(canAdvance(s)).toBe(false);
    s.injects[1].adjudication = ruled("rejected", 1);
    expect(canAdvance(s)).toBe(true);
  });
  it("takes the highest non-rejected ruling per turn and carries it forward", () => {
    const s: Scenario = {
      ...EMPTY_SCENARIO,
      currentTurn: 3,
      injects: [
        move({ turn: 1, adjudication: ruled("accepted", 2) }),
        move({ turn: 1, actor: "Red", level: 5, adjudication: ruled("modified", 3) }),
        move({ turn: 2, actor: "Red", level: 6, adjudication: ruled("rejected", 6) }),
        move({ turn: 3, adjudication: ruled("accepted", 1) }),
      ],
    };
    expect(rungByTurn(s)).toEqual([
      { turn: 1, rung: 3, moves: 2 },
      { turn: 2, rung: 3, moves: 1 },
      { turn: 3, rung: 1, moves: 1 },
    ]);
    expect(currentRung(s)).toBe(1);
  });
  it("migrates v1 scenarios (flat inject list) into ruled moves, one per turn", () => {
    const s = migrateScenario({
      title: "Old",
      injects: [
        { id: "a", step: 1, actor: "Red", level: 4, description: "x" },
        { id: "b", step: 2, actor: "Blue", level: 2 },
      ],
    });
    expect(s.currentTurn).toBe(2);
    expect(s.injects.map((i) => [i.turn, i.adjudication?.rung])).toEqual([
      [1, 4],
      [2, 2],
    ]);
  });
});
