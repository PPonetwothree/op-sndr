// Screen-space decluttering: group nearby markers and drop colliding labels.
// Pure functions over pixel positions so they can be unit-tested without a map.

export interface ScreenPoint<T> {
  id: string;
  x: number;
  y: number;
  item: T;
}

export interface Cluster<T> {
  x: number; // centroid
  y: number;
  members: ScreenPoint<T>[];
}

/**
 * Greedy grouping: each point joins the first cluster whose seed lies within `radius` px,
 * otherwise it seeds a new one. Input order is the priority order (first = seed preference).
 */
export function clusterPoints<T>(points: ScreenPoint<T>[], radius: number): Cluster<T>[] {
  const seeds: { x: number; y: number; members: ScreenPoint<T>[] }[] = [];
  const r2 = radius * radius;
  for (const p of points) {
    const hit = seeds.find((s) => (s.x - p.x) ** 2 + (s.y - p.y) ** 2 <= r2);
    if (hit) hit.members.push(p);
    else seeds.push({ x: p.x, y: p.y, members: [p] });
  }
  return seeds.map((s) => ({
    x: s.members.reduce((a, m) => a + m.x, 0) / s.members.length,
    y: s.members.reduce((a, m) => a + m.y, 0) / s.members.length,
    members: s.members,
  }));
}

export interface LabelBox {
  id: string;
  x: number; // centre
  y: number;
  w: number;
  h: number;
}

/** Keep labels in priority order (input order), dropping any that overlap one already kept. */
export function placeLabels(labels: LabelBox[], pad = 2): Set<string> {
  const kept: LabelBox[] = [];
  const overlaps = (a: LabelBox, b: LabelBox) => Math.abs(a.x - b.x) * 2 < a.w + b.w + pad * 2 && Math.abs(a.y - b.y) * 2 < a.h + b.h + pad * 2;
  for (const l of labels) if (!kept.some((k) => overlaps(k, l))) kept.push(l);
  return new Set(kept.map((k) => k.id));
}

/** Approximate rendered width of an uppercase, letter-spaced label. */
export const labelWidth = (text: string, fontPx: number, trackingEm: number) => Math.ceil(text.length * fontPx * (0.68 + trackingEm));
