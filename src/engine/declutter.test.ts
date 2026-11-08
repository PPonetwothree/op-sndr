import { describe, expect, it } from "vitest";
import { clusterPoints, placeLabels, labelWidth } from "./declutter";

const pt = (id: string, x: number, y: number) => ({ id, x, y, item: id });

describe("clusterPoints", () => {
  it("groups points within the radius and keeps distant ones apart", () => {
    const c = clusterPoints([pt("a", 0, 0), pt("b", 10, 0), pt("c", 100, 100)], 20);
    expect(c).toHaveLength(2);
    expect(c[0].members.map((m) => m.id)).toEqual(["a", "b"]);
    expect(c[0].x).toBe(5);
    expect(c[1].members.map((m) => m.id)).toEqual(["c"]);
  });
  it("returns every point alone when the radius is zero", () => {
    expect(clusterPoints([pt("a", 0, 0), pt("b", 1, 0)], 0)).toHaveLength(2);
  });
});

describe("placeLabels", () => {
  it("drops lower-priority labels that overlap a kept one", () => {
    const kept = placeLabels([
      { id: "PAKISTAN", x: 100, y: 100, w: 80, h: 14 },
      { id: "PUNJAB", x: 120, y: 104, w: 50, h: 12 },
      { id: "SINDH", x: 100, y: 200, w: 40, h: 12 },
    ]);
    expect([...kept]).toEqual(["PAKISTAN", "SINDH"]);
  });
  it("estimates wider boxes for more letter-spacing", () => {
    expect(labelWidth("INDIA", 12, 0.4)).toBeGreaterThan(labelWidth("INDIA", 12, 0.1));
  });
});
