import { describe, expect, it } from "vitest";
import { TARGETS } from "@/data";
import { haversineKm, nearestOnLine } from "./geoMeasure";

describe("geo measurement", () => {
  it("haversine is correct for a known pair (Delhi–Lahore ≈ 425 km)", () => {
    expect(haversineKm([28.61, 77.21], [31.55, 74.34])).toBeGreaterThan(410);
    expect(haversineKm([28.61, 77.21], [31.55, 74.34])).toBeLessThan(440);
  });
  it("measures every stated-distance target against the LoC/IB", () => {
    const rows = TARGETS.filter((t) => t.statedDistance).map((t) => {
      const n = nearestOnLine([t.lat, t.lng], t.statedDistance!.from)!;
      return { id: t.id, stated: t.statedDistance!.km.join("–"), from: t.statedDistance!.from, measured: Math.round(n.km) };
    });
    console.table(rows);
    expect(rows).toHaveLength(8);
    rows.forEach((r) => expect(r.measured).toBeLessThan(160));
    // Plotted positions must agree with the briefers' stated distances (same tolerance as the map label).
    TARGETS.filter((t) => t.statedDistance).forEach((t) => {
      const [lo, hi] = t.statedDistance!.km;
      const tol = Math.max(3, hi * 0.4);
      const m = Math.round(nearestOnLine([t.lat, t.lng], t.statedDistance!.from)!.km);
      expect(m, `${t.id} measured ${m} km vs stated ${lo}–${hi}`).toBeGreaterThanOrEqual(lo - tol);
      expect(m, `${t.id} measured ${m} km vs stated ${lo}–${hi}`).toBeLessThanOrEqual(hi + tol);
    });
  });
});
