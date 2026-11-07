import { downloadDataUrl, downloadText, toCsv } from "./download";
import { TARGETS } from "@/data";
import type { TimedEvent } from "@/engine/eventEngine";
import { CLAIM_LABEL, type BdaRecord } from "@/engine/bdaEngine";

export function exportEventsCsv(events: TimedEvent[], filename = "sindoor-event-timeline.csv") {
  const rows = events.map((e) => ({
    id: e.id,
    date: e.date,
    time_ist: e.time ?? "UNKNOWN",
    time_basis: e.timeBasis,
    time_label: e.timeLabel,
    phase: e.phase,
    title: e.title,
    event_type: e.eventType,
    domain: e.domain,
    actor: e.actor,
    reported_by: e.reportedBy,
    location: e.location.name,
    region: e.location.region,
    location_precision: e.location.precision,
    weapon_category: e.weaponCategory,
    weapon_systems: e.weaponSystemIds,
    formation_status: e.formation.status,
    damage_status: e.damageAssessment.status,
    damage_level: e.damageAssessment.level ?? "UNKNOWN",
    damage_confidence: e.damageAssessment.confidence,
    killed: e.casualties?.killed ?? "",
    injured: e.casualties?.injured ?? "",
    casualty_category: e.casualties?.category ?? "",
    evidence_class: e.evidenceClass,
    evidence_type: e.evidenceType,
    verified: e.verified,
    escalation_level: e.escalationLevel,
    sources: e.sources,
    description: e.description,
    notes: e.notes,
  }));
  downloadText(filename, "﻿" + toCsv(rows), "text/csv");
}

export function exportTargetsCsv(filename = "sindoor-target-database.csv") {
  const rows = TARGETS.map((t) => ({
    id: t.id,
    name: t.name,
    country: t.country,
    region: t.region,
    category: t.category,
    role: t.side,
    attribution: t.attribution ?? "",
    lat: t.lat,
    lng: t.lng,
    precision: t.precision,
    evidence_class: t.evidenceClass,
    sources: t.sources,
    official_description: t.officialDescription,
  }));
  downloadText(filename, "﻿" + toCsv(rows), "text/csv");
}

export async function exportMapPng(el: HTMLElement, filename = "sindoor-map-view.png") {
  const { toPng } = await import("html-to-image"); // loaded only when exporting
  const dataUrl = await toPng(el, {
    pixelRatio: 2,
    backgroundColor: "#0e1214",
    cacheBust: true,
    filter: (node) => !(node instanceof HTMLElement && node.classList?.contains("no-export")),
  });
  downloadDataUrl(filename, dataUrl);
}

export function exportBdaCsv(records: BdaRecord[], filename = "sindoor-bda-records.csv") {
  const rows = records.map((r) => ({
    target_id: r.targetId,
    target_name: r.targetName,
    region: r.region,
    country: r.country,
    target_category: r.category,
    associated_events: r.associatedEventIds,
    reported_weapon_category: r.reportedWeaponCategory,
    reported_damage: r.reportedDamage,
    infrastructure_condition: r.infrastructureCondition,
    functional_status: r.functionalStatus,
    secondary_damage: r.secondaryDamage,
    civilian_impact: r.civilianImpact,
    damage_level: r.damageLevel ?? "UNKNOWN",
    claim_status: CLAIM_LABEL[r.claimStatus],
    independently_verified: r.claimStatus === "independently_verified",
    confidence: r.confidence,
    evidence_sources: r.evidenceSourceIds,
    imagery_links: r.imagery.map((i) => `${i.caption} (${i.sourceId}) ${i.url}`),
    analyst_notes: r.notes,
    edited: r.edited,
    edited_at: r.editedAt ?? "",
  }));
  downloadText(filename, "﻿" + toCsv(rows), "text/csv");
}
