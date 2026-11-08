# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.10.0] – 2026-11-08 · Record history

### Added

- Record history on every event card: what changed in that event in each release (evidence class, evidence type, verified, time, location, casualties, damage, citations, other accounts) and which sources came in with the change.
- Methods → Changes in the record: a per-release table of events changed, evidence-class changes, events added and sources added. Tracking starts at 0.1.0.
- `npm run build-history` (also run by `npm run build-data`): builds `src/data/recordHistory.json` from git, taking each release from its tag, else its "Release X.Y.Z" commit, else the last commit carrying that version; the working tree stands in for the version being prepared. It stops with an error if an event ID ever points to a different event.
- Tests: the history must reach the current version, refer only to existing events and sources, and record the 0.6.0 upgrades (18 × BLUE→GREEN, EVT-055 added).

### Changed

- User guide and maintainer guide: record history, versioned citing, and the release steps (build the history; commit as "Release X.Y.Z" and tag).

## [0.9.0] – 2026-11-08 · Later official statements and remaining evidence gaps

### Added

- The Defence Minister's Lok Sabha speech of 28 Jul 2025 (PIB, read in full): over 100 killed at nine targets; the 10 May attack "foiled" with S-400, Akash and AD guns named; "none of the important assets were damaged"; "none of soldiers suffered any casualties". Cited on the outcome, 10 May attack and Indian-damage events; S-400 and Akash entries updated.
- The Ministry of Defence statement of 27 Jun 2026 (PIB): the "no casualties" remark answered false claims of lost pilots; the fallen are inscribed at the National War Memorial. Recorded beside the speech and the DGMO's 11 May tribute to five fallen, so the apparent contradiction is visible and explained.
- Damien Symon's imagery of a damaged command-and-control building at Murid (via Onmanorama/IANS) as an independent account and an imagery-register entry. The damage level is unchanged because the report is a media relay.

### Changed

- Methods → Known limitations: Chunian, Pasrur, Sialkot and Skardu rest on Indian accounts and IAF-released imagery only; later official statements are shown beside earlier ones rather than replacing them.

### Not changed

- No new GREEN upgrades: no independent source was found for the remaining official-only events. Press reports that the Minister said "seven camps" were not used; the official text says nine.

## [0.8.0] – 2026-11-08 · Guides and in-app help

### Added

- [User guide](docs/USER_GUIDE.md): opening the app, reading an event card, the map, the guided briefing, each module, the tabletop exercise, saving and sharing, citing, shortcuts and troubleshooting. Shipped beside the offline file as `USER_GUIDE.md`.
- [Maintaining the data](docs/MAINTAINING.md): where each kind of record lives, the edit–build–check workflow, and how to add sources, events, citations, accounts, GREEN upgrades, independent assessments and imagery without breaking the evidence rules.
- In-app help panel (**?** key or the header's **Help** button): quick start, evidence classes, keyboard shortcuts and a link to the Methods page. It is modal, keyboard-accessible and audited with axe-core.
- Tests: the guide must list every shortcut the help panel shows, and the offline package must include the guide.

### Changed

- README: links to both guides; source count and description updated.
- Offline `README.txt` points to the help panel and the bundled guide.

## [0.7.0] – 2026-11-08 · Primary-source gaps, published imagery, decluttered map

### Added

- Published-imagery register (`src/data/imagery.ts`): Maxar imagery of six air bases (India Today, 13 May), Damien Symon's 23 May imagery of Nur Khan (ThePrint), the Stimson Center's imagery review, IAF-released imagery, and the New York Times and Washington Post analyses by headline only. Shown on event cards, damage records and the Methods page; images are linked to their publishers, never reproduced.
- Map decluttering (on by default, layer "Group nearby markers & hide overlapping labels"): inactive markers within 22 px group into a numbered badge below zoom 8, and a click zooms in to them. Selected and active markers are never grouped. Region labels that would overlap a more important label are hidden.
- Sources: PTI wire report of the 11 May tri-service briefing (AMBER), NYT imagery analysis (headline only), India Today and ThePrint imagery reports.

### Changed

- MoD Year End Review 2025 and the PIB Akashteer backgrounder are now read in full and cited: Pakistan's 10 May attack "at approx. 1:30 am", the air bases struck, the 12 May DGMO talks, and Akashteer as the Army's AD control and reporting system.
- 11 May briefing (via PTI): DGMO's "reports of 35–40" Pakistani military fatalities and five Indian fallen, with Pakistan's own figure (11 personnel) alongside; DGAO's "Losses are a part of combat" and "a few" Pakistani planes downed added to the air-engagement accounts.
- Washington Post source title corrected to "…Post analysis finds", with authors.

### Fixed

- A fresh load wrote the starting clock into the URL, so a reload or a shared link moved the playhead past the prelude and the first step skipped the Pahalgam attack. An untouched clock is no longer written. This was the cause of an intermittent e2e failure.

## [0.6.0] – 2026-11-08 · Other accounts and independent corroboration

### Added

- Events carry `accounts[]` from other parties: Pakistani official statements (DG ISPR, via Dawn and Radio Pakistan), independent analyses (Stimson Center imagery review, Al Jazeera on-site reporting at Muridke) and Indian statements against interest. 41 accounts across 28 events, each with a stance (confirms, disputes damage/target, not acknowledged, denies, competing claim…).
- "Accounts compared" panel on event cards and on damage-assessment records.
- New event EVT-055: 7 May air engagement – aircraft losses claimed by both sides; Indian losses conceded by the CDS (number not given).
- Eight sources, including a new `adversary_official` source type. The Washington Post imagery analysis is cited by headline only (paywalled).
- Methods page section "Corroboration and other accounts".

### Changed

- 19 events upgraded to GREEN (occurrence corroborated outside Indian official accounts): 20 GREEN, 32 BLUE, 1 AMBER, 2 GREY. Sites Pakistan does not acknowledge (Sawai Nala, Gulpur, Barnala) and bases without independent imagery stay BLUE.
- Schema rule: GREEN requires a non-Indian confirming account or a statement against interest.
- Seven BDA records independently verified with independent damage levels (Sargodha, Rahim Yar Khan, Sukkur, Bholari, Jacobabad, Lahore AD, Muridke); the Indian account stays visible alongside.
- S-400 usage status: officially confirmed used (IAF chief, Aug 2025); kill claims unverified.

## [0.5.0] – 2026-11-08 · Offline edition

### Added

- `npm run build:offline`: one self-contained HTML file (`dist-offline/operation-sindoor-v<version>.html`, ~5.6 MB) with all code, styles, data and the relief image inlined; opens by double-click from any folder or USB stick with no server, Node or internet. A README with opening instructions and a SHA-256 checksum is written beside it.
- `npm run test:offline`: Playwright opens the file via `file://` with the network blocked – map, relief, every module, briefing, PDF export and persistence; asserts no network requests.
- CI job builds and tests the offline file and publishes it as a downloadable artifact.
- "Offline edition" badge in the header of the packaged file.

### Changed

- Relief image moved from `public/` to a bundled asset (`src/assets/relief/hillshade.png`).

## [0.4.0] – 2026-11-08 · Briefing, links and exercises

### Added

- Guided briefing: 16 narrated steps from the Pahalgam prelude to the aftermath; each step selects its event, frames the map and lists its sources, with caveats where facts are claims. Chapter jump, previous/next, auto-advance, keys ← → and Esc.
- Shareable links: view state in the URL hash (only non-default values; every value validated). Restored on load and on hash change; Copy link button in the header.
- Turn-based tabletop exercise: Blue/Red moves with intended rungs, umpire rulings (accept / modify / reject with note), turn closes only when every move is ruled; umpire log (CSV, exercise JSON) and rung-per-turn trace. v1 scenarios migrate.
- Tests: briefing script integrity, URL encode/decode (including hostile input), tabletop rules; 5 new e2e tests (38 in total).

## [0.3.0] – 2026-11-08 · Map and visual quality

### Added

- State/UT (India) and province (Pakistan) boundaries from Natural Earth 1:10m admin-1, with Natural Earth label points (small units appear from zoom 6). `npm run build-admin1`.
- Map furniture: metric scale bar, north arrow, cursor readout in decimal degrees / DMS / MGRS (1 km), clickable overview inset.
- Map PNG export layout: title block (event, time, evidence, filters, clock, version), compact legend, sources of the selected event and disclaimers; animations frozen at their end state.
- Time encoding: vectors fade with time since the event; day/night shading from solar position at the simulation clock.
- Accessibility: axe-core WCAG 2.1 A/AA audit of every module in the e2e suite; map-quality e2e tests (33 e2e tests in total).

### Changed

- Vector palette re-stepped for colour-vision deficiency (indigo / teal / red / amber, all pairs validated); muted text raised to ≥ 4.5:1; badges and counts use text colours.

### Added (archives, 2026-11-08)

- Submitted the six unarchived sources to the Internet Archive (Save Page Now); 20 of 21 sources now link to a capture. PIB's year-end review could not be archived (PIB returns a block page to the archiver).
- `check-sources` verifies each capture against a cited excerpt and records `archiveStatus` (content_verified / shell_only / unchecked); falls back to the CDX index and ignores non-200 captures. PDFs are checked with `pdftotext` when available.
- Archive status shown on source cards, in the register and on the Methods page.

### Fixed

- ThePrint (Sarjal) citation was taken from a search summary that reworded the article; replaced with the verbatim lead sentence checked against the live page.

## [0.2.0] – 2026-11-08 · Credibility and traceability

### Added

- Field-level provenance: 126 citations across all 54 events (source, locator, verbatim excerpt ≤ 30 words, note; Hindi excerpts glossed). Quote markers on each event field open an Evidence trail. Tests require citations for every stated time, casualty figure, damage level and named system.
- Source health check (`npm run check-sources`): live-URL probe and closest Internet Archive capture; 15 of 21 sources now link to archived copies.
- Methods & Data module: scope, sources and retrieval, evidence rules, provenance, time, locations and uncertainty, damage and claims, map representation, exclusions, known limitations, how to cite, and a full data dictionary (tested against the schemas).
- Audit log with analyst name and field-level before/after values for BDA edits, source changes and session loads; BDA revision history; audit CSV export; audit carried in sessions.
- Five new end-to-end tests (21 in total).

### Changed

- Events CSV includes citations. Version constant and data-as-of date shown on the Methods page.

## [0.1.1] – 2026-11-08 · Engineering foundation

### Added

- Git repository, `.gitattributes` (LF line endings) and this changelog.
- ESLint 9 + Prettier, with `npm run lint`, `format`, `format:check` and `check` (all static checks + unit tests + build).
- Playwright end-to-end suite (16 tests, `npm run test:e2e`) run against the production build; any page or console error fails a test.
- GitHub Actions CI: lint, formatting, types, unit/data tests, build, then e2e with the report uploaded on failure.
- Build-time pre-rendering of APP-6/MIL-STD-2525C symbols (`scripts/build-symbols.mjs`).

### Changed

- Modules A, C–F and Sources load on demand; jsPDF and html-to-image load only when exporting; vendor chunks split. Main bundle 1.58 MB → 429 kB (114 kB gzip).
- `milsymbol` is now a build-time dev dependency only.

### Fixed

- Vector animations (draw, flow, arrowhead fade) never ran in production builds: Leaflet ignores `className` passed through `pathOptions`.
- "Building…" state on the campaign PDF button cleared before the export finished.

## [0.1.0] – 2026-11-07

- Baseline: event engine, historical database, Geospatial simulator, modules A–F, Source Management, exports, India official-view boundary with contested areas, terrain relief, APP-6 symbology, position-uncertainty overlays.
