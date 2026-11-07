import L from "leaflet";
import type { Target } from "@/types";

export type MarkerKind = "target" | "airbase" | "ad" | "uav" | "civilian" | "sector" | "event" | "naval";

export function markerKind(t: Target): MarkerKind {
  if (t.category === "terrorist_infrastructure") return "target";
  if (t.category === "air_base" || t.category === "military_station") return t.markerLayer === "uav" ? "uav" : "airbase";
  if (t.category === "air_defence_radar") return "ad";
  if (t.category === "lo_c_sector") return "sector";
  if (t.category === "civilian_area" || t.category === "religious_site") return "civilian";
  if (t.category === "naval") return "naval";
  return "event";
}

export function sideColor(t: Target): string {
  if (t.side === "indian_strike_target") return "#4f8fe6"; // Indian-reported offensive event location
  if (t.side === "pakistani_attack_target")
    return t.category === "lo_c_sector" || t.category === "civilian_area" || t.category === "religious_site" ? "#d9773a" : "#e05252";
  return "#9aa874";
}

function glyph(kind: MarkerKind, c: string): string {
  switch (kind) {
    case "target": // diamond with crosshair
      return `<path d="M12 3 L21 12 L12 21 L3 12 Z" fill="${c}33" stroke="${c}" stroke-width="1.6"/><path d="M12 7v10M7 12h10" stroke="${c}" stroke-width="1.2"/>`;
    case "airbase": // triangle
      return `<path d="M12 4 L20.5 19 L3.5 19 Z" fill="${c}2a" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="14" r="1.6" fill="${c}"/>`;
    case "ad": // radar dish arc
      return `<path d="M5 17 A8 8 0 0 1 19 17" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M12 17 L16 9" stroke="${c}" stroke-width="1.4"/><rect x="4" y="17" width="16" height="2.5" fill="${c}55" stroke="${c}" stroke-width="1"/>`;
    case "uav": // square with X
      return `<rect x="5" y="5" width="14" height="14" fill="${c}22" stroke="${c}" stroke-width="1.5"/><path d="M8 8l8 8M16 8l-8 8" stroke="${c}" stroke-width="1.3"/>`;
    case "civilian": // ring with dot
      return `<circle cx="12" cy="12" r="7" fill="${c}22" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="12" r="2.2" fill="${c}"/>`;
    case "sector": // hatched square
      return `<rect x="5" y="5" width="14" height="14" fill="none" stroke="${c}" stroke-width="1.4" stroke-dasharray="3 2"/><path d="M5 19L19 5M5 12L12 5M12 19L19 12" stroke="${c}" stroke-width="1"/>`;
    case "naval": // anchor-ish
      return `<circle cx="12" cy="7" r="2" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M12 9v10M6 14c0 4 12 4 12 0M9 12h6" fill="none" stroke="${c}" stroke-width="1.4"/>`;
    default:
      return `<circle cx="12" cy="12" r="4" fill="${c}" stroke="#0f1113" stroke-width="1.5"/>`;
  }
}

const cache = new Map<string, L.DivIcon>();

export function makeIcon(kind: MarkerKind, color: string, state: "dim" | "active" | "selected"): L.DivIcon {
  const key = `${kind}|${color}|${state}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const size = state === "selected" ? 28 : 20;
  const opacity = state === "dim" ? 0.38 : 1;
  const ring = state === "selected" ? `<span class="pulse-ring" style="color:${color}"></span>` : "";
  const html = `<div style="position:relative;width:${size}px;height:${size}px;opacity:${opacity}">${ring}<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="position:relative;filter:drop-shadow(0 0 2px #000)">${glyph(kind, color)}</svg></div>`;
  const icon = L.divIcon({ className: "leaflet-div-icon clean", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  cache.set(key, icon);
  return icon;
}

/** Abstract formation symbol: shown when composition is unknown or only partially disclosed. */
export function formationIcon(kind: "air" | "uav" | "ground" | "naval", color: string, caption: string): L.DivIcon {
  const inner =
    kind === "uav"
      ? `<rect x="10" y="9" width="7" height="7" fill="none" stroke="${color}" stroke-width="1.3"/><rect x="23" y="9" width="7" height="7" fill="none" stroke="${color}" stroke-width="1.3"/><rect x="36" y="9" width="7" height="7" fill="none" stroke="${color}" stroke-width="1.3"/>`
      : kind === "naval"
        ? `<path d="M10 15 h33 l-5 5 h-23 z" fill="none" stroke="${color}" stroke-width="1.3"/>`
        : kind === "ground"
          ? `<path d="M10 18 L26 8 L42 18" fill="none" stroke="${color}" stroke-width="1.4"/>`
          : `<path d="M13 16 l5 -6 l5 6 M23 16 l5 -6 l5 6 M33 16 l5 -6 l5 6" fill="none" stroke="${color}" stroke-width="1.4"/>`;
  const html = `<div class="fade-in" style="display:flex;flex-direction:column;align-items:center;pointer-events:none">
    <svg width="54" height="26" viewBox="0 0 54 26"><rect x="2" y="2" width="50" height="22" fill="#0f1113cc" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 2"/>${inner}<text x="47" y="22" font-size="7" fill="${color}" font-family="monospace">?</text></svg>
    <div style="margin-top:2px;background:#0f1113d9;border:1px solid ${color}66;color:${color};font:600 8.5px/1.2 monospace;letter-spacing:.06em;padding:1px 4px;white-space:nowrap">${caption}</div></div>`;
  return L.divIcon({ className: "leaflet-div-icon clean", html, iconSize: [140, 46], iconAnchor: [70, 13] });
}
