# Maintaining the data

How to add or correct events, sources, citations and other accounts without breaking the evidence rules. The rules are enforced by schemas and tests, so a change that breaks one fails `npm run check`.

## Where things live

| What                                    | Edit                                      | Generated file                       |
| --------------------------------------- | ----------------------------------------- | ------------------------------------ |
| Sources                                 | `src/data/sources.json` (edited directly) | –                                    |
| Events                                  | `scripts/events.src.mjs`                  | `src/data/events.json`               |
| Field-level citations                   | `scripts/provenance.src.mjs`              | merged into `events.json`            |
| Other parties' accounts, GREEN upgrades | `scripts/accounts.src.mjs`                | merged into `events.json`            |
| Locations and targets                   | `scripts/targets.src.mjs`                 | `src/data/targets.json`              |
| Weapon systems                          | `scripts/weapons.src.mjs`                 | `src/data/weapons.json`              |
| Independent damage assessments          | `src/data/independentAssessments.ts`      | applied by `src/engine/bdaEngine.ts` |
| Published imagery register              | `src/data/imagery.ts`                     | –                                    |
| Guided briefing narration               | `src/data/briefing.ts`                    | –                                    |
| Data dictionary (Methods page)          | `src/data/dataDictionary.ts`              | –                                    |

After editing any `scripts/*.src.mjs`, run `npm run build-data`.

## Workflow

1. Read the source yourself. Record how much you read in `retrieval`: `read_in_full`, `partially_read` or `cited_not_retrieved`.
2. Make the change (sections below).
3. `npm run build-data` if you touched `scripts/`.
4. `npm run check` – lint, formatting, type-check, unit and data tests, build. Check its exit code; do not pipe it through `grep`, which hides failures.
5. `npm run test:e2e` – browser tests against the production build.
6. Optional: `npm run check-sources -- --write` to record archive captures for new sources.
7. Add a CHANGELOG entry. For a release, bump the version in both `package.json` and `src/version.ts` (a test checks they match), then `npm run build:offline` and `npm run test:offline`.

Several browser tests assert totals (number of events, citations, CSV rows). When you add records, update those numbers in `e2e/` deliberately rather than loosening the assertions.

## Adding a source

Add an object to `src/data/sources.json`:

```json
{
  "id": "SRC-PUB-MMDD",
  "title": "Title exactly as published",
  "publisher": "Publisher",
  "publicationDate": "2025-05-11",
  "url": "https://…",
  "sourceType": "official_transcript | official_press_release | official_backgrounder | official_statement | adversary_official | media | independent",
  "evidenceClass": "BLUE | AMBER | GREEN | GREY",
  "retrieval": "read_in_full | partially_read | cited_not_retrieved",
  "notes": "What this source contributes and its caveats.",
  "lastChecked": "YYYY-MM-DD"
}
```

- Indian government sources are BLUE; media reports (including media reporting an official statement) are AMBER; Pakistani official statements are `adversary_official`, GREY; independent analyses are GREEN.
- A paywalled or unread source can be registered as `cited_not_retrieved`, but nothing may be taken from it beyond its headline. Do not read paywalled content through copies or archives.

## Adding an event

Append a new `ev({…})` call **at the end** of `scripts/events.src.mjs`. IDs are assigned in file order, so inserting one in the middle renumbers every later event and breaks citations, accounts, links and saved sessions. Sequencing uses `sortTime`, not the ID.

- `time` is set only when a source states a clock time, with `timeBasis: "stated"` and a `time` citation. Otherwise leave `time: null` and describe the timing in `timeLabel`.
- `evidenceType` and `evidenceClass` describe the event as the sources establish it. Never set GREEN here; see "Upgrading to GREEN".
- `formation` stays undisclosed / abstract unless a source describes it. Never invent numbers, routes, launch points or weapon-to-target pairings.
- Every event needs at least one source in `sources`; citation and account sources are added automatically.

## Adding citations

In `scripts/provenance.src.mjs`, use `add("EVT-nnn", c(field, sourceId, locator, excerpt, note?))`:

- `field` is one of `time`, `location`, `description`, `casualties`, `damage`, `weapons`, `formation`, `attribution`.
- `excerpt` is **verbatim** from the source and at most 30 words. Copy it from the page; never paraphrase inside quotes.
- `locator` says where in the source (speaker, section, paragraph).
- Hindi excerpts get an English gloss in `note`.

Tests require a citation for every stated time, casualty figure, damage level and named system.

## Adding another party's account

In `scripts/accounts.src.mjs`, add to `ACCOUNTS["EVT-nnn"]` with `a(party, sourceId, stance, summary, excerpt?, locator?)`:

- `party`: `pakistan_official`, `independent` or `indian_official`.
- `stance`: `confirms_occurrence`, `confirms_damage`, `concedes`, `disputes_damage`, `disputes_target`, `not_acknowledged`, `no_evidence_found`, `denies`, `claims_other`.
- `summary` paraphrases; `excerpt` is verbatim and **at most 15 words**.
- Matching a Pakistani site name to an Indian one is analytical: say so in the summary.

## Upgrading to GREEN

Add the event ID to `UPGRADES` in `scripts/accounts.src.mjs`. The schema accepts GREEN only if the event has a qualifying account: a non-Indian party confirming or acknowledging it (`confirms_occurrence`, `confirms_damage`, `disputes_damage`, `disputes_target`), or any party with `concedes`. GREEN covers occurrence only; damage changes only through an independent assessment.

## Independent damage assessments

Add an entry to `src/data/independentAssessments.ts` with the target ID, the 0–5 level that the independent source describes, a one-line finding and GREEN sources only. The engine marks the record independently verified and keeps the Indian account in its text.

## Published imagery

Add an entry to `src/data/imagery.ts`: source, kind (commercial, government-released, OSINT analyst), provider, collection date as stated, what the publication says it shows, and the target and event IDs. Set `read: false` for headline-only entries, with no targets or events. Never copy, trace or generate imagery; link to the publisher.

## Checklist before committing

- [ ] Every new excerpt checked against the source, word for word.
- [ ] Clock times only where stated.
- [ ] No GREEN without a qualifying account; no damage upgrade without an independent assessment.
- [ ] Unread or paywalled sources contribute nothing but a headline.
- [ ] `npm run check` exits 0; `npm run test:e2e` passes.
- [ ] CHANGELOG updated.
