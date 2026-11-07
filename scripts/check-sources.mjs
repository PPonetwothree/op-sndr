// Source health check: for every registered source, look up the closest Internet Archive
// (Wayback Machine) capture and probe whether the live URL still answers.
// Read-only: it never asks the Wayback Machine to create new captures.
// Each capture is then checked for a cited excerpt (from src/data/events.json): archiveStatus is
// content_verified, shell_only (page loads its text with JavaScript, capture is empty) or unchecked.
// PDFs are checked when `pdftotext` (poppler) is on PATH.
//
// Usage: node scripts/check-sources.mjs            → report only
//        node scripts/check-sources.mjs --write    → also write archiveUrl/archivedAt into src/data/sources.json
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const write = process.argv.includes("--write");
const path = "src/data/sources.json";
const sources = JSON.parse(readFileSync(path, "utf8"));
const UA = { "User-Agent": "sindoor-reconstruction-source-check/1.0" };
const events = JSON.parse(readFileSync("src/data/events.json", "utf8"));
const norm = (t) =>
  t
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();

/** Phrase to look for: first six words of an ASCII excerpt cited from this source. */
function needleFor(id) {
  const cit = events.flatMap((e) => e.provenance).find((c) => c.sourceId === id && /^[ -~]+$/.test(c.excerpt));
  return cit ? norm(cit.excerpt).split(" ").slice(0, 6).join(" ") : null;
}

function pdfText(buf) {
  const dir = mkdtempSync(join(tmpdir(), "srcchk-"));
  try {
    writeFileSync(join(dir, "a.pdf"), buf);
    execFileSync("pdftotext", ["-q", join(dir, "a.pdf"), join(dir, "a.txt")]);
    return readFileSync(join(dir, "a.txt"), "utf8");
  } catch {
    return null; // pdftotext not available
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function verifyCapture(archiveUrl, id) {
  const needle = needleFor(id);
  if (!needle) return "unchecked";
  try {
    const raw = archiveUrl.replace(/\/web\/(\d+)\//, "/web/$1id_/");
    const r = await fetch(raw, { headers: UA, signal: AbortSignal.timeout(60000) });
    const buf = Buffer.from(await r.arrayBuffer());
    const isPdf = buf.subarray(0, 4).toString() === "%PDF";
    const text = isPdf ? pdfText(buf) : buf.toString("utf8");
    if (text === null) return "unchecked";
    return norm(text).includes(needle) ? "content_verified" : "shell_only";
  } catch {
    return "unchecked";
  }
}

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
  // Fallback: the CDX index (newer captures can appear here before the availability API).
  // Only successful (HTTP 200) captures count – a capture of a block page is not an archive.
  for (const v of [...new Set(variants)]) {
    try {
      const q = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(v)}&output=json&filter=statuscode:200&limit=-1&fl=timestamp`;
      const r = await fetch(q, { headers: UA, signal: AbortSignal.timeout(30000) });
      const rows = await r.json();
      const ts = rows?.[1]?.[0];
      if (ts) return { url: `https://web.archive.org/web/${ts}/${v}`, timestamp: ts };
    } catch {
      /* index unavailable or not JSON – try next */
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
  const archiveStatus = snap ? await verifyCapture(snap.url, s.id) : undefined;
  rows.push({ id: s.id, live: status, archived: snap ? snap.timestamp.slice(0, 8) : "none", content: archiveStatus ?? "-" });
  if (write && snap) {
    s.archiveUrl = snap.url;
    s.archivedAt = `${snap.timestamp.slice(0, 4)}-${snap.timestamp.slice(4, 6)}-${snap.timestamp.slice(6, 8)}`;
    s.archiveStatus = archiveStatus;
  }
  if (write) s.lastChecked = new Date().toISOString().slice(0, 10);
}
console.table(rows);
if (write) {
  writeFileSync(path, JSON.stringify(sources, null, 2) + "\n");
  console.log("updated", path);
}
