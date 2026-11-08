import { useMemo, useState } from "react";
import { IMAGERY, IMAGERY_KIND_LABEL } from "@/data/imagery";
import { Copy, Check } from "lucide-react";
import { BASE_SOURCES, EVENTS, TARGETS, WEAPONS } from "@/data";
import { DATA_DICTIONARY } from "@/data/dataDictionary";
import { EVIDENCE, DAMAGE_LEVELS } from "@/engine/assessmentEngine";
import { CLAIM_LABEL, type ClaimStatus } from "@/engine/bdaEngine";
import { PRECISION_RADIUS_KM } from "@/engine/geoMeasure";
import { Card } from "@/components/ui/primitives";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import { APP_VERSION, DATA_AS_OF } from "@/version";
import type { EvidenceClass } from "@/types";
import { ModuleHeader } from "../ModuleHeader";
import { cn } from "@/utils/cn";

const SECTIONS = [
  ["purpose", "Purpose and scope"],
  ["sources", "Sources and retrieval"],
  ["evidence", "Evidence classification"],
  ["provenance", "Field-level provenance"],
  ["corroboration", "Corroboration and other accounts"],
  ["imagery", "Published imagery"],
  ["time", "Time"],
  ["location", "Locations and uncertainty"],
  ["damage", "Damage and claims"],
  ["map", "Map representation"],
  ["briefing", "Briefing, links and tabletop"],
  ["excluded", "Deliberately excluded"],
  ["limits", "Known limitations"],
  ["cite", "How to cite"],
  ["dictionary", "Data dictionary"],
] as const;

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={`m-${id}`} className="scroll-mt-4 border-b border-ink-700 pb-1 pt-4 text-[15px] font-semibold text-ink-100">
      {children}
    </h2>
  );
}
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-2 text-[12.5px] leading-relaxed text-ink-200">{children}</p>;
const Li = ({ children }: { children: React.ReactNode }) => <li className="text-[12.5px] leading-relaxed text-ink-200">{children}</li>;

export function MethodsModule() {
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => {
    const citations = EVENTS.reduce((n, e) => n + e.provenance.length, 0);
    const byRetrieval = BASE_SOURCES.reduce<Record<string, number>>((m, s) => ((m[s.retrieval] = (m[s.retrieval] ?? 0) + 1), m), {});
    const byClass = EVENTS.reduce<Record<string, number>>((m, e) => ((m[e.evidenceClass] = (m[e.evidenceClass] ?? 0) + 1), m), {});
    return {
      citations,
      byRetrieval,
      byClass,
      archived: BASE_SOURCES.filter((s) => s.archiveUrl).length,
      archiveVerified: BASE_SOURCES.filter((s) => s.archiveStatus === "content_verified").length,
      archiveShell: BASE_SOURCES.filter((s) => s.archiveStatus === "shell_only").length,
      timed: EVENTS.filter((e) => e.time).length,
    };
  }, []);
  const citation = `Operation Sindoor – Multi-Domain Campaign Reconstruction Simulator, version ${APP_VERSION} (data as of ${DATA_AS_OF}). Reconstruction from public Indian government accounts; event IDs as cited.`;

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="M" title="Methods & Data Dictionary">
        <span className="mono text-[11px] text-ink-400">
          v{APP_VERSION} · data as of {DATA_AS_OF}
        </span>
      </ModuleHeader>
      <div className="flex min-h-0 flex-1">
        <nav className="w-[210px] shrink-0 overflow-auto border-r border-ink-700 bg-ink-900 p-2" aria-label="Methods sections">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#m-${id}`} className="block px-2 py-1 text-[12px] text-ink-300 hover:bg-ink-850 hover:text-ink-100">
              {label}
            </a>
          ))}
        </nav>
        <article className="min-w-0 flex-1 overflow-auto px-8 pb-12">
          <div className="max-w-[860px]">
            <H id="purpose">Purpose and scope</H>
            <P>
              An operational-history simulator that reconstructs Operation Sindoor (7–10 May 2025), with the 22–23 April prelude and the 11–12 May aftermath,
              from publicly available accounts. It is built for education, analysis and tabletop discussion. It is not an intelligence product, and it does not
              establish facts beyond what its sources state.
            </P>
            <P>
              Database: {EVENTS.length} events, {TARGETS.length} locations, {WEAPONS.length} weapon-system entries and {BASE_SOURCES.length} registered sources.
              Hypothetical (tabletop) material is stored separately and never alters the historical record.
            </P>

            <H id="sources">Sources and retrieval</H>
            <P>
              Indian official sources are prioritised: MEA briefing transcripts and statements, PIB releases and backgrounders, and MoD material. Every source
              records how much of it was actually read for this build:
            </P>
            <ul className="mt-2 list-disc pl-5">
              <Li>Read in full: {stats.byRetrieval.read_in_full ?? 0}</Li>
              <Li>Partially read or confirmed via excerpt: {stats.byRetrieval.partially_read ?? 0}</Li>
              <Li>Cited but not retrieved: {stats.byRetrieval.cited_not_retrieved ?? 0}</Li>
            </ul>
            <P>
              {stats.archived} of {BASE_SOURCES.length} sources link to an Internet Archive capture so citations survive changes to the original pages. Each
              capture is checked for a cited excerpt: {stats.archiveVerified} contain the cited text, and {stats.archiveShell} hold only the page shell because
              the site loads its text with JavaScript (MEA's current pages do this); the rest have not been checked. Liveness and archive status are re-checked
              with <code className="mono">npm run check-sources</code>.
            </P>

            <H id="evidence">Evidence classification</H>
            <div className="mt-2 space-y-1.5">
              {(Object.keys(EVIDENCE) as EvidenceClass[]).map((k) => (
                <div key={k} className="flex items-center gap-2 text-[12.5px] text-ink-200">
                  <EvidenceBadge cls={k} /> {EVIDENCE[k].desc} – {stats.byClass[k] ?? 0} {(stats.byClass[k] ?? 0) === 1 ? "event" : "events"}
                </div>
              ))}
            </div>
            <ul className="mt-3 list-disc pl-5">
              <Li>An official claim is never classed GREEN, and an event is “verified” only if it is GREEN. Both rules are enforced by the schema.</Li>
              <Li>
                Adding or linking a source never upgrades a classification automatically. A BDA record can be set to “independently verified” only when a GREEN
                source is attached.
              </Li>
              <Li>Adversary claims that India rejected are recorded as GREY, not deleted.</Li>
            </ul>

            <H id="provenance">Field-level provenance</H>
            <P>
              {stats.citations} citations tie individual fields to the passage that supports them: a stated time, a casualty figure, a damage claim, a named
              weapon. Each citation records the source, its location within the source (speaker, section or paragraph) and a verbatim excerpt of 30 words or
              fewer. Hindi excerpts carry an English gloss. In an event card, the quote markers next to each field open its citations in the Evidence trail.
            </P>
            <P>
              Tests require that every event has at least one citation, and that every stated time, casualty figure, damage level and named system carries its
              own citation.
            </P>

            <H id="corroboration">Corroboration and other accounts</H>
            <P>
              Each event can carry accounts from other parties: Pakistani official statements (from DG ISPR, through Dawn and Radio Pakistan), independent
              analyses (the Stimson Center's commercial-imagery review, on-site reporting by Al Jazeera) and Indian statements made against India's own
              interest. Event cards and damage records show them side by side under “Accounts compared”, with each party's stance.
            </P>
            <ul className="mt-2 list-disc pl-5">
              <Li>
                An event is GREEN only when a non-Indian source confirms that it happened, or when India concedes something against its interest. The schema
                refuses any other GREEN. At present {stats.byClass.GREEN ?? 0} events qualify.
              </Li>
              <Li>
                GREEN means the <em>occurrence</em> is corroborated. Damage and casualty figures stay as claimed unless a damage record carries an independent
                assessment, and each such record keeps the Indian account beside the independent finding.
              </Li>
              <Li>
                When Pakistan acknowledges a strike, that is treated as a statement against interest about occurrence only; its descriptions of the targets
                (mosques, civilians) and of damage are recorded as disputes, not facts. Matching a Pakistani site name to an Indian one (for example “Bilal
                mosque” and “Syedna Bilal camp”) is analytical and is noted where it happens.
              </Li>
              <Li>
                Sites that Pakistan's own list omits (Sawai Nala, Gulpur, Barnala) and bases where independent imagery is not known (Chunian, Pasrur, Rafiqui
                damage) stay BLUE. Excerpts from non-government sources are limited to 15 words. Paywalled reporting is cited by headline only.
              </Li>
            </ul>

            <H id="imagery">Published imagery</H>
            <P>
              Satellite imagery is linked to its publisher, never copied, traced or generated. The register below records who collected each set, when, and what
              the publication says it shows. Imagery does not change a damage level by itself: levels change only through an independent assessment recorded on
              the damage record.
            </P>
            <ul className="mt-2 list-disc pl-5" data-testid="imagery-register">
              {IMAGERY.map((i) => (
                <Li key={i.id}>
                  <strong>{IMAGERY_KIND_LABEL[i.kind]}</strong> – {i.provider}; collected {i.collected}. {i.shows}
                  {i.targetIds.length > 0 && (
                    <span className="text-ink-400">
                      {" "}
                      ({i.targetIds.length} target record{i.targetIds.length === 1 ? "" : "s"})
                    </span>
                  )}
                </Li>
              ))}
            </ul>

            <H id="time">Time</H>
            <ul className="mt-2 list-disc pl-5">
              <Li>
                Times are IST. A clock time is shown only when a source states it ({stats.timed} events); otherwise the card reads TIME UNKNOWN and gives the
                source's own wording.
              </Li>
              <Li>
                Events inside a stated window (such as 01:05–01:30 on 7 May) are spread across that window for playback only. The order within the window is
                illustrative, not reported.
              </Li>
              <Li>Playback compresses quiet periods; elapsed playback time is not proportional to real time.</Li>
            </ul>

            <H id="location">Locations and uncertainty</H>
            <ul className="mt-2 list-disc pl-5">
              <Li>Positions are public gazetteer points for the named town or village, not reported impact points or facility coordinates.</Li>
              <Li>
                Dashed rings show plotting precision:{" "}
                {Object.entries(PRECISION_RADIUS_KM)
                  .map(([k, v]) => `${k.replace("_", " ")} ${v} km`)
                  .join(" · ")}
                .
              </Li>
              <Li>
                Where briefers stated a distance from the LoC or IB, the map measures the plotted point against the approximate line and flags disagreements in
                red. A unit test enforces agreement.
              </Li>
              <Li>Events whose locations were not disclosed (for example the four AD sites on 8–9 May) are not plotted.</Li>
            </ul>

            <H id="damage">Damage and claims</H>
            <table className="mt-2 w-full text-[12px]">
              <tbody>
                {DAMAGE_LEVELS.map((d) => (
                  <tr key={d.level} className="border-b border-ink-800">
                    <td className="mono w-10 py-1 text-ink-400">L{d.level}</td>
                    <td className="py-1 text-ink-200">{d.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <P>
              The 0–5 level is this reconstruction's classification of what a source reports; sources do not use the scale. Level 5 always reads as “destruction
              claimed” unless the record is independently verified. Claim statuses:{" "}
              {(Object.keys(CLAIM_LABEL) as ClaimStatus[]).map((c, i, a) => (
                <span key={c}>
                  {CLAIM_LABEL[c]}
                  {i < a.length - 1 ? "; " : "."}
                </span>
              ))}{" "}
              Casualty figures are shown as stated by their source and are never summed.
            </P>

            <H id="map">Map representation</H>
            <ul className="mt-2 list-disc pl-5">
              <Li>
                Vectors start at abstract sector anchors and are illustrative geographic representations. They are not flight paths, launch points, firing
                solutions or weapon trajectories.
              </Li>
              <Li>
                Formations appear as abstract symbols (“FORMATION UNKNOWN – ABSTRACT REPRESENTATION”) unless a source describes them, and numbers are never
                shown.
              </Li>
              <Li>
                India's boundary follows Natural Earth 1:10m from India's point of view. Contested areas are hatched; the LoC, IB, LAC and AGPL are de facto
                lines. All boundaries are approximate; this is not a Survey of India map.
              </Li>
              <Li>
                Military symbols follow APP-6 / MIL-STD-2525C from the Indian perspective (locations India struck are hostile, Indian locations are friendly).
              </Li>
              <Li>Terrain relief is Natural Earth shaded relief. No imagery is generated or simulated.</Li>
              <Li>
                State, UT and province lines are Natural Earth 1:10m admin-1 boundaries; lines inside PoJK and Gilgit-Baltistan are omitted under India's view.
              </Li>
              <Li>
                Night shading is computed from the sun's position at the simulation clock. Past vectors fade with time since the event (12-hour decay), so the
                most recent action stands out; this encodes recency, not certainty.
              </Li>
              <Li>
                The cursor readout gives decimal degrees, DMS and MGRS at 1 km precision, matching the town-level plotting. It describes the map, not reported
                positions.
              </Li>
              <Li>
                Vector colours are validated for colour-vision deficiency on the dark map; UAV activity is also dashed. Every module is audited with axe-core
                against WCAG 2.1 AA.
              </Li>
            </ul>

            <H id="briefing">Briefing, links and tabletop</H>
            <ul className="mt-2 list-disc pl-5">
              <Li>
                The guided briefing has 16 steps from the Pahalgam prelude to the aftermath. Its narration paraphrases the cited sources and adds no new facts;
                caveats mark where a statement is a claim. A test checks that every step cites at least one source of its own event.
              </Li>
              <Li>
                Shareable links store only the view (module, briefing step, event or clock, filters, changed layers, map view, escalation highlight) in the URL.
                They contain no analyst edits, sources or personal data; saved sessions carry those.
              </Li>
              <Li>
                The tabletop exercise is hypothetical: teams propose moves, an umpire rules on each one and sets the resulting rung, and a turn closes only when
                every move is ruled. It is stored separately and never changes the historical record.
              </Li>
            </ul>

            <H id="excluded">Deliberately excluded</H>
            <P>
              Classified or undisclosed details are not reconstructed: package composition and numbers, routing, launch locations, timing beyond what was
              stated, weapon-to-target pairing, release parameters and tactical procedures. Where these are unknown the application says so rather than
              estimating.
            </P>

            <H id="limits">Known limitations</H>
            <ul className="mt-2 list-disc pl-5">
              <Li>
                Independent corroboration covers the occurrence of most strikes and, for a few sites, damage. Casualty figures on both sides and most damage
                levels remain unverified.
              </Li>
              <Li>
                No official transcript of the 11 and 12 May briefings was found. The 11 May briefing is cited from a PTI wire report (AMBER); other figures come
                from later PIB backgrounders.
              </Li>
              <Li>
                Pakistani accounts come from DG ISPR statements as carried by Dawn and Radio Pakistan; ispr.gov.pk itself could not be read. The Washington Post
                imagery analysis is cited by headline only (paywalled).
              </Li>
              <Li>Several camp positions are village-level; facility locations are not public.</Li>
              <Li>Escalation-level tagging, political implications and significance are analytical judgements (AMBER).</Li>
            </ul>

            <H id="cite">How to cite</H>
            <Card className="mt-2 flex items-start gap-2 p-3">
              <p className="flex-1 text-[12px] text-ink-200">{citation}</p>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(citation).then(() => setCopied(true));
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-ink-400 hover:text-ink-100"
                aria-label="Copy citation"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </Card>
            <P>When citing a specific fact, cite the original source from the event's Evidence trail rather than this application.</P>

            <H id="dictionary">Data dictionary</H>
            {DATA_DICTIONARY.map((d) => (
              <div key={d.id} className="mt-3">
                <div className="text-[13px] font-semibold text-ink-100">{d.title}</div>
                <div className="mono text-[10px] text-ink-500">{d.file}</div>
                <table className="mt-1 w-full text-[11.5px]">
                  <thead>
                    <tr className="text-left text-ink-400">
                      <th className="w-[160px] border-b border-ink-700 py-1">Field</th>
                      <th className="w-[200px] border-b border-ink-700 py-1">Type</th>
                      <th className="border-b border-ink-700 py-1">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.fields.map((f) => (
                      <tr key={f.field} className={cn("border-b border-ink-800 align-top")}>
                        <td className="mono py-1 text-olive-300">{f.field}</td>
                        <td className="mono py-1 text-ink-400">{f.type}</td>
                        <td className="py-1 text-ink-200">{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
