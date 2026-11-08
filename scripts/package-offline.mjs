// Runs after `vite build --config vite.offline.config.ts`: renames the single file, writes a
// short README for recipients and prints the size and a checksum.
import { readFileSync, writeFileSync, renameSync, statSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const name = `operation-sindoor-v${pkg.version}.html`;
renameSync("dist-offline/index.html", `dist-offline/${name}`);
const html = readFileSync(`dist-offline/${name}`);
const sha = createHash("sha256").update(html).digest("hex");
const mb = (statSync(`dist-offline/${name}`).size / 1e6).toFixed(1);

writeFileSync(
  "dist-offline/README.txt",
  `Operation Sindoor – Multi-Domain Campaign Reconstruction Simulator
Offline edition, version ${pkg.version}

HOW TO OPEN
  Double-click ${name}. It opens in your web browser (Chrome, Edge or Firefox,
  current versions). No installation, server or internet connection is needed.
  The file can be copied to other computers or a USB stick.

WHAT WORKS OFFLINE
  Everything except the optional "Online dark tiles" map layer, which needs internet.
  Source links in event cards open the original web pages and also need internet.

HELP
  Press ? in the app for a quick start and the keyboard shortcuts.
  USER_GUIDE.md beside this file is the full user guide (any text editor opens it).

SAVED WORK
  Sessions, BDA edits, added sources, the audit log and tabletop exercises are kept
  in this browser on this computer. To move them to another computer, use
  Session → Export JSON and Import JSON. "Copy link" links work between copies of
  the same file version.

INTEGRITY
  SHA-256 of ${name}:
  ${sha}

Reconstruction from public accounts (Indian official, Pakistani official and independent). Vectors and formations are
illustrative; boundaries are approximate (not a Survey of India map).
`
);
copyFileSync("docs/USER_GUIDE.md", "dist-offline/USER_GUIDE.md");
console.log(`${name}  ${mb} MB  sha256 ${sha.slice(0, 16)}…`);
