import { describe, expect, it } from "vitest";
import { EVENTS } from "@/data";
import { prepareEvents, filterEvents, indexAtTime, tick, legDuration, EMPTY_FILTERS, stepIndex } from "./eventEngine";
import { CAMPAIGN_START, toMs } from "./timelineEngine";

const timed = prepareEvents(EVENTS);

describe("event engine", () => {
  it("sorts events chronologically", () => {
    for (let i = 1; i < timed.length; i++) expect(timed[i].t).toBeGreaterThanOrEqual(timed[i - 1].t);
  });
  it("parses IST timestamps", () => {
    expect(toMs("2025-05-07T01:05")).toBe(Date.parse("2025-05-06T19:35:00Z"));
  });
  it("filters by day, actor, evidence and search", () => {
    expect(filterEvents(timed, { ...EMPTY_FILTERS, days: ["2025-05-07"] }).every((e) => e.date === "2025-05-07")).toBe(true);
    expect(filterEvents(timed, { ...EMPTY_FILTERS, actors: ["India"] }).every((e) => e.actor === "India")).toBe(true);
    expect(filterEvents(timed, { ...EMPTY_FILTERS, evidence: ["GREY"] }).every((e) => e.evidenceClass === "GREY")).toBe(true);
    expect(filterEvents(timed, { ...EMPTY_FILTERS, search: "bahawalpur" }).length).toBeGreaterThan(0);
    expect(filterEvents(timed, { ...EMPTY_FILTERS, showPrelude: false }).some((e) => e.phase === "prelude")).toBe(false);
  });
  it("finds the event index at a given time", () => {
    expect(indexAtTime(timed, 0)).toBe(-1);
    const strike = timed.findIndex((e) => e.id === "EVT-003");
    expect(indexAtTime(timed, toMs("2025-05-07T01:05"))).toBeGreaterThanOrEqual(strike);
  });
  it("steps forward and backward within bounds", () => {
    expect(stepIndex(timed, 0, -1)).toBe(0);
    expect(stepIndex(timed, timed.length - 1, 1)).toBe(timed.length - 1);
    expect(stepIndex(timed, 3, 1)).toBe(4);
  });
  it("advances playback through dwell and transit, scaling with speed", () => {
    const campaign = timed.filter((e) => e.phase === "campaign");
    let st = { idx: 0, elapsed: 0 };
    const { dwell, transit } = legDuration(campaign, 0, 1);
    let r = tick(campaign, st, dwell / 2, 1, CAMPAIGN_START);
    expect(r.idx).toBe(0);
    expect(r.simTime).toBe(campaign[0].t);
    r = tick(campaign, st, dwell + transit + 1, 1, CAMPAIGN_START);
    expect(r.idx).toBe(1);
    expect(r.advanced).toBe(true);
    const fast = legDuration(campaign, 0, 10);
    expect(fast.dwell).toBeCloseTo(dwell / 10);
    // run to the end
    st = { idx: 0, elapsed: 0 };
    let guard = 0, done = false;
    while (!done && guard++ < 10000) {
      const x = tick(campaign, st, 500, 10, CAMPAIGN_START);
      st = { idx: x.idx, elapsed: x.elapsed };
      done = x.finished;
    }
    expect(done).toBe(true);
    expect(st.idx).toBe(campaign.length - 1);
  });
});
