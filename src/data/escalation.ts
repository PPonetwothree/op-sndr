// Escalation ladder for the historical reconstruction.
// "governmentAccount", "adversaryAction" and "indianResponse" paraphrase cited official sources.
// "politicalImplications" and "significance" are ANALYTICAL (AMBER) and labelled as such in the UI.

export interface EscalationLevel {
  level: number;
  name: string;
  triggerEventIds: string[]; // the historical event(s) that mark entry to this level
  relatedEventIds: string[]; // all events tagged at this level are also derived at runtime
  dateTime: string;
  domain: string;
  governmentAccount: string;
  adversaryAction: string;
  indianResponse: string;
  politicalImplications: string; // analytical
  significance: string; // analytical
  sources: string[];
}

export const ESCALATION_LADDER: EscalationLevel[] = [
  {
    level: 0,
    name: "Strategic and diplomatic response",
    triggerEventIds: ["EVT-001", "EVT-002"],
    relatedEventIds: [],
    dateTime: "22 Apr 2025 (attack) · 23 Apr 2025 (CCS decisions)",
    domain: "Diplomatic / economic",
    governmentAccount:
      "MEA: 26 killed at Pahalgam including one Nepali national; attack claimed by TRF, described as a front for UN-proscribed LeT. CCS decisions announced 23 Apr.",
    adversaryAction: "Terrorist attack on tourists at Pahalgam (attributed by India to Pakistan-based LeT via TRF).",
    indianResponse:
      "Indus Waters Treaty held in abeyance; ICP Attari closed; SVES visas cancelled; defence advisers declared persona non grata; High Commission strength cut to 30.",
    politicalImplications: "Non-military coercion preceded any kinetic action, signalling deliberate sequencing and creating a two-week decision window.",
    significance: "Baseline rung: response confined to diplomatic and economic instruments.",
    sources: ["SRC-MEA-0507", "SRC-MEA-0423", "SRC-PIB-0514A", "SRC-UNSC-0425"],
  },
  {
    level: 1,
    name: "Counter-terror precision strikes",
    triggerEventIds: ["EVT-003"],
    relatedEventIds: [],
    dateTime: "7 May 2025 · 01:05–01:30 IST",
    domain: "Air (precision strike)",
    governmentAccount:
      "Nine sites described as terrorist infrastructure in Pakistan and PoJK struck; action described as focused, measured, non-escalatory; no Pakistani military facilities targeted.",
    adversaryAction: "— (the strike follows the Pahalgam attack; Pakistani LoC shelling begins the same morning)",
    indianResponse: "Precision strikes on nine named camps; India reserves the right to respond to any attack on military targets.",
    politicalImplications: "Explicit framing as counter-terror and non-military targeting was designed to bound escalation and shape international reception.",
    significance: "First cross-border kinetic action of the campaign; target set limited to non-state infrastructure.",
    sources: ["SRC-MEA-0507", "SRC-PIB-0507", "SRC-PIB-0514A"],
  },
  {
    level: 2,
    name: "Drone and missile threat activity",
    triggerEventIds: ["EVT-015"],
    relatedEventIds: [],
    dateTime: "7 May 2025 · 20:30 IST onward (night 7–8 May)",
    domain: "Air (drones and missiles)",
    governmentAccount:
      "Pakistan attempted to engage military targets at 15 locations from Awantipura to Bhuj using drones and missiles; debris being recovered.",
    adversaryAction: "Drone and missile attempts against military targets in Northern and Western India.",
    indianResponse: "Attempts neutralised by the Integrated Counter-UAS Grid and AD systems.",
    politicalImplications: "Pakistan's response targeted Indian military sites, which India had stated would 'invite a suitable response'.",
    significance: "Shift from non-state targets to state military targets on the Indian side.",
    sources: ["SRC-PIB-0508", "SRC-MEA-0509"],
  },
  {
    level: 3,
    name: "Air-defence confrontation",
    triggerEventIds: ["EVT-016", "EVT-017"],
    relatedEventIds: [],
    dateTime: "Night 7–8 May · morning 8 May 2025",
    domain: "Air (air defence / SEAD)",
    governmentAccount:
      "Indian AD neutralised the attempts; on 8 May morning Indian forces targeted AD radars and systems in Pakistan; an AD system at Lahore 'reliably learnt' to be neutralised.",
    adversaryAction: "Continued drone and missile attempts.",
    indianResponse: "Strikes on Pakistani AD radars and systems, described as 'same domain with same intensity'.",
    politicalImplications: "India framed the step as proportionate and reciprocal, preserving a non-escalation narrative while hitting state military assets.",
    significance: "First Indian strikes on Pakistani military (AD) assets.",
    sources: ["SRC-PIB-0508", "SRC-PIB-0514B"],
  },
  {
    level: 4,
    name: "Artillery and LoC escalation",
    triggerEventIds: ["EVT-014", "EVT-022"],
    relatedEventIds: [],
    dateTime: "7–10 May 2025",
    domain: "Land (artillery, mortars, small arms)",
    governmentAccount:
      "Intensified Pakistani fire across the LoC (Kupwara, Baramulla, Uri, Poonch, Mendhar, Rajouri; later Tangdhar, Akhnoor, Udhampur); 16 civilians killed by 8 May; religious sites in Poonch hit.",
    adversaryAction: "Mortar, heavy-calibre artillery and armed-drone fire along the LoC.",
    indianResponse: "Indian Army responded to bring fire to a halt; briefers claim heavy Pakistani losses.",
    politicalImplications: "Civilian casualties and damage to places of worship featured prominently in India's public messaging.",
    significance: "Sustained ground-fire dimension running in parallel with air activity.",
    sources: ["SRC-PIB-0508", "SRC-MEA-0508", "SRC-MEA-0509", "SRC-MEA-0510A"],
  },
  {
    level: 5,
    name: "Expanded UAV and counter-UAS confrontation",
    triggerEventIds: ["EVT-018"],
    relatedEventIds: [],
    dateTime: "Night 8–9 May 2025",
    domain: "Air (UAS / C-UAS / EW)",
    governmentAccount: "300–400 drones at 36 locations from Leh to Sir Creek; preliminary ID Asisguard Songar; armed UAV against Bathinda neutralised.",
    adversaryAction: "Large-scale drone intrusions along the entire western front, assessed as probing AD and gathering intelligence.",
    indianResponse: "Kinetic and non-kinetic counter-UAS; armed drones against four Pakistani AD sites (one AD radar destroyed).",
    politicalImplications: "Breadth of the front (Ladakh to Gujarat) widened the geographic scope of the confrontation.",
    significance: "Drone warfare becomes the dominant mode of interaction.",
    sources: ["SRC-MEA-0509"],
  },
  {
    level: 6,
    name: "Military infrastructure strikes",
    triggerEventIds: ["EVT-027", "EVT-031"],
    relatedEventIds: [],
    dateTime: "Night 9–10 May · early 10 May 2025",
    domain: "Air (multi-vector strikes)",
    governmentAccount:
      "Pakistan employed UCAVs, drones, long-range weapons, loitering munitions and fighters at 26+ locations; limited damage at four IAF stations. India struck military targets at Rafiqui, Murid, Chaklala, Rahim Yar Khan, Sukkur, Chunian and radar sites at Pasrur and Sialkot; evening briefing claims extensive damage at Skardu, Sargodha, Jacobabad, Bholari.",
    adversaryAction: "Multi-vector attacks on Indian air bases and civilian areas; high-speed missiles at Punjab air bases after 01:40.",
    indianResponse: "Precision strikes on air bases, radar sites and command-and-control infrastructure.",
    politicalImplications: "Both sides targeting air bases marked the highest intensity of the campaign, within hours of the cessation call.",
    significance: "Peak rung: direct strikes on core military infrastructure of both states.",
    sources: ["SRC-MEA-0510A", "SRC-MEA-0510C", "SRC-PIB-0514A", "SRC-PIB-0518"],
  },
  {
    level: 7,
    name: "Strategic de-escalation and cessation of hostilities",
    triggerEventIds: ["EVT-047", "EVT-048"],
    relatedEventIds: [],
    dateTime: "10 May 2025 · 15:35 call · 17:00 IST effect",
    domain: "Diplomatic / military (DGMO channel)",
    governmentAccount:
      "Pakistan DGMO called Indian DGMO at 15:35 IST; cessation on land, air and sea from 17:00 IST; violations reported that evening; DGMO talks scheduled for 12 May 12:00.",
    adversaryAction: "Request for cessation via DGMO channel (per India); later violations of the understanding.",
    indianResponse: "Agreement to cessation; armed forces instructed to respond strongly to violations; PM's 12 May address sets out doctrine.",
    politicalImplications: "India emphasised the bilateral DGMO channel as the mechanism for the cessation.",
    significance: "Termination rung; residual violations tested the understanding on the first night.",
    sources: ["SRC-MEA-0510B", "SRC-MEA-0510D", "SRC-PIB-0514A", "SRC-MEA-PM0512"],
  },
];
