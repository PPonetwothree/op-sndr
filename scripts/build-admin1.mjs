// Builds state / UT (India) and province (Pakistan) boundary lines and label points from
// Natural Earth 1:10m admin-1 data.
//
// Inputs (public domain): <dir>/ne_10m_admin_1_states_provinces_lines.geojson
//                         <dir>/ne_10m_admin_1_states_provinces.geojson
//   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/<file>
// Usage: node scripts/build-admin1.mjs <dir>
//
// Lines touching Azad Kashmir or the Northern Areas are omitted: those areas are drawn by the
// contested-area layer under India's official view. Natural Earth's J&K / Ladakh units follow the
// administered (de facto) extent, so their internal line is shown only within Indian administration.
import { readFileSync, writeFileSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("Pass the directory containing the Natural Earth admin-1 GeoJSON files");

const BOX = [60, 18, 84, 38];
const r3 = (n) => Math.round(n * 1000) / 1000;
function simplify(pts, tol) {
  if (pts.length < 3) return pts.map(([x, y]) => [r3(x), r3(y)]);
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const d2 = ([x, y], [x1, y1], [x2, y2]) => {
    const dx = x2 - x1,
      dy = y2 - y1;
    const t = dx || dy ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy))) : 0;
    return (x1 + t * dx - x) ** 2 + (y1 + t * dy - y) ** 2;
  };
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0,
      idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = d2(pts[i], pts[s], pts[e]);
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol * tol && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]).map(([x, y]) => [r3(x), r3(y)]);
}
const inBox = (line) => line.some(([x, y]) => x >= BOX[0] && x <= BOX[2] && y >= BOX[1] && y <= BOX[3]);

const EXCLUDE = /Azad Kashmir|Northern Areas/;
const lines = JSON.parse(readFileSync(`${dir}/ne_10m_admin_1_states_provinces_lines.geojson`, "utf8"));
const features = lines.features
  .filter((f) => ["India", "Pakistan"].includes(f.properties.ADM0_NAME) && f.properties.FEATURECLA === "Admin-1 boundary")
  .filter((f) => !EXCLUDE.test(`${f.properties.NAME_L} ${f.properties.NAME_R}`))
  .map((f) => {
    const g = f.geometry;
    const parts = (g.type === "LineString" ? [g.coordinates] : g.coordinates).filter(inBox).map((l) => simplify(l, 0.005));
    return parts.length
      ? {
          type: "Feature",
          properties: { country: f.properties.ADM0_NAME, left: f.properties.NAME_L, right: f.properties.NAME_R },
          geometry: { type: "MultiLineString", coordinates: parts },
        }
      : null;
  })
  .filter(Boolean);

// Label points from the polygon layer (Natural Earth's own label anchors)
const LABELS = {
  India: ["Jammu and Kashmir", "Ladakh", "Himachal Pradesh", "Punjab", "Haryana", "Delhi", "Rajasthan", "Gujarat", "Uttarakhand", "Uttar Pradesh", "Madhya Pradesh", "Maharashtra", "Chandigarh"],
  Pakistan: ["Punjab", "Sind", "Baluchistan", "K.P.", "F.C.T."],
};
const DISPLAY = { "Jammu and Kashmir": "Jammu & Kashmir", Sind: "Sindh", Baluchistan: "Balochistan", "K.P.": "Khyber Pakhtunkhwa", "F.C.T.": "Islamabad", Punjab: "Punjab" };
const polys = JSON.parse(readFileSync(`${dir}/ne_10m_admin_1_states_provinces.geojson`, "utf8"));
const labels = polys.features
  .filter((f) => LABELS[f.properties.admin]?.includes(f.properties.name))
  .map((f) => ({
    name: (DISPLAY[f.properties.name] ?? f.properties.name) + (f.properties.admin === "Pakistan" && f.properties.name === "Punjab" ? " (Pak)" : ""),
    country: f.properties.admin,
    lat: r3(f.properties.latitude),
    lng: r3(f.properties.longitude),
    minZoom: ["Delhi", "Chandigarh", "F.C.T.", "Haryana"].includes(f.properties.name) ? 6 : 4,
  }));

writeFileSync("src/data/geo/admin1.json", JSON.stringify({ type: "FeatureCollection", features, labels }));
console.log("admin-1 lines:", features.length, "labels:", labels.map((l) => l.name).join(", "), "bytes:", JSON.stringify(features).length);
