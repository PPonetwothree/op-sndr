import { describe, expect, it } from "vitest";
import { DATA_ISSUES, EVENTS, TARGETS, WEAPONS, BASE_SOURCES } from "@/data";
import { resolveEndpoint } from "@/engine/vectorRenderer";

describe("historical database", () => {
  it("validates with no schema or reference issues", () => {
    expect(DATA_ISSUES).toEqual([]);
  });
  it("loads every record", () => {
    expect(EVENTS.length).toBeGreaterThan(40);
    expect(TARGETS.length).toBeGreaterThan(40);
    expect(WEAPONS.length).toBeGreaterThan(20);
    expect(BASE_SOURCES.length).toBeGreaterThan(10);
  });
  it("cites at least one source for every event", () => {
    EVENTS.forEach((e) => expect(e.sources.length, e.id).toBeGreaterThan(0));
  });
  it("never marks an official claim as independently verified", () => {
    EVENTS.filter((e) => e.evidenceType === "official_claim").forEach((e) => {
      expect(e.evidenceClass, e.id).not.toBe("GREEN");
      expect(e.verified, e.id).toBe(false);
    });
  });
  it("only sets clock times that a source states", () => {
    EVENTS.filter((e) => e.time !== null).forEach((e) => expect(e.timeBasis, e.id).toBe("stated"));
  });
  it("resolves every vector endpoint", () => {
    EVENTS.forEach((e) =>
      e.vectors.forEach((v) => {
        if (v.from.startsWith("FRONT:")) return;
        expect(resolveEndpoint(v.from), `${e.id} from ${v.from}`).not.toBeNull();
        expect(resolveEndpoint(v.to), `${e.id} to ${v.to}`).not.toBeNull();
      })
    );
  });
});
