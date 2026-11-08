import { describe, expect, it } from "vitest";
import { EVENTS, BASE_SOURCES } from "@/data";
import { APP_VERSION } from "@/version";
import { RECORD_HISTORY, releaseSummary } from "./recordHistory";

describe("record history", () => {
  it("is regenerated for the current version (run npm run build-history when releasing)", () => {
    expect(RECORD_HISTORY.releases.at(-1)?.version).toBe(APP_VERSION);
  });
  it("lists releases in version order", () => {
    const v = RECORD_HISTORY.releases.map((r) => r.version.split(".").map(Number));
    for (let i = 1; i < v.length; i++) expect(v[i][0] * 1e6 + v[i][1] * 1e3 + v[i][2]).toBeGreaterThan(v[i - 1][0] * 1e6 + v[i - 1][1] * 1e3 + v[i - 1][2]);
  });
  it("refers only to events and sources that exist", () => {
    const evt = new Set(EVENTS.map((e) => e.id));
    const src = new Set(BASE_SOURCES.map((s) => s.id));
    Object.entries(RECORD_HISTORY.events).forEach(([id, revs]) => {
      expect(evt.has(id), id).toBe(true);
      revs.forEach((r) => r.sourcesAdded.forEach((s) => expect(src.has(s), `${id} ${s}`).toBe(true)));
    });
    RECORD_HISTORY.sources.forEach((s) => expect(src.has(s.sourceId), s.sourceId).toBe(true));
  });
  it("records the 0.6.0 corroboration upgrades and the new air-engagement event", () => {
    const r = releaseSummary().find((x) => x.version === "0.6.0")!;
    expect(r.classChanges["BLUE→GREEN"]).toBe(18);
    expect(r.added).toEqual(["EVT-055"]);
  });
});
