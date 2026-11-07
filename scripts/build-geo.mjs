// Builds the bundled offline basemap layers from Natural Earth (via world-atlas, 50m).
// Natural Earth depicts de facto (administered) boundaries; the India–Pakistan
// line north of ~32.88°N is labelled as the Line of Control (approximate).
import { readFileSync, writeFileSync } from "node:fs";
import { feature, mesh } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-50m.json", "utf8"));
const KEEP = new Set(["India", "Pakistan", "Afghanistan", "China", "Nepal", "Iran", "Siachen Glacier", "Bhutan", "Tajikistan", "Bangladesh", "Oman"]);
const BBOX = [58, 18, 84, 39];
const inBox = ([x, y]) => x >= BBOX[0] - 6 && x <= BBOX[2] + 6 && y >= BBOX[1] - 6 && y <= BBOX[3] + 6;
const r = (n) => Math.round(n * 1000) / 1000;
const roundRing = (ring) => ring.map(([x, y]) => [r(x), r(y)]);

const all = feature(topo, topo.objects.countries);
const countries = {
  type: "FeatureCollection",
  features: all.features
    .filter((f) => KEEP.has(f.properties.name))
    .map((f) => {
      const g = f.geometry;
      const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
      const kept = polys.filter((p) => p[0].some(inBox)).map((p) => p.map(roundRing));
      return { type: "Feature", properties: { name: f.properties.name }, geometry: { type: "MultiPolygon", coordinates: kept } };
    })
    .filter((f) => f.geometry.coordinates.length > 0),
};

const byName = (n) => (o) => o.properties && o.properties.name === n;
const geoms = topo.objects.countries.geometries;
const isName = (o, n) => o.properties?.name === n;
const indPak = mesh(topo, topo.objects.countries, (a, b) => (isName(a, "India") && isName(b, "Pakistan")) || (isName(a, "Pakistan") && isName(b, "India")));
const siaPak = mesh(topo, topo.objects.countries, (a, b) => (isName(a, "Siachen Glacier") && isName(b, "Pakistan")) || (isName(a, "Pakistan") && isName(b, "Siachen Glacier")));
void byName; void geoms;

// Split India–Pakistan line into LoC (north) and International Border / Working Boundary (south).
const LOC_LAT = 32.88;
const loc = [], ib = [];
for (const line of indPak.coordinates) {
  let cur = [], curIsLoc = null;
  for (const pt of line) {
    const isLoc = pt[1] >= LOC_LAT;
    if (curIsLoc === null) curIsLoc = isLoc;
    if (isLoc !== curIsLoc) {
      cur.push(pt);
      (curIsLoc ? loc : ib).push(roundRing(cur));
      cur = [pt]; curIsLoc = isLoc;
    } else cur.push(pt);
  }
  if (cur.length > 1) (curIsLoc ? loc : ib).push(roundRing(cur));
}
const boundaries = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { kind: "LoC", label: "Line of Control (approximate, de facto)" }, geometry: { type: "MultiLineString", coordinates: loc } },
    { type: "Feature", properties: { kind: "IB", label: "International Border / Working Boundary (approximate)" }, geometry: { type: "MultiLineString", coordinates: ib } },
    { type: "Feature", properties: { kind: "AGPL", label: "Siachen sector – AGPL (approximate)" }, geometry: { type: "MultiLineString", coordinates: siaPak.coordinates.map(roundRing) } },
  ],
};

writeFileSync("src/data/geo/countries.json", JSON.stringify(countries));
// boundaries.json is now produced at 1:10m by scripts/build-boundaries.mjs
void boundaries;
console.log("countries:", countries.features.map((f) => f.properties.name).join(", "));
console.log("LoC segments:", loc.length, "IB segments:", ib.length);
