// Geometry for ILLUSTRATIVE vectors. Nothing here represents real flight paths, launch points,
// firing solutions or weapon trajectories. Origins are abstract sector anchors.
import { TARGET_BY_ID } from "@/data";
import type { VectorStyle } from "@/types";

export type LatLng = [number, number];

export interface Anchor {
  id: string;
  label: string;
  pos: LatLng;
}

/** Abstract origin anchors – deliberately generic points inside broad sectors, not bases. */
export const ANCHORS: Anchor[] = [
  { id: "ANC-IN-NORTH", label: "Indian side – northern sector (abstract origin)", pos: [33.3, 75.7] },
  { id: "ANC-IN-PUNJAB", label: "Indian side – western/Punjab sector (abstract origin)", pos: [31.0, 75.1] },
  { id: "ANC-IN-RAJ", label: "Indian side – south-western sector (abstract origin)", pos: [27.8, 73.6] },
  { id: "ANC-IN-GUJ", label: "Indian side – Gujarat sector (abstract origin)", pos: [24.3, 71.0] },
  { id: "ANC-PK-NORTH", label: "Pakistani side – northern sector (abstract origin)", pos: [34.0, 73.2] },
  { id: "ANC-PK-PUNJAB", label: "Pakistani side – Punjab sector (abstract origin)", pos: [31.2, 73.4] },
  { id: "ANC-PK-SINDH", label: "Pakistani side – Sindh sector (abstract origin)", pos: [26.2, 69.4] },
];
const ANCHOR_BY_ID = new Map(ANCHORS.map((a) => [a.id, a]));

const REGIONS: Record<string, LatLng> = {
  "PUNJAB-IN": [31.1, 75.4],
};

/** Resolve a vector endpoint token to a coordinate. */
export function resolveEndpoint(token: string): LatLng | null {
  if (token.startsWith("XLOC:")) {
    // Point across the LoC from a sector: notional, used only for artillery corridors.
    const t = TARGET_BY_ID.get(token.slice(5));
    return t ? [t.lat + 0.02, t.lng - 0.3] : null;
  }
  if (token.startsWith("REGION:")) return REGIONS[token.slice(7)] ?? null;
  const a = ANCHOR_BY_ID.get(token);
  if (a) return a.pos;
  const t = TARGET_BY_ID.get(token);
  return t ? [t.lat, t.lng] : null;
}

export function anchorLabel(token: string): string {
  if (token.startsWith("XLOC:")) return "Across the LoC (notional)";
  if (token.startsWith("REGION:")) return "Broad region (bases not named)";
  return ANCHOR_BY_ID.get(token)?.label ?? TARGET_BY_ID.get(token)?.name ?? token;
}

/** Quadratic-bezier arc between two points, bowed to one side. */
export function arcPoints(from: LatLng, to: LatLng, bow = 0.18, steps = 40): LatLng[] {
  const [y1, x1] = from;
  const [y2, x2] = to;
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2;
  const dx = x2 - x1,
    dy = y2 - y1;
  const cx = mx - dy * bow,
    cy = my + dx * bow;
  const pts: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    pts.push([y, x]);
  }
  return pts;
}

/** Small arrowhead triangle at the end of a polyline (in degrees; adequate at regional scale). */
export function arrowHead(pts: LatLng[], size = 0.16): LatLng[] {
  if (pts.length < 2) return [];
  const [ey, ex] = pts[pts.length - 1];
  const [py, px] = pts[Math.max(0, pts.length - 3)];
  const ang = Math.atan2(ey - py, ex - px);
  const a1 = ang + Math.PI * 0.85,
    a2 = ang - Math.PI * 0.85;
  return [
    [ey, ex],
    [ey + Math.sin(a1) * size, ex + Math.cos(a1) * size],
    [ey + Math.sin(a2) * size, ex + Math.cos(a2) * size],
  ];
}

export function midpoint(pts: LatLng[]): LatLng {
  return pts[Math.floor(pts.length / 2)] ?? pts[0];
}

export interface VectorStyleDef {
  color: string;
  dash?: string;
  weight: number;
  label: string;
}

export const VECTOR_STYLES: Record<VectorStyle, VectorStyleDef> = {
  indian_offensive: { color: "#4f8fe6", weight: 2.4, label: "Indian-reported offensive event" },
  indian_defensive: { color: "#5fbf7a", weight: 2.2, label: "Indian defensive event" },
  pakistani_attack: { color: "#e05252", weight: 2.2, label: "Pakistani attack (as reported by India)" },
  uav: { color: "#e3a83b", weight: 2, dash: "6 6", label: "UAV activity" },
  artillery: { color: "#d9773a", weight: 5, dash: "2 6", label: "Artillery event corridor" },
  unverified: { color: "#8a8f98", weight: 2, dash: "4 6", label: "Unverified / disputed claim" },
};

/** Spread an "intrusion front" sample of short illustrative arrows along a boundary polyline set. */
export function frontSamples(lines: LatLng[][], count = 14, len = 0.35): { from: LatLng; to: LatLng }[] {
  const flat = lines.flat();
  if (flat.length < 2) return [];
  const out: { from: LatLng; to: LatLng }[] = [];
  for (let i = 0; i < count; i++) {
    const p = flat[Math.floor(((i + 0.5) / count) * (flat.length - 1))];
    // point eastward (from Pakistani side toward Indian side), slight SE bias in the south
    const from: LatLng = [p[0] + 0.05, p[1] - len];
    const to: LatLng = [p[0] - 0.02, p[1] + len * 0.6];
    out.push({ from, to });
  }
  return out;
}
