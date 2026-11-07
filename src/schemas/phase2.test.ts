import { describe, expect, it } from "vitest";
import { EVENTS, WEAPONS, BASE_SOURCES } from "@/data";
import { ESCALATION_LADDER } from "@/data/escalation";
import { AAR_SECTIONS } from "@/data/afterAction";
import { FORCE_CATEGORIES } from "@/data/forceCategories";
import { BASELINE_BDA } from "@/engine/bdaEngine";
import { prepareEvents } from "@/engine/eventEngine";
import { buildScorecard } from "@/modules/after-action/scorecard";
import { claimsVsCorroboration, regionalDensity, eventsPerDay } from "@/engine/analytics";

const srcIds = new Set(BASE_SOURCES.map((s) => s.id));
const evtIds = new Set(EVENTS.map((e) => e.id));

describe("phase 2 reference data", () => {
  it("escalation ladder covers levels 0–7 with valid references", () => {
    expect(ESCALATION_LADDER.map((l) => l.level)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    ESCALATION_LADDER.forEach((l) => {
      l.triggerEventIds.forEach((id) => expect(evtIds.has(id), `${l.level} ${id}`).toBe(true));
      l.sources.forEach((s) => expect(srcIds.has(s), `${l.level} ${s}`).toBe(true));
    });
  });
  it("after-action items cite known sources", () => {
    AAR_SECTIONS.forEach((s) => s.blocks.forEach((b) => b.items.forEach((i) => i.sources.forEach((src) => expect(srcIds.has(src), src).toBe(true)))));
  });
  it("every weapon belongs to a force category and categories reference real weapons", () => {
    const ids = new Set(WEAPONS.map((w) => w.id));
    const categorised = new Set(FORCE_CATEGORIES.flatMap((c) => c.weaponIds));
    FORCE_CATEGORIES.forEach((c) => c.weaponIds.forEach((w) => expect(ids.has(w), w).toBe(true)));
    WEAPONS.forEach((w) => expect(categorised.has(w.id), w.id).toBe(true));
  });
});

describe("BDA baseline", () => {
  it("creates records for all strike targets and never marks them verified", () => {
    const strike = BASELINE_BDA.filter((r) => r.side === "indian_strike_target");
    expect(strike.length).toBeGreaterThanOrEqual(20);
    expect(BASELINE_BDA.some((r) => r.claimStatus === "independently_verified")).toBe(false);
    strike.forEach((r) => expect(r.claimStatus).toBe("government_claim"));
  });
  it("7 May camps carry level 5 as a government claim", () => {
    const camps = BASELINE_BDA.filter((r) => r.category === "terrorist_infrastructure");
    expect(camps).toHaveLength(9);
    camps.forEach((r) => expect(r.damageLevel).toBe(5));
  });
  it("rejected adversary claims are level 0", () => {
    const sirsa = BASELINE_BDA.find((r) => r.targetId === "IND-SIRSA");
    expect(sirsa?.claimStatus).toBe("adversary_claim_rejected");
    expect(sirsa?.damageLevel).toBe(0);
  });
});

describe("analytics and scorecard", () => {
  const timed = prepareEvents(EVENTS);
  it("counts match the database", () => {
    expect(eventsPerDay(timed).reduce((a, b) => a + b.count, 0)).toBe(EVENTS.length);
    expect(regionalDensity(timed).length).toBeGreaterThan(5);
    const c = claimsVsCorroboration(BASELINE_BDA);
    expect(c.find((x) => x.metric === "Independently corroborated")?.count).toBe(0);
  });
  it("assigns no numerical scores without independent evidence", () => {
    buildScorecard(timed, BASELINE_BDA).forEach((r) => expect(r.score).toMatch(/^Not assigned/));
  });
});
