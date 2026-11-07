# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
