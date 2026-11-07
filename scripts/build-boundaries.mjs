// Builds India's official-view outline, contested-area polygons and de facto lines.
//
// Inputs (public domain, Natural Earth 1:10m):
//   <dir>/ne_10m_admin_0_countries_ind.geojson   – countries as depicted from India's point of view
//   <dir>/ne_10m_admin_0_disputed_areas.geojson  – disputed / breakaway area polygons
//   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/<file>
// De facto lines come from world-atlas countries-10m (Natural Earth default, de facto view).
//
// Usage: node scripts/build-boundaries.mjs <dir-with-natural-earth-geojson>
// NOTE: Natural Earth's India view is an approximation, not a Survey of India product.
import { readFileSync, writeFileSync } from "node:fs";
import { mesh } from "topojson-client";

const dir = process.argv[2];
if (!dir) throw new Error("Pass the directory containing the Natural Earth GeoJSON files");

const BOX = [58, 16, 86, 40];
const r3 = (n) => Math.round(n * 1000) / 1000;

// Douglas–Peucker simplification (degrees)
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const sq = (p, a, b) => {
    const [x, y] = p,
      [x1, y1] = a,
      [x2, y2] = b;
    const dx = x2 - x1,
      dy = y2 - y1;
    const t = dx || dy ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy))) : 0;
    const px = x1 + t * dx - x,
      py = y1 + t * dy - y;
    return px * px + py * py;
  };
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0,
      idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = sq(pts[i], pts[s], pts[e]);
      if (d > max) ((max = d), (idx = i));
    }
    if (max > t2 && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]).map(([x, y]) => [r3(x), r3(y)]);
}
const inBox = (ring) => ring.some(([x, y]) => x >= BOX[0] && x <= BOX[2] && y >= BOX[1] && y <= BOX[3]);
const polys = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const simplePolys = (g, tol) =>
  polys(g)
    .filter((p) => inBox(p[0]))
    .map((p) => p.map((ring) => simplify(ring, tol)).filter((ring) => ring.length >= 4))
    .filter((p) => p.length);

// 1 · India – official view outline
const ind = JSON.parse(readFileSync(`${dir}/ne_10m_admin_0_countries_ind.geojson`, "utf8"));
const india = ind.features.find((f) => f.properties.ADMIN === "India");
const indiaOutline = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "India", depiction: "Natural Earth 1:10m, India point of view (approximate; not a Survey of India product)" },
      geometry: { type: "MultiPolygon", coordinates: simplePolys(india.geometry, 0.01) },
    },
  ],
};

// 2 · Contested areas
const LABELS = {
  "Azad Kashmir": { id: "POJK", label: "PoJK", sub: "Pakistan-administered · claimed by India", admin: "Pakistan" },
  "Gilgit-Baltistan": {
    id: "GB",
    label: "Gilgit-Baltistan",
    sub: "Pakistan-administered · claimed by India (part of PoJK in Indian usage)",
    admin: "Pakistan",
  },
  "Aksai Chin": { id: "AKSAI", label: "Aksai Chin", sub: "China-administered · claimed by India", admin: "China" },
  "Shaksam Valley": { id: "SHAKSGAM", label: "Shaksgam Valley", sub: "Ceded by Pakistan to China (1963) · claimed by India", admin: "China" },
  "Siachen Glacier": { id: "SIACHEN", label: "Siachen", sub: "India-held · AGPL with Pakistan · claimed by both", admin: "India" },
};
const da = JSON.parse(readFileSync(`${dir}/ne_10m_admin_0_disputed_areas.geojson`, "utf8"));
const contested = {
  type: "FeatureCollection",
  features: da.features
    .filter((f) => LABELS[f.properties.BRK_NAME])
    .map((f) => ({
      type: "Feature",
      properties: { ...LABELS[f.properties.BRK_NAME], neName: f.properties.BRK_NAME, neNote: f.properties.NOTE_BRK },
      geometry: { type: "MultiPolygon", coordinates: simplePolys(f.geometry, 0.004) },
    })),
};
const missing = Object.keys(LABELS).filter((k) => !contested.features.some((f) => f.properties.neName === k));
if (missing.length) throw new Error(`Missing contested areas: ${missing.join(", ")}`);

// 3 · De facto lines (10m): LoC / IB split, AGPL, LAC
const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const is = (o, n) => o.properties?.name === n;
const pair = (a, b) => (x, y) => (is(x, a) && is(y, b)) || (is(x, b) && is(y, a));
const lines = (m) => m.coordinates.map((l) => simplify(l, 0.003));
const indPak = lines(mesh(topo, topo.objects.countries, pair("India", "Pakistan")));
const LOC_LAT = 32.88;
const loc = [],
  ib = [];
for (const line of indPak) {
  let cur = [],
    curLoc = null;
  for (const pt of line) {
    const isLoc = pt[1] >= LOC_LAT;
    if (curLoc === null) curLoc = isLoc;
    if (isLoc !== curLoc) {
      cur.push(pt);
      (curLoc ? loc : ib).push(cur);
      cur = [pt];
      curLoc = isLoc;
    } else cur.push(pt);
  }
  if (cur.length > 1) (curLoc ? loc : ib).push(cur);
}
const agpl = lines(mesh(topo, topo.objects.countries, pair("Siachen Glacier", "Pakistan")));
const lac = [
  ...lines(mesh(topo, topo.objects.countries, pair("India", "China"))),
  ...lines(mesh(topo, topo.objects.countries, pair("Siachen Glacier", "China"))),
].filter((l) => l.some(([x]) => x < 81.5)); // western sector (Ladakh) within the map frame
const boundaries = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { kind: "LoC", label: "Line of Control (de facto, approximate)" }, geometry: { type: "MultiLineString", coordinates: loc } },
    {
      type: "Feature",
      properties: { kind: "IB", label: "International Border / Working Boundary (approximate)" },
      geometry: { type: "MultiLineString", coordinates: ib },
    },
    {
      type: "Feature",
      properties: { kind: "AGPL", label: "Actual Ground Position Line – Siachen (approximate)" },
      geometry: { type: "MultiLineString", coordinates: agpl },
    },
    {
      type: "Feature",
      properties: { kind: "LAC", label: "Line of Actual Control – western sector (de facto, approximate)" },
      geometry: { type: "MultiLineString", coordinates: lac },
    },
  ],
};

writeFileSync("src/data/geo/india-official.json", JSON.stringify(indiaOutline));
writeFileSync("src/data/geo/contested.json", JSON.stringify(contested));
writeFileSync("src/data/geo/boundaries.json", JSON.stringify(boundaries));
const pts = (fc) => JSON.stringify(fc).length;
console.log(
  "india-official bytes",
  pts(indiaOutline),
  "contested",
  pts(contested),
  contested.features.map((f) => f.properties.id).join(","),
  "boundaries",
  pts(boundaries),
  `LoC ${loc.length} IB ${ib.length} AGPL ${agpl.length} LAC ${lac.length}`
);
