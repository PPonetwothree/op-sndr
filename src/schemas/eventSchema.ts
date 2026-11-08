import { z } from "zod";

export const EvidenceClassSchema = z.enum(["GREEN", "BLUE", "AMBER", "GREY"]);
export const EvidenceTypeSchema = z.enum([
  "independent_corroboration",
  "official_claim",
  "official_statement",
  "media_report",
  "analytical_reconstruction",
  "adversary_claim",
  "unverified",
]);
export const EventTypeSchema = z.enum([
  "terror_attack",
  "diplomatic_measure",
  "precision_strike",
  "drone_missile_attack",
  "air_defence_engagement",
  "counter_uas",
  "artillery_shelling",
  "sead_strike",
  "military_infrastructure_strike",
  "civilian_impact",
  "infiltration",
  "naval_posture",
  "information_operation",
  "cessation",
  "ceasefire_violation",
  "briefing",
]);
export const DomainSchema = z.enum(["air", "land", "sea", "cyber_info", "diplomatic", "multi"]);
export const ActorSchema = z.enum(["India", "Pakistan", "Terrorist_group", "Bilateral", "International"]);
export const TimeBasisSchema = z.enum(["stated", "approximate_window", "unknown"]);
export const LocationPrecisionSchema = z.enum(["site_reported", "town", "district", "regional", "front", "undisclosed"]);
export const VectorStyleSchema = z.enum(["indian_offensive", "indian_defensive", "pakistani_attack", "uav", "artillery", "unverified"]);

export const EventLocationSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  precision: LocationPrecisionSchema,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  locationIds: z.array(z.string()).default([]),
});

export const EventVectorSchema = z.object({
  from: z.string(), // location id or sector anchor id
  to: z.string(),
  style: VectorStyleSchema,
  label: z.string().optional(),
});

export const FormationSchema = z.object({
  status: z.enum(["undisclosed", "partially_disclosed", "publicly_described", "not_applicable"]),
  representation: z.enum(["abstract", "described", "none"]),
  publicDescription: z.string().nullable().default(null),
});

export const DamageAssessmentSummarySchema = z.object({
  status: z.enum(["claimed", "denied", "partially_corroborated", "corroborated", "unknown", "not_applicable"]),
  level: z.number().int().min(0).max(5).nullable(),
  confidence: z.enum(["high", "medium", "low", "unknown"]),
});

export const CitationFieldSchema = z.enum(["time", "location", "description", "casualties", "damage", "weapons", "formation", "attribution"]);

export const AccountStanceSchema = z.enum([
  "confirms_occurrence", // the source states the event happened
  "confirms_damage", // the source shows or states damage
  "concedes", // a statement against the speaker's own interest (e.g. India acknowledging losses)
  "disputes_damage", // occurrence accepted, damage denied or minimised
  "disputes_target", // occurrence accepted, nature of the target disputed
  "not_acknowledged", // the adversary's own list omits it
  "no_evidence_found", // an independent review found no supporting imagery
  "denies", // the source denies the event
  "claims_other", // a competing claim
]);
export const AccountPartySchema = z.enum(["pakistan_official", "independent", "indian_official"]);

/** One party's account of an event (comparison view and corroboration rule). */
export const AccountSchema = z.object({
  party: AccountPartySchema,
  sourceId: z.string(),
  stance: AccountStanceSchema,
  summary: z.string().min(10), // paraphrase
  excerpt: z
    .string()
    .refine((t) => t.trim().split(/\s+/).length <= 15, "Account excerpts are limited to 15 words")
    .optional(),
  locator: z.string().optional(),
});

/** A field-level citation: which source supports which field, where, with a short verbatim excerpt. */
export const CitationSchema = z.object({
  field: CitationFieldSchema,
  sourceId: z.string(),
  locator: z.string().min(3), // speaker / section / paragraph within the source
  excerpt: z
    .string()
    .min(3)
    .refine((t) => t.trim().split(/\s+/).length <= 30, "Excerpt must be 30 words or fewer"),
  note: z.string().optional(),
});

export const CampaignEventSchema = z
  .object({
    id: z.string().regex(/^EVT-\d{3}$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .nullable(), // IST, only when stated by a source
    sortTime: z.string(), // ISO-like IST timestamp used only for sequencing
    timeBasis: TimeBasisSchema,
    timeLabel: z.string(),
    phase: z.enum(["prelude", "campaign", "aftermath"]),
    title: z.string().min(1),
    eventType: EventTypeSchema,
    domain: DomainSchema,
    location: EventLocationSchema,
    actor: ActorSchema,
    reportedBy: z.string(),
    description: z.string().min(1),
    weaponCategory: z.string(),
    weaponSystemIds: z.array(z.string()).default([]),
    formation: FormationSchema,
    damageAssessment: DamageAssessmentSummarySchema,
    casualties: z
      .object({ killed: z.number().nullable(), injured: z.number().nullable(), category: z.string(), statedBy: z.string() })
      .nullable()
      .default(null),
    evidenceType: EvidenceTypeSchema,
    evidenceClass: EvidenceClassSchema,
    sources: z.array(z.string()).min(1, "Every historical event must cite a source"),
    verified: z.boolean(),
    escalationLevel: z.number().int().min(0).max(7),
    vectors: z.array(EventVectorSchema).default([]),
    targetIds: z.array(z.string()).default([]),
    notes: z.string().default(""),
    sample: z.boolean().default(false),
    provenance: z.array(CitationSchema).default([]),
    accounts: z.array(AccountSchema).default([]),
  })
  .superRefine((e, ctx) => {
    if (e.evidenceClass === "GREEN" && e.evidenceType === "official_claim") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An official claim cannot be classed GREEN (independently corroborated)" });
    }
    if (e.verified && e.evidenceClass !== "GREEN") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "verified=true requires GREEN evidence class" });
    }
    if (e.time !== null && e.timeBasis !== "stated") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A clock time may only be set when it is stated by a source" });
    }
    // Corroboration rule: GREEN needs a non-Indian confirming account, or an Indian statement against interest.
    if (e.evidenceClass === "GREEN") {
      const ok = e.accounts.some(
        (a) =>
          (a.party !== "indian_official" && ["confirms_occurrence", "confirms_damage", "disputes_damage", "disputes_target"].includes(a.stance)) ||
          a.stance === "concedes"
      );
      if (!ok)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["evidenceClass"],
          message: "GREEN requires a corroborating non-Indian account or an Indian concession",
        });
    }
    e.accounts.forEach((a, i) => {
      if (!e.sources.includes(a.sourceId))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["accounts", i], message: `Account source ${a.sourceId} is not listed in sources` });
    });
    e.provenance.forEach((c, i) => {
      if (!e.sources.includes(c.sourceId))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["provenance", i], message: `Citation source ${c.sourceId} is not listed in sources` });
    });
    if (!e.sortTime.startsWith(e.date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "sortTime must fall on the event date" });
    }
  });

export type EvidenceClass = z.infer<typeof EvidenceClassSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type Domain = z.infer<typeof DomainSchema>;
export type Actor = z.infer<typeof ActorSchema>;
export type TimeBasis = z.infer<typeof TimeBasisSchema>;
export type LocationPrecision = z.infer<typeof LocationPrecisionSchema>;
export type VectorStyle = z.infer<typeof VectorStyleSchema>;
export type EventLocation = z.infer<typeof EventLocationSchema>;
export type EventVector = z.infer<typeof EventVectorSchema>;
export type Formation = z.infer<typeof FormationSchema>;
export type DamageAssessmentSummary = z.infer<typeof DamageAssessmentSummarySchema>;
export type CampaignEvent = z.infer<typeof CampaignEventSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type AccountStance = z.infer<typeof AccountStanceSchema>;
export type CitationField = z.infer<typeof CitationFieldSchema>;
