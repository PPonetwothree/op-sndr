# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
