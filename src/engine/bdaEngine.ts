// Builds baseline Battle Damage Assessment records from the event database.
// Baselines restate what sources report; unknown fields are "UNKNOWN", never inferred.
import { EVENTS, TARGETS, BASE_SOURCES } from "@/data";
import type { CampaignEvent, Target } from "@/types";

export type ClaimStatus =
  | "government_claim" // damage/destruction claimed by Indian authorities (strike targets)
  | "government_acknowledged" // damage to Indian assets acknowledged by Indian authorities
  | "attack_neutralised" // Indian authorities state the attack was neutralised
  | "adversary_claim_rejected" // Pakistani claim of damage rejected by India
  | "independently_verified" // only when an independent (GREEN) source is attached
  | "unresolved";

export const CLAIM_LABEL: Record<ClaimStatus, string> = {
  government_claim: "Government-reported claim",
  government_acknowledged: "Damage acknowledged by Indian authorities",
  attack_neutralised: "Attack stated as neutralised",
  adversary_claim_rejected: "Adversary claim – rejected by India",
  independently_verified: "Independently verified",
  unresolved: "Unresolved",
};

export interface EvidenceEntry {
  date: string;
  sourceId: string;
  eventId: string | null;
  note: string;
}

export interface BdaRecord {
  targetId: string;
  targetName: string;
  region: string;
  country: string;
  category: Target["category"];
  side: Target["side"];
  associatedEventIds: string[];
  reportedWeaponCategory: string;
  reportedDamage: string;
  infrastructureCondition: string;
  functionalStatus: string;
  secondaryDamage: string;
  civilianImpact: string;
  evidenceSourceIds: string[];
  damageLevel: number | null; // 0–5, null = UNKNOWN
  claimStatus: ClaimStatus;
  confidence: "high" | "medium" | "low" | "unknown";
  evidenceTimeline: EvidenceEntry[];
  imagery: { url: string; caption: string; sourceId: string }[]; // only user-attached, properly sourced
  notes: string;
  edited: boolean;
  editedAt: string | null;
}

const SRC_DATE = new Map(BASE_SOURCES.map((s) => [s.id, s.publicationDate]));
const CONF_RANK = { unknown: 0, low: 1, medium: 2, high: 3 } as const;

function eventsFor(t: Target): CampaignEvent[] {
  return EVENTS.filter(
    (e) =>
      e.damageAssessment.status !== "not_applicable" &&
      (e.targetIds.includes(t.id) || e.location.locationIds.includes(t.id))
  );
}

function claimFor(t: Target, evs: CampaignEvent[]): ClaimStatus {
  if (evs.some((e) => e.damageAssessment.status === "corroborated")) return "independently_verified";
  if (t.side === "indian_strike_target") return "government_claim";
  if (evs.some((e) => e.evidenceType === "adversary_claim")) return "adversary_claim_rejected";
  if (evs.some((e) => e.damageAssessment.status === "claimed" && (e.damageAssessment.level ?? 0) > 0)) return "government_acknowledged";
  if (evs.some((e) => e.damageAssessment.status === "denied")) return "attack_neutralised";
  return "unresolved";
}

function conditionText(level: number | null, claim: ClaimStatus): string {
  if (claim === "adversary_claim_rejected") return "Reported intact by Indian authorities (time-stamped imagery shown for some sites)";
  if (claim === "attack_neutralised") return "No damage reported – attacks stated as neutralised";
  if (level === null) return claim === "government_claim" ? "Damage claimed – extent not stated" : "UNKNOWN";
  if (level === 5) return "Destruction claimed (government-reported, not independently established)";
  if (level === 4) return "Severe / extensive damage claimed";
  if (level === 3) return "Significant damage reported";
  if (level === 2) return "Limited damage reported";
  if (level === 1) return "Possible damage";
  return "No damage established";
}

export function buildBaselineBda(): BdaRecord[] {
  const out: BdaRecord[] = [];
  for (const t of TARGETS) {
    const evs = eventsFor(t);
    if (!evs.length) continue;
    const levels = evs.map((e) => e.damageAssessment.level).filter((l): l is number => l !== null);
    const claim = claimFor(t, evs);
    const level = claim === "adversary_claim_rejected" || claim === "attack_neutralised" ? 0 : levels.length ? Math.max(...levels) : null;
    const conf = evs.reduce<BdaRecord["confidence"]>((m, e) => (CONF_RANK[e.damageAssessment.confidence] > CONF_RANK[m] ? e.damageAssessment.confidence : m), "unknown");
    const sources = [...new Set([...evs.flatMap((e) => e.sources), ...t.sources])];
    const weapons = [...new Set(evs.map((e) => e.weaponCategory).filter((w) => w && w !== "n/a"))];
    const casualtyNotes = evs.filter((e) => e.casualties).map((e) => `${e.casualties!.killed ?? "UNKNOWN"} killed${e.casualties!.injured !== null ? `, ${e.casualties!.injured} injured` : ""} (${e.casualties!.category}; ${e.casualties!.statedBy})`);
    const sevenMayStrike = evs.some((e) => e.date === "2025-05-07" && e.eventType === "precision_strike");
    out.push({
      targetId: t.id,
      targetName: t.name,
      region: t.region,
      country: t.country,
      category: t.category,
      side: t.side,
      associatedEventIds: evs.map((e) => e.id),
      reportedWeaponCategory: weapons.join("; ") || "UNKNOWN",
      reportedDamage: [t.officialDescription, ...evs.map((e) => `${e.id}: ${e.description}`)].filter(Boolean).join("\n"),
      infrastructureCondition: conditionText(level, claim),
      functionalStatus: claim === "adversary_claim_rejected" ? "Operational per Indian authorities" : "UNKNOWN",
      secondaryDamage: "UNKNOWN",
      civilianImpact: casualtyNotes.length
        ? casualtyNotes.join("; ")
        : sevenMayStrike
          ? "No civilian damage reported by Indian briefers as of 7 May (official statement)"
          : "UNKNOWN",
      evidenceSourceIds: sources,
      damageLevel: level,
      claimStatus: claim,
      confidence: conf,
      evidenceTimeline: evs
        .flatMap((e) => e.sources.map((s) => ({ date: SRC_DATE.get(s) ?? e.date, sourceId: s, eventId: e.id, note: e.title })))
        .sort((a, b) => a.date.localeCompare(b.date)),
      imagery: [],
      notes: "",
      edited: false,
      editedAt: null,
    });
  }
  return out;
}

export const BASELINE_BDA = buildBaselineBda();
