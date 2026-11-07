// Shareable links: the view state lives in the URL hash so a link (or a refresh) reopens the
// same moment. Only state that differs from the defaults is written, keeping links short.
import type { EventFilters, LayerVisibility, ModuleId } from "@/types";
import { EMPTY_FILTERS } from "@/engine/eventEngine";

export interface UrlState {
  module?: ModuleId;
  simTime?: number;
  eventId?: string;
  filters?: Partial<EventFilters>;
  layers?: Partial<LayerVisibility>;
  showAll?: boolean;
  view?: { center: [number, number]; zoom: number };
  escalation?: number;
  briefingStep?: number;
}

const MODULES: ModuleId[] = ["overview", "geospatial", "forces", "assessment", "escalation", "after-action", "sources", "methods"];
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function encodeUrlState(s: UrlState, defaults: LayerVisibility): string {
  const p = new URLSearchParams();
  if (s.module && s.module !== "geospatial") p.set("m", s.module);
  if (s.briefingStep !== undefined) p.set("b", String(s.briefingStep + 1));
  else if (s.eventId) p.set("e", s.eventId);
  else if (s.simTime !== undefined) p.set("t", String(Math.round(s.simTime / 60000))); // minutes since epoch
  const f = s.filters;
  if (f) {
    if (f.days?.length) p.set("d", f.days.join(","));
    if (f.actors?.length) p.set("a", f.actors.join(","));
    if (f.domains?.length) p.set("o", f.domains.join(","));
    if (f.evidence?.length) p.set("v", f.evidence.join(","));
    if (f.types?.length) p.set("y", f.types.join(","));
    if (f.search) p.set("q", f.search);
    if (f.showPrelude === false) p.set("pre", "0");
  }
  if (s.layers) {
    const diff = (Object.keys(defaults) as (keyof LayerVisibility)[])
      .filter((k) => s.layers![k] !== undefined && s.layers![k] !== defaults[k])
      .map((k) => (s.layers![k] ? `+${k}` : `-${k}`));
    if (diff.length) p.set("l", diff.join(","));
  }
  if (s.showAll) p.set("all", "1");
  if (s.escalation !== undefined) p.set("x", String(s.escalation));
  if (s.view) p.set("c", `${s.view.center[0].toFixed(3)},${s.view.center[1].toFixed(3)},${s.view.zoom}`);
  return p.toString();
}

export function decodeUrlState(hash: string, defaults: LayerVisibility): UrlState {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: UrlState = {};
  const m = p.get("m") as ModuleId | null;
  if (m && MODULES.includes(m)) out.module = m;
  const b = Number(p.get("b"));
  if (Number.isInteger(b) && b >= 1) out.briefingStep = b - 1;
  const e = p.get("e");
  if (e && /^EVT-\d{3}$/.test(e)) out.eventId = e;
  const t = Number(p.get("t"));
  if (p.get("t") && Number.isFinite(t)) out.simTime = t * 60000;
  const filters: Partial<EventFilters> = {};
  if (p.has("d")) filters.days = list(p.get("d")).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (p.has("a")) filters.actors = list(p.get("a"));
  if (p.has("o")) filters.domains = list(p.get("o"));
  if (p.has("v")) filters.evidence = list(p.get("v")).filter((v) => ["GREEN", "BLUE", "AMBER", "GREY"].includes(v));
  if (p.has("y")) filters.types = list(p.get("y"));
  if (p.has("q")) filters.search = p.get("q") ?? "";
  if (p.get("pre") === "0") filters.showPrelude = false;
  if (Object.keys(filters).length) out.filters = { ...EMPTY_FILTERS, ...filters };
  if (p.has("l")) {
    const layers: Partial<LayerVisibility> = {};
    list(p.get("l")).forEach((tok) => {
      const k = tok.slice(1) as keyof LayerVisibility;
      if (k in defaults && (tok[0] === "+" || tok[0] === "-")) layers[k] = tok[0] === "+";
    });
    out.layers = layers;
  }
  if (p.get("all") === "1") out.showAll = true;
  const x = Number(p.get("x"));
  if (p.has("x") && Number.isInteger(x) && x >= 0 && x <= 7) out.escalation = x;
  const c = list(p.get("c")).map(Number);
  if (c.length === 3 && c.every(Number.isFinite) && c[0] > -90 && c[0] < 90 && c[2] >= 3 && c[2] <= 12) out.view = { center: [c[0], c[1]], zoom: c[2] };
  return out;
}
