import type { TimedEvent } from "@/engine/eventEngine";
import type { BdaRecord } from "@/engine/bdaEngine";
import { toMs } from "@/engine/timelineEngine";

export interface ScoreRow {
  dimension: string;
  officialAccount: string;
  measures: [string, string][]; // label → value (counts of records, or stated facts)
  independent: number;
  status: string;
  score: string;
}

const verified = (r: BdaRecord) => r.claimStatus === "independently_verified";

export function buildScorecard(events: TimedEvent[], bda: BdaRecord[]): ScoreRow[] {
  const terror = bda.filter((r) => r.category === "terrorist_infrastructure");
  const milStrike = bda.filter((r) => r.side === "indian_strike_target" && r.category !== "terrorist_infrastructure");
  const indianSites = bda.filter((r) => r.side === "pakistani_attack_target");
  const threat = events.filter((e) => e.actor === "Pakistan" && e.eventType === "drone_missile_attack");
  const intercept = events.filter((e) => e.actor === "India" && (e.eventType === "air_defence_engagement" || e.eventType === "counter_uas"));
  const uav = events.filter((e) => e.eventType === "counter_uas" || /drone|uav|ucav|loitering/i.test(e.weaponCategory));
  const greenEvents = (list: TimedEvent[]) => list.filter((e) => e.evidenceClass === "GREEN").length;
  const scoreText = (n: number) =>
    n === 0 ? "Not assigned – no independent evidence in database" : "Not assigned – partial independent evidence; see records";
  const hours = (toMs("2025-05-10T17:00") - toMs("2025-05-07T01:05")) / 3600_000;
  const levels = new Set(events.map((e) => e.escalationLevel));

  const rows: ScoreRow[] = [
    {
      dimension: "A. Counter-terror strike objective",
      officialAccount: "Nine camps 'successfully destroyed'; over 100 terrorists killed (claimed).",
      measures: [
        ["Terror-infrastructure targets", String(terror.length)],
        ["Destruction claims (L5, government)", String(terror.filter((r) => r.damageLevel === 5 && !verified(r)).length)],
      ],
      independent: terror.filter(verified).length,
      status: "",
      score: "",
    },
    {
      dimension: "B. Air-defence performance",
      officialAccount: "Attacks neutralised by C-UAS grid and AD; limited damage at four IAF stations acknowledged.",
      measures: [
        ["Reported threat events", String(threat.length)],
        ["Interception / AD claim events", String(intercept.length)],
        ["Indian sites with acknowledged damage", String(indianSites.filter((r) => r.claimStatus === "government_acknowledged").length)],
      ],
      independent: greenEvents([...threat, ...intercept]),
      status: "",
      score: "",
    },
    {
      dimension: "C. UAV and counter-UAS",
      officialAccount: "300–400 drones at 36 locations (8–9 May); 'a number' brought down kinetically and non-kinetically.",
      measures: [
        ["UAV-related event records", String(uav.length)],
        ["Drone types: identification status", "Preliminary (Songar) / debris (Yiha)"],
      ],
      independent: greenEvents(uav),
      status: "",
      score: "",
    },
    {
      dimension: "D. Infrastructure damage",
      officialAccount: "Damage claimed at Pakistani air bases and radars; Indian bases stated intact except limited damage.",
      measures: [
        ["Military targets with damage claims", String(milStrike.filter((r) => r.claimStatus === "government_claim").length)],
        ["Damage level stated", String(milStrike.filter((r) => r.damageLevel !== null).length)],
        ["Damage level UNKNOWN", String(milStrike.filter((r) => r.damageLevel === null).length)],
      ],
      independent: milStrike.filter(verified).length,
      status: "",
      score: "",
    },
    {
      dimension: "E. Escalation control",
      officialAccount: "Cessation via DGMO channel at 17:00 IST, 10 May; violations the same evening.",
      measures: [
        ["Ladder rungs reached", `${levels.size} of 8`],
        ["First strike → cessation (stated times)", `${Math.floor(hours)} h ${Math.round((hours % 1) * 60)} min`],
      ],
      independent: 0,
      status: "",
      score: "",
    },
  ];
  rows.forEach((r) => {
    r.status =
      r.independent > 0 ? `${r.independent} independently corroborated record(s)` : "Official account only – not independently corroborated in this database";
    r.score = scoreText(r.independent);
  });
  return rows;
}
