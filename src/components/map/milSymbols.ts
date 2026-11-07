// APP-6 / MIL-STD-2525C symbology for military locations (via milsymbol, offline).
// Affiliation is from the Indian (blue-force) perspective of this reconstruction:
// locations in Pakistan/PoJK struck by India are HOSTILE; Indian locations attacked are FRIENDLY.
// Civilian, LoC-sector and context locations keep the simple glyphs (no military symbol applies).
import L from "leaflet";
import * as milsymbolModule from "milsymbol";
import type { Target } from "@/types";
import { EVIDENCE } from "@/engine/assessmentEngine";

// milsymbol's ESM entry exports { ms, std2525c, ... } and needs icon sets registered explicitly;
// its CJS entry (and the bundled type definitions) expose the ready-made namespace. Support both.
type MsNamespace = typeof milsymbolModule;
// Vite pre-bundles the CJS build, which exposes the namespace as `default`.
const mod = milsymbolModule as unknown as { ms?: MsNamespace & { addIcons: (i: unknown) => void }; std2525c?: unknown; default?: MsNamespace };
const ms: MsNamespace = mod.ms ?? (typeof (mod.default as MsNamespace | undefined)?.Symbol === "function" ? mod.default! : milsymbolModule);
if (mod.ms && mod.std2525c) mod.ms.addIcons(mod.std2525c);

export function sidcFor(t: Target): string | null {
  const aff = t.side === "indian_strike_target" ? "H" : t.country === "India" ? "F" : "U";
  switch (t.category) {
    case "terrorist_infrastructure":
      return `S${aff}GPI-----H----`; // installation (non-state; function not coded)
    case "air_base":
    case "military_station":
      return t.markerLayer === "uav" ? `S${aff}GPI-----H----` : `S${aff}GPIBA---H----`; // airport / air base installation
    case "air_defence_radar":
      return t.id === "TGT-LAHORE-AD" ? `S${aff}GPUCD--------` : `S${aff}GPESR--------`; // AD unit / radar equipment
    case "naval":
      return `S${aff}SPCLCV-------`; // carrier
    default:
      return null;
  }
}

export const SIDC_LEGEND: { sidc: string; label: string }[] = [
  { sidc: "SHGPI-----H----", label: "Hostile installation (reported terrorist infrastructure)" },
  { sidc: "SHGPIBA---H----", label: "Hostile air base" },
  { sidc: "SHGPESR--------", label: "Hostile radar / AD site" },
  { sidc: "SFGPIBA---H----", label: "Friendly air base / military station" },
  { sidc: "SFSPCLCV-------", label: "Friendly carrier group (broad area)" },
];

export function symbolSvg(sidc: string, size = 14): string {
  return new ms.Symbol(sidc, { size, outlineWidth: 2, outlineColor: "#0b0d0e" }).asSVG();
}

const cache = new Map<string, L.DivIcon>();

export function milIcon(t: Target, state: "dim" | "active" | "selected"): L.DivIcon | null {
  const sidc = sidcFor(t);
  if (!sidc) return null;
  const key = `${sidc}|${state}|${t.evidenceClass}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const size = state === "selected" ? 22 : 16;
  const sym = new ms.Symbol(sidc, { size, outlineWidth: 2.5, outlineColor: "#0b0d0e" });
  const { width, height } = sym.getSize();
  const anchor = sym.getAnchor();
  const pip = EVIDENCE[t.evidenceClass].color;
  const ring = state === "selected" ? `<span class="pulse-ring" style="color:#e3a83b;left:${anchor.x - 14}px;top:${anchor.y - 14}px;width:28px;height:28px;inset:auto"></span>` : "";
  const html = `<div style="position:relative;width:${width}px;height:${height}px;opacity:${state === "dim" ? 0.45 : 1}">${ring}${sym.asSVG()}<span title="Evidence ${t.evidenceClass}" style="position:absolute;right:-2px;top:-2px;width:6px;height:6px;border-radius:9999px;background:${pip};box-shadow:0 0 0 1.5px #0b0d0e"></span></div>`;
  const icon = L.divIcon({ className: "leaflet-div-icon clean", html, iconSize: [width, height], iconAnchor: [anchor.x, anchor.y] });
  cache.set(key, icon);
  return icon;
}
