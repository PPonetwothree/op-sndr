// Small geodesy helpers for measurement overlays (accurate enough at theatre scale).
import boundariesRaw from "@/data/geo/boundaries.json";
import type { FeatureCollection, MultiLineString } from "geojson";

export type LL = [number, number]; // [lat, lng]

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: LL, b: LL): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const boundaries = boundariesRaw as unknown as FeatureCollection<MultiLineString, { kind: string }>;
const LINES: Record<"LoC" | "IB", LL[][]> = { LoC: [], IB: [] };
boundaries.features.forEach((f) => {
  const k = f.properties.kind;
  if (k === "LoC" || k === "IB") LINES[k] = f.geometry.coordinates.map((l) => l.map(([x, y]) => [y, x] as LL));
});

/** Nearest point on the LoC or IB to p (local equirectangular projection around p). */
export function nearestOnLine(p: LL, which: "LoC" | "IB"): { point: LL; km: number } | null {
  const kx = Math.cos(rad(p[0]));
  let best: { point: LL; km: number } | null = null;
  for (const line of LINES[which]) {
    for (let i = 0; i < line.length - 1; i++) {
      const [ay, ax] = line[i];
      const [by, bx] = line[i + 1];
      const vx = (bx - ax) * kx,
        vy = by - ay;
      const wx = (p[1] - ax) * kx,
        wy = p[0] - ay;
      const len = vx * vx + vy * vy;
      const t = len ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / len)) : 0;
      const q: LL = [ay + t * (by - ay), ax + t * (bx - ax)];
      const km = haversineKm(p, q);
      if (!best || km < best.km) best = { point: q, km };
    }
  }
  return best;
}

export const PRECISION_RADIUS_KM: Record<string, number> = {
  site_reported: 1,
  town: 5,
  district: 15,
  regional: 50,
};
