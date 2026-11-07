// Time utilities. All campaign times are Indian Standard Time (UTC+05:30).

export const IST_OFFSET = "+05:30";

export function toMs(sortTime: string): number {
  // sortTime is "YYYY-MM-DDTHH:mm" in IST
  return Date.parse(`${sortTime}:00${IST_OFFSET}`);
}

export const CAMPAIGN_START = toMs("2025-05-07T00:00");
export const CAMPAIGN_END = toMs("2025-05-11T00:00");
export const AFTERMATH_END = toMs("2025-05-13T00:00");

export const CAMPAIGN_DAYS = [
  { date: "2025-05-07", label: "7 MAY", title: "Initial precision counter-terror strikes" },
  { date: "2025-05-08", label: "8 MAY", title: "Air-defence and reciprocal escalation" },
  { date: "2025-05-09", label: "9 MAY", title: "Drone and counter-UAS confrontation" },
  { date: "2025-05-10", label: "10 MAY", title: "Military infrastructure strikes and cessation" },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Break a UTC ms value into IST calendar parts. */
export function istParts(ms: number) {
  const d = new Date(ms + 5.5 * 3600_000);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}

export function istDate(ms: number): string {
  const p = istParts(ms);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function formatIst(ms: number, withDate = true): string {
  const p = istParts(ms);
  const t = `${pad(p.h)}:${pad(p.mi)} IST`;
  return withDate ? `${pad(p.d)} ${MONTHS[p.mo - 1]} ${p.y} · ${t}` : t;
}

export function formatDateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function dayStart(date: string): number {
  return toMs(`${date}T00:00`);
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
