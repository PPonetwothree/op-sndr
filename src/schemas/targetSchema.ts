import { z } from "zod";
import { EvidenceClassSchema } from "./eventSchema";

export const TargetCategorySchema = z.enum([
  "terrorist_infrastructure",
  "air_base",
  "air_defence_radar",
  "military_station",
  "civilian_area",
  "lo_c_sector",
  "religious_site",
  "government",
  "naval",
]);

// A "location" record. Any geographic point referenced by events (targets, Indian locations, LoC sectors).
export const TargetSchema = z.object({
  id: z.string().regex(/^(TGT|LOC|IND|SEC)-[A-Z0-9-]+$/),
  name: z.string(),
  altNames: z.array(z.string()).default([]),
  country: z.enum(["Pakistan", "PoJK", "India", "Gilgit-Baltistan"]),
  region: z.string(),
  category: TargetCategorySchema,
  markerLayer: z.enum(["targets", "infrastructure", "military", "airDefence", "uav", "civilian", "eventLocations"]),
  side: z.enum(["indian_strike_target", "pakistani_attack_target", "context"]),
  lat: z.number(),
  lng: z.number(),
  precision: z.enum(["site_reported", "town", "district", "regional"]),
  attribution: z.string().nullable().default(null), // e.g. organisation attributed by Indian briefers
  officialDescription: z.string().default(""),
  statedDistance: z
    .object({ km: z.tuple([z.number(), z.number()]), from: z.enum(["LoC", "IB"]), sourceId: z.string() })
    .nullable()
    .default(null),
  sources: z.array(z.string()).min(1),
  evidenceClass: EvidenceClassSchema,
});

export type TargetCategory = z.infer<typeof TargetCategorySchema>;
export type Target = z.infer<typeof TargetSchema>;
