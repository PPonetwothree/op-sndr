// Register of published satellite imagery relevant to the campaign. Imagery is linked to its
// publisher and never reproduced, traced or generated here. Each entry says who collected the
// images, when, and what the publication says they show – that reading is the publisher's.

export type ImageryKind = "commercial" | "government_released" | "osint_analyst";

export interface ImageryRecord {
  id: string;
  sourceId: string;
  kind: ImageryKind;
  provider: string;
  collected: string; // as stated by the publication, or "not stated"
  shows: string;
  targetIds: string[];
  eventIds: string[];
  read: boolean; // false = cited by headline only; nothing taken from it
}

export const IMAGERY_KIND_LABEL: Record<ImageryKind, string> = {
  commercial: "Commercial satellite imagery",
  government_released: "Government-released imagery",
  osint_analyst: "Imagery shared by an OSINT analyst",
};

export const IMAGERY: ImageryRecord[] = [
  {
    id: "IMG-MAXAR-IT",
    sourceId: "SRC-IMG-IT-0513",
    kind: "commercial",
    provider: "Maxar Technologies, published by India Today",
    collected: "10–11 May 2025",
    shows: "Post-strike images of six air bases; the outlet describes the damage as extensive.",
    targetIds: ["TGT-SUKKUR", "TGT-CHAKLALA", "TGT-RAHIM-YAR-KHAN", "TGT-SARGODHA", "TGT-JACOBABAD", "TGT-BHOLARI"],
    eventIds: ["EVT-035", "EVT-033", "EVT-034", "EVT-040", "EVT-041", "EVT-042"],
    read: true,
  },
  {
    id: "IMG-SYMON-NURKHAN",
    sourceId: "SRC-IMG-PRINT-0526",
    kind: "osint_analyst",
    provider: "Damien Symon (The Intel Lab), reported by ThePrint",
    collected: "23 May 2025",
    shows: "A complex near the strike site at Nur Khan had been demolished, suggesting wider damage than the two vehicles first reported.",
    targetIds: ["TGT-CHAKLALA"],
    eventIds: ["EVT-033"],
    read: true,
  },
  {
    id: "IMG-SYMON-MURID",
    sourceId: "SRC-IMG-MANORAMA-0526",
    kind: "osint_analyst",
    provider: "Damien Symon (The Intel Lab), reported by Onmanorama / IANS",
    collected: "not stated (shared 26 May 2025)",
    shows: "Structural damage to a command-and-control building at Murid, with a section of the roof collapsed.",
    targetIds: ["TGT-MURID"],
    eventIds: ["EVT-032"],
    read: true,
  },
  {
    id: "IMG-STIMSON",
    sourceId: "SRC-IND-STIMSON",
    kind: "commercial",
    provider: "Commercial imagery reviewed by the Stimson Center",
    collected: "May 2025; Sargodha repairs visible on 11 May",
    shows: "Runway craters at Sargodha and Rahim Yar Khan; hangars hit at Sukkur, Bholari and Jacobabad. No imagery known for Chunian, Pasrur or Rafiqui.",
    targetIds: ["TGT-SARGODHA", "TGT-RAHIM-YAR-KHAN", "TGT-SUKKUR", "TGT-BHOLARI", "TGT-JACOBABAD"],
    eventIds: ["EVT-040", "EVT-034", "EVT-035", "EVT-042", "EVT-041"],
    read: true,
  },
  {
    id: "IMG-IAF-RELEASED",
    sourceId: "SRC-IND-STIMSON",
    kind: "government_released",
    provider: "Indian Air Force (as described by the Stimson Center)",
    collected: "not stated",
    shows: "The IAF released satellite images of nine of the 11 sites it named on 10 May, none for Rafiqui or Murid.",
    targetIds: [],
    eventIds: ["EVT-049", "EVT-051"],
    read: true,
  },
  {
    id: "IMG-NYT",
    sourceId: "SRC-IND-NYT-0514",
    kind: "commercial",
    provider: "Not known (article not read)",
    collected: "not stated",
    shows: "Headline only: satellite imagery shows limited damage. Nothing else is taken from it.",
    targetIds: [],
    eventIds: [],
    read: false,
  },
  {
    id: "IMG-WAPO",
    sourceId: "SRC-IND-WAPO",
    kind: "commercial",
    provider: "Not known (article not read)",
    collected: "not stated",
    shows: "Headline only: damage at six Pakistani airfields. Nothing else is taken from it.",
    targetIds: [],
    eventIds: [],
    read: false,
  },
];

export const imageryForTarget = (id: string) => IMAGERY.filter((i) => i.targetIds.includes(id));
export const imageryForEvent = (id: string) => IMAGERY.filter((i) => i.eventIds.includes(id));
