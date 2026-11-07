import { describe, expect, it } from "vitest";
import { sunAltitude, nightPolygon } from "./solar";
import { toMs } from "./timelineEngine";

describe("solar position", () => {
  it("7 May strike window (01:05–01:30 IST) was night at Bahawalpur and Muzaffarabad", () => {
    expect(sunAltitude(29.39, 71.68, toMs("2025-05-07T01:15"))).toBeLessThan(-30);
    expect(sunAltitude(34.37, 73.47, toMs("2025-05-07T01:15"))).toBeLessThan(-30);
  });
  it("is day at local noon in early May with the sun high over Punjab", () => {
    const alt = sunAltitude(31.5, 74.3, toMs("2025-05-08T12:20"));
    expect(alt).toBeGreaterThan(70);
    expect(alt).toBeLessThan(82);
  });
  it("cessation at 17:00 IST on 10 May was still daylight in Delhi", () => {
    expect(sunAltitude(28.61, 77.21, toMs("2025-05-10T17:00"))).toBeGreaterThan(5);
  });
  it("night polygon closes on the southern pole in northern summer", () => {
    const poly = nightPolygon(toMs("2025-05-07T01:15"));
    expect(poly[0][0]).toBe(-90);
    expect(poly.length).toBeGreaterThan(300);
  });
});
