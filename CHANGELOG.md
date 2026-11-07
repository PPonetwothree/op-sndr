# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
