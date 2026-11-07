import { describe, expect, it } from "vitest";
import { BRIEFING } from "./briefing";
import { EVENTS, BASE_SOURCES } from "@/data";

describe("guided briefing script", () => {
  const evtIds = new Set(EVENTS.map((e) => e.id));
  const srcIds = new Set(BASE_SOURCES.map((s) => s.id));
  it("references real events and sources, each step citing the event's own sources", () => {
    BRIEFING.forEach((s) => {
      expect(evtIds.has(s.eventId), s.id).toBe(true);
      expect(s.sources.length, s.id).toBeGreaterThan(0);
      s.sources.forEach((src) => expect(srcIds.has(src), `${s.id} ${src}`).toBe(true));
      const ev = EVENTS.find((e) => e.id === s.eventId)!;
      expect(
        s.sources.some((src) => ev.sources.includes(src)),
        `${s.id} shares a source with ${s.eventId}`
      ).toBe(true);
    });
  });
  it("runs in chronological order of its events", () => {
    const t = BRIEFING.map((s) => EVENTS.find((e) => e.id === s.eventId)!.sortTime);
    expect([...t].sort()).toEqual(t);
  });
  it("frames views inside the theatre and keeps narration concise", () => {
    BRIEFING.forEach((s) => {
      expect(s.view.center[0]).toBeGreaterThan(18);
      expect(s.view.center[0]).toBeLessThan(38);
      expect(s.view.zoom).toBeGreaterThanOrEqual(4);
      expect(s.narration.split(/\s+/).length, s.id).toBeLessThanOrEqual(90);
    });
  });
});
