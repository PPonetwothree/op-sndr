// Builds src/data/recordHistory.json: what changed in each event and in the source register
// from one release to the next, so upgrades and corrections can be audited and a citation of
// the app can name the data a reader saw.
//
// Release snapshots come from git: for each package.json version, the last commit carrying it.
// The working tree stands in for the current version (so a release can be prepared before commit).
// Run: npm run build-history   (needs git; the output is committed, so builds do not need git)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const atRef = (ref, path) => {
  try {
    return JSON.parse(git("show", `${ref}:${path}`));
  } catch {
    return null;
  }
};

// ── release snapshots ──
// A release is, in order of preference: its tag (vX.Y.Z), the commit titled "Release X.Y.Z…",
// or failing both the last commit carrying that version. (Data for a release is often committed
// before the version bump, so "last commit with the previous version" would misattribute it.)
const commits = git("log", "--reverse", "--format=%h\t%ad\t%s", "--date=short").trim().split("\n");
const tags = new Set(git("tag").trim().split("\n").filter(Boolean));
const byVersion = new Map();
for (const line of commits) {
  const [ref, date, subject] = line.split("\t");
  const pkg = atRef(ref, "package.json");
  if (!pkg?.version) continue;
  const v = pkg.version;
  const known = byVersion.get(v);
  if (known?.how === "tag" || known?.how === "release-commit") continue;
  byVersion.set(v, { version: v, ref, date, how: subject.startsWith(`Release ${v}`) ? "release-commit" : "last-commit" });
}
for (const v of byVersion.keys()) {
  if (tags.has(`v${v}`)) {
    const [ref, date] = git("log", "-1", "--format=%h\t%ad", "--date=short", `v${v}`).trim().split("\t");
    byVersion.set(v, { version: v, ref, date, how: "tag" });
  }
}
const current = JSON.parse(readFileSync("package.json", "utf8")).version;
const today = new Date().toISOString().slice(0, 10);
byVersion.set(current, { version: current, ref: "working-tree", date: byVersion.get(current)?.date ?? today, how: "working-tree" });

const cmp = (a, b) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};
const releases = [...byVersion.values()].sort((a, b) => cmp(a.version, b.version));

const load = (rel, path) => (rel.ref === "working-tree" ? JSON.parse(readFileSync(path, "utf8")) : atRef(rel.ref, path)) ?? [];

// ── what is compared ──
const casualtyText = (c) => (c ? `${c.killed ?? "–"} killed, ${c.injured ?? "–"} injured` : "not stated");
const damageText = (d) => (d ? `${d.status}${d.level === null || d.level === undefined ? "" : `, L${d.level}`}` : "–");
const FIELDS = [
  ["title", (e) => e.title],
  ["evidenceClass", (e) => e.evidenceClass],
  ["evidenceType", (e) => e.evidenceType],
  ["verified", (e) => String(e.verified)],
  ["time", (e) => (e.time ? `${e.time} (${e.timeBasis})` : `unknown (${e.timeBasis})`)],
  ["location", (e) => e.location?.name ?? "–"],
  ["casualties", (e) => casualtyText(e.casualties)],
  ["damage", (e) => damageText(e.damageAssessment)],
  ["citations", (e) => String((e.provenance ?? []).length)],
  ["accounts", (e) => String((e.accounts ?? []).length)],
];

const history = { releases, events: {}, sources: [] };

for (let i = 1; i < releases.length; i++) {
  const prev = releases[i - 1];
  const rel = releases[i];
  const before = new Map(load(prev, "src/data/events.json").map((e) => [e.id, e]));
  const after = load(rel, "src/data/events.json");

  for (const e of after) {
    const old = before.get(e.id);
    const entry = { version: rel.version, date: rel.date, changes: [], sourcesAdded: [], sourcesRemoved: [] };
    if (!old) {
      entry.changes.push({ field: "event", from: null, to: "added" });
    } else {
      if (old.title !== e.title && old.date !== e.date) {
        // a different event under the same ID would make the history meaningless
        throw new Error(`${e.id} changed identity between ${prev.version} and ${rel.version}`);
      }
      for (const [field, get] of FIELDS) {
        const a = get(old);
        const b = get(e);
        if (a !== b) entry.changes.push({ field, from: a, to: b });
      }
      entry.sourcesAdded = e.sources.filter((s) => !old.sources.includes(s));
      entry.sourcesRemoved = old.sources.filter((s) => !e.sources.includes(s));
    }
    if (entry.changes.length || entry.sourcesAdded.length || entry.sourcesRemoved.length) (history.events[e.id] ??= []).push(entry);
  }
  for (const id of before.keys()) {
    if (!after.some((e) => e.id === id))
      (history.events[id] ??= []).push({
        version: rel.version,
        date: rel.date,
        changes: [{ field: "event", from: "present", to: "removed" }],
        sourcesAdded: [],
        sourcesRemoved: [],
      });
  }

  const sBefore = new Map(load(prev, "src/data/sources.json").map((s) => [s.id, s]));
  for (const s of load(rel, "src/data/sources.json")) {
    const old = sBefore.get(s.id);
    if (!old) history.sources.push({ version: rel.version, sourceId: s.id, change: "added", detail: `${s.publisher} · ${s.retrieval}` });
    else if (old.retrieval !== s.retrieval)
      history.sources.push({ version: rel.version, sourceId: s.id, change: "retrieval", detail: `${old.retrieval} → ${s.retrieval}` });
    else if (old.title !== s.title) history.sources.push({ version: rel.version, sourceId: s.id, change: "title", detail: `${old.title} → ${s.title}` });
  }
}

writeFileSync("src/data/recordHistory.json", JSON.stringify(history, null, 1) + "\n");
const n = Object.values(history.events).reduce((a, l) => a + l.length, 0);
console.log(
  `record history: ${releases.length} releases (${releases.map((r) => r.version).join(", ")}), ${n} event revisions, ${history.sources.length} source changes`
);
