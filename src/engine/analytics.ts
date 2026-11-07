// Dataset builders for charts and dashboards. All counts are counts of RECORDS in this database
// (events, locations, BDA records) – never totals of munitions, drones or casualties.
import { TARGET_BY_ID } from "@/data";
import type { TimedEvent } from "./eventEngine";
import type { BdaRecord, ClaimStatus } from "./bdaEngine";
import { DOMAIN_LABEL, EVIDENCE } from "./assessmentEngine";
import { formatDateLabel } from "./timelineEngine";

/** Validated categorical palette (dark surface #1a1d20): all six checks pass. Fixed order. */
export const CAT = ["#4a86dc", "#d24848", "#1f9a9a", "#bf8219", "#a35bc0", "#4f9a3a"];
export const SERIES = { offensive: "#4a86dc", pakistani: "#d24848", defensive: "#1f9a9a" };
/** Sequential ramp (single amber hue, light→dark) for damage levels 0–5. */
export const DAMAGE_RAMP = ["#5a5f66", "#f3d9a4", "#e7b866", "#d4932f", "#a8661a", "#6e3f0c"];

const dayShort = (d: string) => formatDateLabel(d).replace(" 2025", "");

export function eventsPerDay(events: TimedEvent[]) {
  const m = new Map<string, number>();
  events.forEach((e) => m.set(e.date, (m.get(e.date) ?? 0) + 1));
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, label: dayShort(date), count }));
}

export function eventsByDomain(events: TimedEvent[]) {
  const order = Object.keys(DOMAIN_LABEL);
  const m = new Map<string, number>();
  events.forEach((e) => m.set(e.domain, (m.get(e.domain) ?? 0) + 1));
  return order.filter((d) => m.has(d)).map((d) => ({ key: d, name: DOMAIN_LABEL[d], value: m.get(d)!, color: CAT[order.indexOf(d) % CAT.length] }));
}

export function escalationSeries(events: TimedEvent[]) {
  let max = 0;
  return events.map((e) => {
    max = Math.max(max, e.escalationLevel);
    return { t: e.t, id: e.id, title: e.title, level: e.escalationLevel, peak: max };
  });
}

export function targetCategories(events: TimedEvent[]) {
  const seen = new Set<string>();
  events.forEach((e) => [...e.targetIds, ...e.location.locationIds].forEach((id) => seen.add(id)));
  const m = new Map<string, { indian: number; pakistani: number; context: number }>();
  seen.forEach((id) => {
    const t = TARGET_BY_ID.get(id);
    if (!t) return;
    const k = t.category.replace(/_/g, " ").replace("lo c", "LoC");
    const row = m.get(k) ?? { indian: 0, pakistani: 0, context: 0 };
    if (t.side === "indian_strike_target") row.indian++;
    else if (t.side === "pakistani_attack_target") row.pakistani++;
    else row.context++;
    m.set(k, row);
  });
  return [...m.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.indian + b.pakistani + b.context - (a.indian + a.pakistani + a.context));
}

export const CLAIM_ORDER: ClaimStatus[] = ["government_claim", "government_acknowledged", "attack_neutralised", "adversary_claim_rejected", "independently_verified", "unresolved"];
export const CLAIM_COLOR: Record<ClaimStatus, string> = {
  government_claim: CAT[0],
  government_acknowledged: CAT[3],
  attack_neutralised: CAT[2],
  adversary_claim_rejected: "#8a9098",
  independently_verified: CAT[5],
  unresolved: CAT[4],
};

export function damageDistribution(records: BdaRecord[]) {
  const levels = ["UNKNOWN", "0", "1", "2", "3", "4", "5"];
  return levels.map((lv) => {
    const row: Record<string, number | string> = { level: lv === "UNKNOWN" ? "Unknown" : `L${lv}` };
    CLAIM_ORDER.forEach((c) => (row[c] = 0));
    records
      .filter((r) => (lv === "UNKNOWN" ? r.damageLevel === null : r.damageLevel === Number(lv)))
      .forEach((r) => (row[r.claimStatus] = (row[r.claimStatus] as number) + 1));
    return row;
  });
}

const isUav = (e: TimedEvent) => e.eventType === "counter_uas" || e.vectors.some((v) => v.style === "uav") || /drone|uav|ucav|loitering/i.test(e.weaponCategory);

export function uavTimeline(events: TimedEvent[]) {
  const days = ["2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10", "2025-05-11", "2025-05-12"];
  return days
    .map((d) => {
      const evs = events.filter((e) => e.date === d && isUav(e));
      return {
        date: d,
        label: dayShort(d),
        hostile: evs.filter((e) => e.actor === "Pakistan").length,
        indian: evs.filter((e) => e.actor === "India").length,
      };
    })
    .filter((r) => events.some((e) => e.date === r.date));
}

export function offenceDefence(events: TimedEvent[]) {
  const days = [...new Set(events.map((e) => e.date))].sort();
  const offensiveTypes = new Set(["precision_strike", "sead_strike", "military_infrastructure_strike"]);
  const defensiveTypes = new Set(["air_defence_engagement", "counter_uas"]);
  return days.map((d) => {
    const evs = events.filter((e) => e.date === d);
    return {
      date: d,
      label: dayShort(d),
      indianOffensive: evs.filter((e) => e.actor === "India" && offensiveTypes.has(e.eventType)).length,
      indianDefensive: evs.filter((e) => defensiveTypes.has(e.eventType) && (e.actor === "India" || e.eventType === "counter_uas")).length,
      pakistaniAttack: evs.filter((e) => e.actor === "Pakistan" && ["drone_missile_attack", "artillery_shelling", "military_infrastructure_strike", "civilian_impact", "ceasefire_violation"].includes(e.eventType)).length,
    };
  });
}

export function evidenceDistribution(events: TimedEvent[]) {
  return (Object.keys(EVIDENCE) as (keyof typeof EVIDENCE)[]).map((k) => ({ cls: k, desc: EVIDENCE[k].desc, count: events.filter((e) => e.evidenceClass === k).length, color: EVIDENCE[k].color }));
}

export function civilianTimeline(events: TimedEvent[]) {
  const days = [...new Set(events.map((e) => e.date))].sort();
  return days.map((d) => {
    const evs = events.filter((e) => e.date === d && (e.eventType === "civilian_impact" || /civilian/i.test(e.casualties?.category ?? "")));
    return {
      date: d,
      label: dayShort(d),
      reports: evs.length,
      statements: evs
        .filter((e) => e.casualties)
        .map((e) => `${e.id}: ${e.casualties!.killed ?? "UNKNOWN"} killed${e.casualties!.injured !== null ? `, ${e.casualties!.injured} injured` : ""} – ${e.casualties!.statedBy}`),
    };
  });
}

function macroRegion(id: string): string | null {
  const t = TARGET_BY_ID.get(id);
  if (!t) return null;
  const r = t.region;
  if (t.country === "PoJK") return "PoJK";
  if (t.country === "Gilgit-Baltistan") return "Gilgit-Baltistan";
  if (t.country === "Pakistan") {
    if (/Sindh|Thatta/.test(r)) return "Sindh (Pak)";
    return "Punjab (Pak) / Rawalpindi";
  }
  if (/Ladakh/.test(r)) return "Ladakh";
  if (/Jammu|LoC/.test(r)) return "Jammu & Kashmir";
  if (/Punjab|Chandigarh|Haryana/.test(r)) return "Punjab / Haryana / Chandigarh";
  if (/Rajasthan/.test(r)) return "Rajasthan";
  if (/Gujarat|Kutch/.test(r)) return "Gujarat";
  if (/Maritime/.test(r)) return "Arabian Sea";
  if (/National Capital/.test(r)) return "New Delhi (decisions/briefings)";
  return null;
}

export function regionalDensity(events: TimedEvent[]) {
  const m = new Map<string, number>();
  events.forEach((e) => {
    const regions = new Set([...e.location.locationIds, ...e.targetIds].map(macroRegion).filter((x): x is string => !!x));
    if (!regions.size) regions.add("Unspecified / undisclosed");
    regions.forEach((r) => m.set(r, (m.get(r) ?? 0) + 1));
  });
  return [...m.entries()].map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count);
}

export function infrastructureStatus(records: BdaRecord[]) {
  const m = new Map<string, number>();
  records.forEach((r) => {
    const k = r.functionalStatus || "UNKNOWN";
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return [...m.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
}

export function claimsVsCorroboration(records: BdaRecord[]) {
  const strike = records.filter((r) => r.side === "indian_strike_target");
  return [
    { metric: "Reported targets", count: strike.length },
    { metric: "Damage claims", count: records.filter((r) => r.claimStatus === "government_claim" || r.claimStatus === "government_acknowledged").length },
    { metric: "Independently corroborated", count: records.filter((r) => r.claimStatus === "independently_verified").length },
    { metric: "Unresolved", count: records.filter((r) => r.claimStatus !== "independently_verified" && r.claimStatus !== "attack_neutralised").length },
  ];
}
