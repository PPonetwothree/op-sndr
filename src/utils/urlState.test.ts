import { describe, expect, it } from "vitest";
import { encodeUrlState, decodeUrlState } from "./urlState";
import { DEFAULT_LAYERS } from "@/store/simulationStore";
import { EMPTY_FILTERS } from "@/engine/eventEngine";

describe("shareable URL state", () => {
  it("round-trips module, event, filters, layer changes, view and escalation", () => {
    const hash = encodeUrlState(
      {
        module: "overview",
        eventId: "EVT-012",
        filters: { ...EMPTY_FILTERS, days: ["2025-05-07"], actors: ["India"], evidence: ["BLUE"], search: "bahawalpur", showPrelude: false },
        layers: { ...DEFAULT_LAYERS, relief: false, coverage: true },
        showAll: true,
        view: { center: [30.6, 73.2], zoom: 6.5 },
        escalation: 6,
      },
      DEFAULT_LAYERS
    );
    expect(decodeURIComponent(hash)).toContain("l=+coverage,-relief");
    const back = decodeUrlState(`#${hash}`, DEFAULT_LAYERS);
    expect(back.module).toBe("overview");
    expect(back.eventId).toBe("EVT-012");
    expect(back.filters).toMatchObject({ days: ["2025-05-07"], actors: ["India"], evidence: ["BLUE"], search: "bahawalpur", showPrelude: false });
    expect(back.layers).toEqual({ relief: false, coverage: true });
    expect(back.showAll).toBe(true);
    expect(back.view).toEqual({ center: [30.6, 73.2], zoom: 6.5 });
    expect(back.escalation).toBe(6);
  });
  it("writes nothing for the default state", () => {
    expect(encodeUrlState({ module: "geospatial", layers: DEFAULT_LAYERS, filters: EMPTY_FILTERS }, DEFAULT_LAYERS)).toBe("");
  });
  it("prefers the briefing step over event and time, and is 1-based in the URL", () => {
    const h = encodeUrlState({ briefingStep: 4, eventId: "EVT-012", simTime: 1 }, DEFAULT_LAYERS);
    expect(h).toBe("b=5");
    expect(decodeUrlState(`#${h}`, DEFAULT_LAYERS).briefingStep).toBe(4);
  });
  it("ignores malformed or hostile values", () => {
    const s = decodeUrlState("#m=evil&e=<script>&v=PURPLE&l=+nonsense,-relief&c=999,1,40&x=12&b=0", DEFAULT_LAYERS);
    expect(s.module).toBeUndefined();
    expect(s.eventId).toBeUndefined();
    expect(s.filters?.evidence).toEqual([]);
    expect(s.layers).toEqual({ relief: false });
    expect(s.view).toBeUndefined();
    expect(s.escalation).toBeUndefined();
    expect(s.briefingStep).toBeUndefined();
  });
});
