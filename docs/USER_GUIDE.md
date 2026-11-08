# User guide

Operation Sindoor – Multi-Domain Campaign Reconstruction Simulator reconstructs the 7–10 May 2025 campaign, with the 22–23 April prelude and the 11–12 May aftermath, from public accounts. This guide covers how to use it. The **Methods & Data** page inside the app explains the evidence rules and lists the known limitations; read it before quoting anything from the app.

Press **?** anywhere in the app for a short version of this guide and the keyboard shortcuts.

## Opening the app

| You have                                       | Do this                                                                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The offline file (`operation-sindoor-v….html`) | Double-click it. It opens in Chrome, Edge or Firefox with no server and no internet. The header shows **OFFLINE EDITION**.                                                     |
| The source code                                | `npm install`, then `npm run dev` and open http://127.0.0.1:5173.                                                                                                              |
| A link from a colleague                        | Open it. The link restores their view: module, event or briefing step, filters, layers and map position. It carries no edits or personal data – those travel in session files. |

Everything works offline except the optional **Online dark tiles** layer and the links out to source documents.

## The screen

- **Header**: the simulation clock (IST), the scenario mode (Historical / Hypothetical), playback controls, an overall confidence indicator, **Copy link** and **Session**.
- **Left sidebar**: the eight modules.
- **Right panel** (on the map): the selected event's card.

## Reading an event card

Select an event in the list or on the map. The card shows:

- **Evidence class** – GREEN independently corroborated, BLUE Indian official account, AMBER media or analytical reconstruction, GREY unverified or disputed. GREEN means _that it happened_ is corroborated, not the damage or casualty figures.
- **Time** – a clock time only when a source states one; otherwise TIME UNKNOWN and the source's own wording.
- **Quote markers** next to fields (time, location, casualties, damage, weapons). Click one to open its citations in the **Evidence trail**: source, where in the source, and a verbatim excerpt. Hindi excerpts carry an English gloss.
- **Accounts compared** – the Indian official account beside Pakistani official statements and independent analyses, each with its stance (confirms, disputes damage, not acknowledged, concedes, denies, competing claim).
- **Published imagery** – links to satellite imagery published elsewhere, with who collected it and when. The app never reproduces or generates imagery.
- **Record history** – what changed in this event in each release (evidence class, time, casualties, damage, citations, other accounts) and which sources came in with the change. **Methods & Data → Changes in the record** summarises each release.

## Geospatial Operations (the map)

- **Play, pause and step**: the header controls, or Space and the arrow keys. Playback compresses quiet periods; the order of strikes inside a stated window is illustrative.
- **Filters** (left panel): days, actors, domains, evidence class, event type, free-text search, and the prelude switch. **Show all events** draws every filtered event regardless of the clock.
- **Layers** (top right of the map): targets, Indian locations, air defence, UAV activity, vectors, boundaries, contested areas, state lines, labels, relief, day/night, military symbols, uncertainty rings, and **Group nearby markers & hide overlapping labels**.
- **Grouped markers**: at low zoom, nearby locations that are not part of the current action show as a numbered badge. Click it to zoom in. Selected and active locations are never grouped.
- **Vectors are illustrative.** They start at abstract sector anchors and are not flight paths, launch points or trajectories. Formations show as abstract symbols unless a source describes them.
- **Uncertainty rings** show plotting precision (town 5 km, district 15 km). Selecting a 7 May camp draws the briefers' stated distance from the LoC or IB against the distance measured on this map.
- **Compare days** shows two days side by side on synced maps.
- **Exports**: map PNG (with title block, legend, sources and disclaimers), events CSV and targets CSV.

## Guided briefing

**Guided briefing** (above the map) walks through 16 narrated steps from Pahalgam to the aftermath. Each step selects its event, frames the map and lists its sources. Use → and ← to move, the chapter list to jump, and Esc to leave. The narration paraphrases the cited sources and adds no facts of its own.

## Other modules

| Module              | Use it to                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign Overview   | See record counts, day cards (click to drill down), the campaign timeline and ten charts. Every chart has a data-table view; clicking a day bar filters the event list.                                                                                                                                                                                                                         |
| Force & Weapons DB  | Browse systems by force and usage status (what the sources establish about use), with linked events and sources. In Hypothetical mode, build an abstract force package.                                                                                                                                                                                                                         |
| Damage Assessment   | Read and edit the damage record for each location on a 0–5 scale. Records keep the Indian claim beside any independent finding, list published imagery and the accounts of linked events. **Edit** changes a record; **Baseline** restores the source-derived version (**Reset all edits** does it for every record). A record can be set to "independently verified" only with a GREEN source. |
| Escalation Matrix   | Read the 0–7 escalation ladder; clicking a rung highlights its events on the map and timeline. The **tabletop exercise** below it is hypothetical and kept apart from the historical record (see below).                                                                                                                                                                                        |
| After-Action Review | Read the structured review with the basis of each statement, the evidence scorecard, and export the **Full campaign PDF** or print the report.                                                                                                                                                                                                                                                  |
| Source Management   | Check the source register (how much of each source was read, archive links), add a public source, link sources to events, and read or export the **Audit log**.                                                                                                                                                                                                                                 |
| Methods & Data      | Read the method statement, evidence rules, corroboration rules, imagery register, known limitations, how to cite, and the full data dictionary.                                                                                                                                                                                                                                                 |

## Tabletop exercise (hypothetical)

1. Switch the header to **Hypothetical** if you want hypothetical force packages too; the exercise itself works in either mode.
2. In **Escalation Matrix**, set the exercise title, premise, starting rung and umpire name.
3. Each team proposes moves for the current turn (domain, intended rung, rationale).
4. The umpire rules on each move – accepted, modified or rejected – sets the resulting rung and adds a note.
5. **End turn** works only once every move this turn has a ruling. The umpire log exports as CSV and the whole exercise as JSON.

Nothing in the exercise changes the historical events, sources or damage records.

## Saving and sharing your work

- **Session → Save** keeps your work in this browser: damage-record edits, analyst-linked sources, the tabletop exercise and the audit log.
- **Session → Export JSON / Import JSON** moves that work to another computer or browser. The offline file stores work per browser, so export before you switch machines.
- **Copy link** shares only the view, never your edits.
- Set your name in **Source Management → Audit log** before editing, so each change is attributed.

## Citing

Cite the original source from the event's Evidence trail, not this app. To cite the app itself, use the wording under **Methods & Data → How to cite**, which includes the version and data date. Name the version: evidence classes and figures can change between releases, and each event's Record history shows how.

## Keyboard shortcuts

| Key   | Action                                                       |
| ----- | ------------------------------------------------------------ |
| Space | Play / pause                                                 |
| → / ← | Next / previous event (next / previous step in the briefing) |
| Home  | Back to the start                                            |
| Esc   | Leave the briefing; close the help panel                     |
| ?     | Open or close the help panel                                 |

Shortcuts are ignored while typing in a text field.

## Troubleshooting

| Problem                              | Try                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| The map is blank grey                | The offline basemap needs no internet. If **Online dark tiles** is on without internet, switch it off in Layers.   |
| Saved sessions are gone              | They live in that browser's storage; a private window or cleared site data removes them. Keep exported JSON files. |
| A shared link opens a different view | Links restore view state only. If the data version differs, an event that no longer exists is ignored.             |
| The offline file says it was changed | Compare its SHA-256 with the value in the `README.txt` that came with it.                                          |
