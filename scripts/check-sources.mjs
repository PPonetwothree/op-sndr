// Source health check: for every registered source, look up the closest Internet Archive
// (Wayback Machine) capture and probe whether the live URL still answers.
// Read-only: it never asks the Wayback Machine to create new captures.
//
// Usage: node scripts/check-sources.mjs            → report only
//        node scripts/check-sources.mjs --write    → also write archiveUrl/archivedAt into src/data/sources.json
import { readFileSync, writeFileSync } from "node:fs";

const write = process.argv.includes("--write");
const path = "src/data/sources.json";
const sources = JSON.parse(readFileSync(path, "utf8"));
const UA = { "User-Agent": "sindoor-reconstruction-source-check/1.0" };

async function wayback(url) {
  // Try the URL as registered, then common variants (MEA uses both media-briefings.htm and media-briefings).
  const variants = [url, url.replace("media-briefings.htm?", "media-briefings?"), url.replace(/&reg=\d+&lang=\d+$/, "")];
  for (const v of [...new Set(variants)]) {
    try {
      const r = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(v)}`, { headers: UA });
      const j = await r.json();
      const snap = j?.archived_snapshots?.closest;
      if (snap?.available) return { url: snap.url.replace(/^http:/, "https:"), timestamp: snap.timestamp };
    } catch {
      /* try next */
    }
  }
  return null;
}

async function live(url) {
  try {
    const r = await fetch(url, { method: "GET", redirect: "follow", headers: UA, signal: AbortSignal.timeout(15000) });
    return r.status;
  } catch (e) {
    return `error: ${e.cause?.code ?? e.name}`;
  }
}

const rows = [];
for (const s of sources) {
  if (s.sourceType === "user_added") continue;
  const [snap, status] = await Promise.all([wayback(s.url), live(s.url)]);
  rows.push({ id: s.id, live: status, archived: snap ? snap.timestamp.slice(0, 8) : "none" });
  if (write && snap) {
    s.archiveUrl = snap.url;
    s.archivedAt = `${snap.timestamp.slice(0, 4)}-${snap.timestamp.slice(4, 6)}-${snap.timestamp.slice(6, 8)}`;
  }
  if (write) s.lastChecked = new Date().toISOString().slice(0, 10);
}
console.table(rows);
if (write) {
  writeFileSync(path, JSON.stringify(sources, null, 2) + "\n");
  console.log("updated", path);
}
