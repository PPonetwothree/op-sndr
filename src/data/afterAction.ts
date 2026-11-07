// After-action review content. Each statement carries a basis so the UI can separate
// official claims, analytical observations and unresolved questions. No numerical effectiveness
// scores are generated: where evidence is insufficient the scorecard says so.

export type Basis = "official_claim" | "official_acknowledgement" | "analytical" | "unresolved" | "corroborated";

export interface AarItem {
  text: string;
  basis: Basis;
  sources: string[];
}

export interface AarSection {
  id: "A" | "B" | "C" | "D" | "E";
  title: string;
  blocks: { heading: string; items: AarItem[] }[];
}

export const AAR_SECTIONS: AarSection[] = [
  {
    id: "A",
    title: "Operational effectiveness",
    blocks: [
      {
        heading: "Historical objective",
        items: [
          {
            text: "Deliver justice to the victims of Pahalgam; dismantle terrorist infrastructure and disable terrorists likely to be sent to India; deter and pre-empt further attacks.",
            basis: "official_claim",
            sources: ["SRC-MEA-0507"],
          },
          {
            text: "Actions to be 'measured, non-escalatory, proportionate and responsible', with no Pakistani military establishments targeted on 7 May.",
            basis: "official_claim",
            sources: ["SRC-MEA-0507", "SRC-PIB-0507"],
          },
        ],
      },
      {
        heading: "Reported outcome",
        items: [
          {
            text: "Nine camps described as 'successfully destroyed'; over 100 terrorists killed, including named high-value individuals.",
            basis: "official_claim",
            sources: ["SRC-MEA-0507", "SRC-PIB-0514A"],
          },
          {
            text: "Strikes on Pakistani AD systems (8 May), AD sites (8–9 May) and air bases/radars (10 May), followed by cessation at 17:00 IST on 10 May.",
            basis: "official_claim",
            sources: ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A", "SRC-MEA-0510B"],
          },
        ],
      },
      {
        heading: "Evidence supporting outcome",
        items: [
          {
            text: "Briefers presented target imagery and selection rationale on 7 May; time-stamped imagery of intact Indian bases on 10 May; 'visual evidence of damage' at Nur Khan and Rahimyar Khan referenced by PIB.",
            basis: "official_claim",
            sources: ["SRC-MEA-0507", "SRC-MEA-0510A", "SRC-PIB-0518"],
          },
          {
            text: "No independent (non-Indian-government) corroboration of damage is held in this database yet. Add sources via Source Management.",
            basis: "unresolved",
            sources: [],
          },
        ],
      },
      {
        heading: "Unresolved questions",
        items: [
          { text: "Per-target weapon pairing, impact points and damage extent at each of the nine sites.", basis: "unresolved", sources: [] },
          { text: "Independent verification of casualty figures (terrorists killed; Pakistani military losses).", basis: "unresolved", sources: [] },
          { text: "Full content of the 11 May DGMO briefing (not retrieved in this build).", basis: "unresolved", sources: ["SRC-PIB-1206"] },
        ],
      },
    ],
  },
  {
    id: "B",
    title: "Air-defence performance",
    blocks: [
      {
        heading: "Reported threat events",
        items: [
          {
            text: "15 locations targeted on the night of 7–8 May; 300–400 drones at 36 locations on 8–9 May; 26+ locations and high-speed missiles on 9–10 May.",
            basis: "official_claim",
            sources: ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A"],
          },
        ],
      },
      {
        heading: "Interception claims",
        items: [
          {
            text: "Attempts 'neutralised' by the Integrated Counter-UAS Grid and AD systems; 'majority of the vectors' neutralised on 9–10 May; layered AD (C-UAS, MANPADS, legacy and modern SAMs, EW) credited.",
            basis: "official_claim",
            sources: ["SRC-PIB-0508", "SRC-MEA-0510A", "SRC-PIB-0514B"],
          },
        ],
      },
      {
        heading: "Known damage reports",
        items: [
          {
            text: "Limited damage to equipment and personnel at IAF stations Udhampur, Pathankot, Adampur and Bhuj; medical centre and school premises at Srinagar, Awantipora and Udhampur air bases attacked.",
            basis: "official_acknowledgement",
            sources: ["SRC-MEA-0510A"],
          },
          {
            text: "Pakistani claims about S-400 at Adampur, airfields at Sirsa, Suratgarh and others, and a BrahMos base were rejected by India with imagery.",
            basis: "official_claim",
            sources: ["SRC-MEA-0510A", "SRC-MEA-0510C"],
          },
        ],
      },
      {
        heading: "Evidence limitations",
        items: [
          {
            text: "No interception counts, system-by-system engagement data or independent damage surveys in the source set.",
            basis: "unresolved",
            sources: [],
          },
        ],
      },
    ],
  },
  {
    id: "C",
    title: "UAV and counter-UAS",
    blocks: [
      {
        heading: "Reported drone activity",
        items: [
          {
            text: "Drone intrusions along the full western front; armed UAV against Bathinda; Turkish-origin drones identified (preliminary/ debris).",
            basis: "official_claim",
            sources: ["SRC-MEA-0509", "SRC-PIB-0514B"],
          },
          { text: "Post-cessation drone waves on the night of 10 May, intercepted.", basis: "official_claim", sources: ["SRC-PIB-0514A", "SRC-MEA-0510D"] },
        ],
      },
      {
        heading: "Detection and interception claims",
        items: [
          { text: "'A number of these drones' brought down by kinetic and non-kinetic means (8–9 May).", basis: "official_claim", sources: ["SRC-MEA-0509"] },
        ],
      },
      {
        heading: "Electronic warfare involvement",
        items: [
          {
            text: "EW assets named in the AD layers; IAF 'bypassed and jammed' Pakistan's Chinese-supplied AD systems.",
            basis: "official_claim",
            sources: ["SRC-PIB-0514B", "SRC-PIB-0514A"],
          },
        ],
      },
      {
        heading: "Unresolved technical assessments",
        items: [
          {
            text: "Final forensic identification of drone types; proportion defeated kinetically vs non-kinetically; Indian loitering-munition and armed-drone types.",
            basis: "unresolved",
            sources: [],
          },
        ],
      },
    ],
  },
  {
    id: "D",
    title: "Infrastructure damage",
    blocks: [
      {
        heading: "Reported target damage",
        items: [
          {
            text: "See Module D: each target carries a BDA record distinguishing government claims from independently established damage.",
            basis: "analytical",
            sources: [],
          },
        ],
      },
      {
        heading: "Military infrastructure impacts",
        items: [
          {
            text: "India claims damage at 10 Pakistani air bases and several radar/AD sites; acknowledges limited damage at four IAF stations.",
            basis: "official_claim",
            sources: ["SRC-MEA-0510A", "SRC-MEA-0510C"],
          },
        ],
      },
      {
        heading: "Civilian infrastructure impacts",
        items: [
          {
            text: "Civilian deaths and damage in Poonch, Rajouri and other LoC areas; property damage and injuries in Ferozepur and Jalandhar.",
            basis: "official_claim",
            sources: ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A"],
          },
        ],
      },
      {
        heading: "Assessment confidence",
        items: [{ text: "Predominantly BLUE (official) evidence; confidence in extent of damage is low to medium.", basis: "analytical", sources: [] }],
      },
    ],
  },
  {
    id: "E",
    title: "Escalation control",
    blocks: [
      {
        heading: "Escalation progression",
        items: [
          {
            text: "Diplomatic → counter-terror strikes → drone/missile attempts → AD suppression → expanded UAS → air-base strikes → cessation, over roughly 88 hours.",
            basis: "analytical",
            sources: [],
          },
        ],
      },
      {
        heading: "Political and military signalling",
        items: [
          {
            text: "Repeated statements of 'non-escalation, provided it is reciprocated'; responses described as 'same domain, same intensity'.",
            basis: "official_claim",
            sources: ["SRC-PIB-0508", "SRC-MEA-0510A"],
          },
        ],
      },
      {
        heading: "DGMO communication",
        items: [
          {
            text: "Pakistan DGMO called Indian DGMO at 15:35 IST, 10 May; talks scheduled for 12 May 12:00.",
            basis: "official_claim",
            sources: ["SRC-MEA-0510B"],
          },
        ],
      },
      {
        heading: "Cessation agreement",
        items: [
          {
            text: "Cessation from 17:00 IST, 10 May on land, air and sea; violations reported the same evening.",
            basis: "official_claim",
            sources: ["SRC-MEA-0510B", "SRC-MEA-0510D"],
          },
        ],
      },
    ],
  },
];
