import { z } from "zod";
import { EvidenceClassSchema } from "./eventSchema";

export const SourceSchema = z.object({
  id: z.string().regex(/^SRC-[A-Z0-9-]+$/),
  title: z.string(),
  publisher: z.string(),
  publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  url: z.string().url(),
  sourceType: z.enum([
    "official_transcript",
    "official_press_release",
    "official_backgrounder",
    "official_statement",
    "media",
    "independent",
    "adversary_official",
    "user_added",
  ]),
  evidenceClass: EvidenceClassSchema,
  retrieval: z.enum(["read_in_full", "partially_read", "cited_not_retrieved", "user_added"]),
  notes: z.string().default(""),
  archiveUrl: z.string().url().optional(), // closest Internet Archive capture (scripts/check-sources.mjs)
  archivedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  archiveStatus: z.enum(["content_verified", "shell_only", "unchecked"]).optional(), // does the capture contain the cited text?
  lastChecked: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const UsageStatusSchema = z.enum([
  "officially_confirmed_used", // named by an Indian official source as used/deployed in the operation
  "debris_recovered_official", // Indian official source says debris was recovered / identified
  "officially_named_capability", // named generically in an official source without detail of use
  "preliminary_identification", // e.g. forensic examination ongoing
  "adversary_claim_rejected", // a claim (about this system) that India rejected
  "media_reported_only", // usage reported by media / later statements, not in retrieved primary sources
  "not_established",
]);

export const WeaponSystemSchema = z.object({
  id: z.string().regex(/^WPN-[A-Z0-9-]+$/),
  name: z.string(),
  country: z.string(), // country of origin
  operator: z.enum(["India", "Pakistan"]),
  domain: z.enum(["air", "land", "sea", "multi", "cyber_ew"]),
  platformCategory: z.string(),
  weaponClass: z.string(),
  force: z.string(), // e.g. "Indian Air Force", "Integrated air-defence assets"
  publicRole: z.string(),
  usageStatus: UsageStatusSchema,
  usageNote: z.string(),
  eventIds: z.array(z.string()).default([]),
  sources: z.array(z.string()).min(1),
  confidence: z.enum(["high", "medium", "low"]),
});

export type Source = z.infer<typeof SourceSchema>;
export type WeaponSystem = z.infer<typeof WeaponSystemSchema>;
export type UsageStatus = z.infer<typeof UsageStatusSchema>;
