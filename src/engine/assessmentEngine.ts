// Damage-classification and evidence helpers shared by the map, event cards and (later) BDA module.
import type { CampaignEvent, EvidenceClass } from "@/types";

export const DAMAGE_LEVELS: { level: number; label: string; short: string }[] = [
  { level: 0, label: "No damage established", short: "0 – None established" },
  { level: 1, label: "Possible damage", short: "1 – Possible" },
  { level: 2, label: "Limited damage", short: "2 – Limited" },
  { level: 3, label: "Significant damage", short: "3 – Significant" },
  { level: 4, label: "Severe damage", short: "4 – Severe" },
  { level: 5, label: "Destruction claimed or independently established", short: "5 – Destruction" },
];

export function damageLabel(e: Pick<CampaignEvent, "damageAssessment">): string {
  const { level, status } = e.damageAssessment;
  if (status === "not_applicable") return "Not applicable";
  if (level === null) return status === "claimed" ? "Damage claimed – level not stated" : "UNKNOWN";
  const base = DAMAGE_LEVELS[level]?.label ?? "UNKNOWN";
  if (level === 5) return status === "corroborated" ? "Destruction independently established" : "Destruction claimed (government-reported)";
  if (status === "denied") return `${base} (attack stated as neutralised)`;
  return status === "claimed" ? `${base} – claimed` : base;
}

export const EVIDENCE: Record<EvidenceClass, { label: string; color: string; desc: string }> = {
  GREEN: { label: "GREEN", color: "#5fbf7a", desc: "Independently corroborated" },
  BLUE: { label: "BLUE", color: "#4f8fe6", desc: "Officially reported or confirmed by Indian authorities" },
  AMBER: { label: "AMBER", color: "#e3a83b", desc: "Media-reported or analytical reconstruction" },
  GREY: { label: "GREY", color: "#8a8f98", desc: "Unverified or disputed" },
};

export const EVENT_TYPE_LABEL: Record<string, string> = {
  terror_attack: "Terrorist attack",
  diplomatic_measure: "Strategic / diplomatic measure",
  precision_strike: "Precision strike",
  drone_missile_attack: "Drone / missile attack",
  air_defence_engagement: "Air-defence engagement",
  counter_uas: "Counter-UAS",
  artillery_shelling: "Artillery / LoC fire",
  sead_strike: "Air-defence suppression strike",
  military_infrastructure_strike: "Military infrastructure strike",
  civilian_impact: "Civilian impact",
  infiltration: "Infiltration",
  naval_posture: "Naval posture",
  information_operation: "Information / claims",
  cessation: "Cessation / DGMO",
  ceasefire_violation: "Violation of understanding",
  briefing: "Official briefing",
};

export const DOMAIN_LABEL: Record<string, string> = {
  air: "Air",
  land: "Land",
  sea: "Sea",
  cyber_info: "Information",
  diplomatic: "Diplomatic",
  multi: "Multi-domain",
};

export const ESCALATION_LEVELS = [
  "Strategic and diplomatic response",
  "Counter-terror precision strikes",
  "Drone and missile threat activity",
  "Air-defence confrontation",
  "Artillery and LoC escalation",
  "Expanded UAV and counter-UAS confrontation",
  "Military infrastructure strikes",
  "Strategic de-escalation and cessation",
];
