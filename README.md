# Operation Sindoor – Multi-Domain Campaign Reconstruction Simulator

Locally hosted operational-history simulator reconstructing Operation Sindoor (7–10 May 2025) from public Indian government accounts.

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

### Offline edition (no server, no internet)

```bash
npm run build:offline
```

Produces `dist-offline/operation-sindoor-v<version>.html` – a single ~5.6 MB file with everything inlined – plus a `README.txt` with opening instructions and a SHA-256 checksum. Copy it to any computer or USB stick and double-click it to open in Chrome, Edge or Firefox. Everything works offline except the optional online tile layer and the external source links. Saved work stays in that browser; move it with Session → Export/Import JSON. `npm run test:offline` verifies the file from `file://` with the network blocked; CI publishes it as a build artifact.

### Quality checks

| Command                             | What it does                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `npm run check`                     | Lint, formatting check, type-check, unit + data tests, production build                |
| `npm test`                          | Vitest: schema/reference validation, engine, analytics, stated-distance checks         |
| `npm run test:e2e`                  | Playwright against the production build (first run: `npx playwright install chromium`) |
| `npm run lint` / `npm run format`   | ESLint / Prettier                                                                      |
| `npm run build-data`                | Regenerate basemap, JSON databases and pre-rendered symbols from `scripts/`            |
| `npm run build-boundaries -- <dir>` | Rebuild India-view boundary and contested areas from Natural Earth files               |
| `npm run check-sources`             | Probe source URLs and look up Internet Archive captures (`-- --write` to record them)  |
| `npm run build-admin1 -- <dir>`     | Rebuild state/UT and province boundaries and labels from Natural Earth admin-1 files   |

CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request. See [CHANGELOG.md](CHANGELOG.md).

## Modules

| Module                    | What it does                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A · Campaign Overview     | 8 KPI tiles (record counts), four day cards with drill-down, campaign timeline, 10 dynamic charts (each with a data-table view)                                                                                                                                                                                                                                                  |
| B · Geospatial Operations | Offline map with relief, India-view boundary, contested areas, state lines and day/night shading; layer toggles; illustrative animated vectors with age fade; APP-6 symbols; uncertainty rings; scale, north arrow, MGRS readout, inset; filters, time slider, day comparison; map PNG (title block, legend, sources), events & targets CSV; guided briefing (16 narrated steps) |
| C · Force & Weapons DB    | Indian/adversary force categories, system cards (usage status, linked events, sources), abstract force-package view; hypothetical package builder in hypothetical mode                                                                                                                                                                                                           |
| D · Damage Assessment     | Editable BDA record per location (0–5 scale, claim vs independent verification), schematic (not imagery), evidence timeline, BDA charts, BDA CSV                                                                                                                                                                                                                                 |
| E · Escalation Matrix     | Interactive ladder 0–7 linked to map and timeline highlight, matrix PDF; separate turn-based tabletop exercise with umpire rulings, log export and rung trace                                                                                                                                                                                                                    |
| F · After-Action Review   | Sections A–E with basis labels, evidence scorecard (no invented scores), full campaign PDF, print-friendly report                                                                                                                                                                                                                                                                |
| S · Source Management     | Source register with retrieval status and archive links, manual source entry (validated), link sources to events, audit log (analyst, before/after), sources and audit CSV                                                                                                                                                                                                       |
| M · Methods & Data        | Method statement, evidence rules, known limitations, how to cite, and the data dictionary                                                                                                                                                                                                                                                                                        |

Sessions (header → Session) save/load to the browser or export/import JSON, including BDA edits, the tabletop exercise, analyst-linked sources and the audit log. **Copy link** (header) gives a URL that reopens the current view – module, briefing step or event, filters, layers and map position.

Rules enforced in code: an official claim can never be GREEN; GREEN needs a Pakistani acknowledgement, an independent account or an Indian statement against interest (shown under "Accounts compared"); a BDA record can only be set to "independently verified" when a GREEN source is attached; attaching or linking a source never changes an evidence class by itself.

## Data and provenance

- `src/data/events.json` – 55 events (22 Apr – 12 May 2025), each citing ≥1 source.
- `src/data/targets.json` – 58 locations at **town/district level** (public gazetteer points, not impact points).
- `src/data/weapons.json` – 30 systems; usage status reflects only what retrieved sources state.
- `src/data/sources.json` – 18 sources with retrieval status (read in full / partially read / cited, not retrieved).
- The JSON files are generated from `scripts/*.src.mjs` (edit those, then `npm run build-data`).

Evidence classes: **GREEN** independently corroborated · **BLUE** official Indian account · **AMBER** media/analytical reconstruction · **GREY** unverified/disputed. Schema rules prevent official claims being marked GREEN and clock times being set unless a source states them.

## Representation rules

- Vectors start at **abstract sector anchors** and are labelled as illustrative – not flight paths, launch points, trajectories or firing solutions.
- Formations show `FORMATION UNKNOWN – ABSTRACT REPRESENTATION` unless publicly described.
- Boundaries: **India's official view is the primary outline** (Natural Earth 1:10m India point-of-view layer, dash-dot line). Contested areas are hatched and labelled: PoJK, Gilgit-Baltistan, Aksai Chin, Shaksgam Valley, Siachen, plus an indicative Sir Creek marker (not in Natural Earth, no line drawn). De facto LoC, IB, LAC (western sector) and AGPL are overlaid as labelled dashed lines (Natural Earth 1:10m via `world-atlas`). All approximate – **not a Survey of India map**; replace `src/data/geo/india-official.json` with Survey of India data for authoritative depiction.
- Regenerate boundaries: download `ne_10m_admin_0_countries_ind.geojson` and `ne_10m_admin_0_disputed_areas.geojson` from github.com/nvkelso/natural-earth-vector (`geojson/`) into a folder, then `npm run build-boundaries -- <folder>`.
- Terrain relief: Natural Earth 1:10m shaded relief (`SR_HR`), cropped to 58–86°E / 16–40°N, reprojected to Web Mercator and converted to a transparent dark-theme overlay (`src/assets/relief/hillshade.png`, ~2.4 MB, bundled).
- Symbology: APP-6 / MIL-STD-2525C frames via [milsymbol](https://github.com/spatialillusions/milsymbol) for military locations (Indian perspective: struck locations hostile, Indian locations friendly); civilian/LoC/context locations keep simple glyphs. Toggle in Layers.
- Uncertainty: dashed rings show plotting precision (town 5 km, district 15 km, regional 50 km). Selecting a 7 May camp draws the briefers' stated distance from the LoC/IB against the distance measured on this map; a red label marks a mismatch (Sarjal and Mehmoona Joya were re-positioned to OpenStreetMap village locations named in media reports and now match; Gulpur measures ~23 km against a stated ~30 km and sits within tolerance).
- Optional online dark tiles © OpenStreetMap © CARTO.
- No imagery is generated or simulated.
