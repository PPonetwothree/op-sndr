import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadText, toCsv } from "./download";
import { CLAIM_LABEL, type BdaRecord } from "@/engine/bdaEngine";
import { ESCALATION_LADDER } from "@/data/escalation";
import { AAR_SECTIONS } from "@/data/afterAction";
import { WEAPONS } from "@/data";
import { EVIDENCE } from "@/engine/assessmentEngine";
import { formatDateLabel } from "@/engine/timelineEngine";
import type { TimedEvent } from "@/engine/eventEngine";
import type { Source } from "@/types";

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

// ── PDF helpers ─────────────────────────────────────────────
const OLIVE: [number, number, number] = [67, 76, 46];
type Doc = jsPDF & { lastAutoTable?: { finalY: number } };

function header(doc: Doc, title: string, subtitle: string) {
  doc.setFillColor(21, 23, 26);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(232, 234, 237);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 12, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitle, 12, 16);
  doc.setTextColor(30, 30, 30);
}

function footer(doc: Doc) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.text(
      "Reconstruction from public Indian government accounts. Official claims are not independently verified unless marked GREEN. Vectors/formations illustrative.",
      12,
      h - 6
    );
    doc.text(`Page ${i} / ${n} · generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`, w - 12, h - 6, { align: "right" });
  }
}

function heading(doc: Doc, text: string, y: number) {
  if (y > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 18;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(text, 12, y);
  doc.setFont("helvetica", "normal");
  return y + 4;
}

function para(doc: Doc, text: string, y: number, size = 8.5) {
  doc.setFontSize(size);
  const w = doc.internal.pageSize.getWidth() - 24;
  const lines = doc.splitTextToSize(text, w);
  if (y + lines.length * 4 > doc.internal.pageSize.getHeight() - 14) {
    doc.addPage();
    y = 18;
  }
  doc.text(lines, 12, y);
  return y + lines.length * 3.8 + 2;
}

const tableStyle = {
  styles: { fontSize: 7, cellPadding: 1.4, overflow: "linebreak" as const, valign: "top" as const },
  headStyles: { fillColor: OLIVE, textColor: [240, 240, 240] as [number, number, number], fontStyle: "bold" as const },
  alternateRowStyles: { fillColor: [245, 246, 242] as [number, number, number] },
  margin: { left: 12, right: 12 },
};

function escalationTable(doc: Doc, startY: number) {
  autoTable(doc, {
    ...tableStyle,
    startY,
    head: [
      [
        "Lvl",
        "Name",
        "Trigger / date-time",
        "Domain",
        "Indian govt account",
        "Adversary action (reported)",
        "Indian response",
        "Political implications*",
        "Significance*",
        "Sources",
      ],
    ],
    body: ESCALATION_LADDER.map((l) => [
      String(l.level),
      l.name,
      `${l.triggerEventIds.join(", ")}\n${l.dateTime}`,
      l.domain,
      l.governmentAccount,
      l.adversaryAction,
      l.indianResponse,
      l.politicalImplications,
      l.significance,
      l.sources.join(", "),
    ]),
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 24 }, 2: { cellWidth: 26 }, 3: { cellWidth: 18 }, 9: { cellWidth: 24 } },
  });
  return (doc.lastAutoTable?.finalY ?? startY) + 4;
}

export function exportEscalationPdf() {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }) as Doc;
  header(doc, "OPERATION SINDOOR – ESCALATION MATRIX", "Historical reconstruction · 22 April – 12 May 2025 · levels 0–7");
  const y = escalationTable(doc, 28);
  para(
    doc,
    "* Political implications and escalation significance are analytical assessments (AMBER), not official statements. All other columns paraphrase the cited official sources.",
    y,
    7.5
  );
  footer(doc);
  doc.save("sindoor-escalation-matrix.pdf");
}

export function exportCampaignPdf(opts: { events: TimedEvent[]; bda: BdaRecord[]; sources: Source[] }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }) as Doc;
  header(doc, "OPERATION SINDOOR – FULL CAMPAIGN ASSESSMENT", "Multi-domain campaign reconstruction · 7–10 May 2025 (with prelude and aftermath)");
  let y = 30;
  y = heading(doc, "Scope and method", y);
  y = para(
    doc,
    `This report is generated from a reconstruction database of ${opts.events.length} events, ${opts.bda.length} battle-damage assessment records, ${WEAPONS.length} weapon-system entries and ${opts.sources.length} sources. Evidence classes: ${Object.entries(
      EVIDENCE
    )
      .map(([k, v]) => `${k} = ${v.desc}`)
      .join("; ")}. Where data is unavailable it is shown as UNKNOWN. No numerical effectiveness scores are assigned.`,
    y
  );
  const counts = Object.keys(EVIDENCE).map((k) => `${k}: ${opts.events.filter((e) => e.evidenceClass === k).length}`);
  y = para(doc, `Evidence distribution of events – ${counts.join(" · ")}.`, y);

  y = heading(doc, "Escalation matrix", y + 2);
  y = escalationTable(doc, y);

  doc.addPage();
  y = heading(doc, "Campaign event timeline", 18);
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["ID", "Date", "Time (IST)", "Event", "Actor", "Type", "Location", "Damage", "Evidence", "Lvl", "Sources"]],
    body: opts.events.map((e) => [
      e.id,
      formatDateLabel(e.date),
      e.time ?? "UNKNOWN",
      e.title,
      e.actor.replace("_", " "),
      e.eventType.replace(/_/g, " "),
      e.location.name,
      e.damageAssessment.level === null ? e.damageAssessment.status : `L${e.damageAssessment.level} ${e.damageAssessment.status}`,
      e.evidenceClass,
      String(e.escalationLevel),
      e.sources.join(", "),
    ]),
    columnStyles: { 0: { cellWidth: 14 }, 3: { cellWidth: 60 }, 6: { cellWidth: 42 } },
  });

  doc.addPage();
  y = heading(doc, "Battle damage assessment", 18);
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Target", "Region", "Category", "Level", "Claim status", "Condition", "Functional status", "Civilian impact", "Confidence"]],
    body: opts.bda.map((r) => [
      r.targetName,
      r.region,
      r.category.replace(/_/g, " "),
      r.damageLevel === null ? "UNKNOWN" : String(r.damageLevel),
      CLAIM_LABEL[r.claimStatus],
      r.infrastructureCondition,
      r.functionalStatus,
      r.civilianImpact,
      r.confidence,
    ]),
  });

  doc.addPage();
  y = heading(doc, "After-action review", 18);
  for (const s of AAR_SECTIONS) {
    y = heading(doc, `${s.id}. ${s.title}`, y + 2);
    for (const b of s.blocks) {
      doc.setFont("helvetica", "bold");
      y = para(doc, b.heading, y, 8.5);
      doc.setFont("helvetica", "normal");
      for (const it of b.items)
        y = para(doc, `• [${it.basis.replace(/_/g, " ").toUpperCase()}] ${it.text}${it.sources.length ? ` (${it.sources.join(", ")})` : ""}`, y, 8);
    }
  }

  doc.addPage();
  y = heading(doc, "Weapon-system database (usage as stated in sources)", 18);
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["System", "Operator", "Category", "Usage status", "Note", "Events", "Sources"]],
    body: WEAPONS.map((w) => [
      w.name,
      w.operator,
      w.platformCategory,
      w.usageStatus.replace(/_/g, " "),
      w.usageNote,
      w.eventIds.join(", ") || "—",
      w.sources.join(", "),
    ]),
    columnStyles: { 4: { cellWidth: 90 } },
  });

  doc.addPage();
  y = heading(doc, "Sources", 18);
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["ID", "Title", "Publisher", "Date", "Class", "Retrieval", "URL"]],
    body: opts.sources.map((s) => [s.id, s.title, s.publisher, s.publicationDate, s.evidenceClass, s.retrieval.replace(/_/g, " "), s.url]),
    columnStyles: { 1: { cellWidth: 70 }, 6: { cellWidth: 80 } },
  });
  footer(doc);
  doc.save("sindoor-campaign-assessment.pdf");
}
