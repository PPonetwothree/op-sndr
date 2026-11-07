// Core domain types for the Operation Sindoor reconstruction.
// Runtime validation lives in src/schemas (zod); these types are inferred there and re-exported here.

export type {
  CampaignEvent,
  Citation,
  CitationField,
  EventLocation,
  EventVector,
  Formation,
  DamageAssessmentSummary,
  EvidenceClass,
  EvidenceType,
  EventType,
  Domain,
  Actor,
  TimeBasis,
  LocationPrecision,
  VectorStyle,
} from "@/schemas/eventSchema";

export type { Target, TargetCategory } from "@/schemas/targetSchema";
export type { Source, WeaponSystem, UsageStatus } from "@/schemas/referenceSchema";

export type CampaignDay = "2025-04-22" | "2025-04-23" | "2025-05-07" | "2025-05-08" | "2025-05-09" | "2025-05-10" | "2025-05-11" | "2025-05-12";

export type ModuleId = "overview" | "geospatial" | "forces" | "assessment" | "escalation" | "after-action" | "sources" | "methods";

export type PlaybackSpeed = 1 | 2 | 5 | 10;

export type ScenarioMode = "historical" | "hypothetical";

export interface LayerVisibility {
  targets: boolean;
  infrastructure: boolean;
  military: boolean;
  airDefence: boolean;
  uav: boolean;
  civilian: boolean;
  eventLocations: boolean;
  sectors: boolean;
  vectors: boolean;
  coverage: boolean;
  artillery: boolean;
  boundaries: boolean;
  indiaBoundary: boolean;
  admin1: boolean;
  contested: boolean;
  labels: boolean;
  relief: boolean;
  dayNight: boolean;
  milSymbols: boolean;
  uncertainty: boolean;
  onlineTiles: boolean;
}

export interface EventFilters {
  days: string[]; // empty = all
  domains: string[];
  actors: string[];
  evidence: string[];
  types: string[];
  search: string;
  showPrelude: boolean;
}
