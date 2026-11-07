import { z } from "zod";
import rawEvents from "./events.json";
import rawTargets from "./targets.json";
import rawWeapons from "./weapons.json";
import rawSources from "./sources.json";
import { CampaignEventSchema, type CampaignEvent } from "@/schemas/eventSchema";
import { TargetSchema, type Target } from "@/schemas/targetSchema";
import { SourceSchema, WeaponSystemSchema, type Source, type WeaponSystem } from "@/schemas/referenceSchema";

export interface ValidationIssue {
  dataset: string;
  id: string;
  message: string;
}

function parseAll<T>(dataset: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>, rows: unknown[], issues: ValidationIssue[]): T[] {
  const out: T[] = [];
  rows.forEach((row, i) => {
    const res = schema.safeParse(row);
    const rid = (row as { id?: string })?.id ?? `#${i}`;
    if (res.success) out.push(res.data);
    else res.error.issues.forEach((iss) => issues.push({ dataset, id: rid, message: `${iss.path.join(".")}: ${iss.message}` }));
  });
  return out;
}

export function validateDatabase(input: { events: unknown[]; targets: unknown[]; weapons: unknown[]; sources: unknown[] }) {
  const issues: ValidationIssue[] = [];
  const sources = parseAll<Source>("sources", SourceSchema, input.sources, issues);
  const targets = parseAll<Target>("targets", TargetSchema, input.targets, issues);
  const weapons = parseAll<WeaponSystem>("weapons", WeaponSystemSchema, input.weapons, issues);
  const events = parseAll<CampaignEvent>("events", CampaignEventSchema, input.events, issues);

  const srcIds = new Set(sources.map((s) => s.id));
  const tgtIds = new Set(targets.map((t) => t.id));
  const wpnIds = new Set(weapons.map((w) => w.id));
  const evtIds = new Set(events.map((e) => e.id));
  const dup = (arr: { id: string }[], ds: string) => {
    const seen = new Set<string>();
    arr.forEach((a) => (seen.has(a.id) ? issues.push({ dataset: ds, id: a.id, message: "duplicate id" }) : seen.add(a.id)));
  };
  dup(events, "events");
  dup(targets, "targets");
  dup(weapons, "weapons");
  dup(sources, "sources");

  const checkSrc = (ds: string, id: string, list: string[]) =>
    list.forEach((s) => !srcIds.has(s) && issues.push({ dataset: ds, id, message: `unknown source ${s}` }));
  targets.forEach((t) => checkSrc("targets", t.id, t.sources));
  weapons.forEach((w) => {
    checkSrc("weapons", w.id, w.sources);
    w.eventIds.forEach((e) => !evtIds.has(e) && issues.push({ dataset: "weapons", id: w.id, message: `unknown event ${e}` }));
  });
  events.forEach((e) => {
    checkSrc("events", e.id, e.sources);
    e.location.locationIds.forEach((l) => !tgtIds.has(l) && issues.push({ dataset: "events", id: e.id, message: `unknown location ${l}` }));
    e.targetIds.forEach((l) => !tgtIds.has(l) && issues.push({ dataset: "events", id: e.id, message: `unknown target ${l}` }));
    e.weaponSystemIds.forEach((w) => !wpnIds.has(w) && issues.push({ dataset: "events", id: e.id, message: `unknown weapon ${w}` }));
  });
  return { events, targets, weapons, sources, issues };
}

const db = validateDatabase({
  events: rawEvents as unknown[],
  targets: rawTargets as unknown[],
  weapons: rawWeapons as unknown[],
  sources: rawSources as unknown[],
});

if (db.issues.length && import.meta.env?.DEV) {
  console.warn("[data] validation issues:", db.issues);
}

export const EVENTS: CampaignEvent[] = db.events;
export const TARGETS: Target[] = db.targets;
export const WEAPONS: WeaponSystem[] = db.weapons;
export const BASE_SOURCES: Source[] = db.sources;
export const DATA_ISSUES: ValidationIssue[] = db.issues;

export const TARGET_BY_ID = new Map(TARGETS.map((t) => [t.id, t]));
export const WEAPON_BY_ID = new Map(WEAPONS.map((w) => [w.id, w]));
