import { useMemo, useState } from "react";
import { Map as MapIcon, X, FilterX } from "lucide-react";
import { useSim, ALL_EVENTS } from "@/store/simulationStore";
import { useBdaRecords } from "@/store/bdaStore";
import { TARGETS, WEAPON_BY_ID } from "@/data";
import { CAMPAIGN_DAYS, formatDateLabel } from "@/engine/timelineEngine";
import { ESCALATION_LEVELS, EVENT_TYPE_LABEL } from "@/engine/assessmentEngine";
import { CLAIM_LABEL } from "@/engine/bdaEngine";
import { indexAtTime, maxEscalation } from "@/engine/eventEngine";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { TimeSlider } from "@/components/timeline/TimeSlider";
import { EvidenceBadge } from "@/components/event-cards/EvidenceBadge";
import {
  EventsPerDayChart,
  DomainPieChart,
  EscalationLineChart,
  TargetCategoryChart,
  DamageDistributionChart,
  UavTimelineChart,
  OffenceDefenceChart,
  EvidenceChart,
  CivilianImpactChart,
  RegionalDensityChart,
} from "@/components/charts/CampaignCharts";
import { ModuleHeader, ScopeToggle } from "../ModuleHeader";
import { useScopedEvents } from "../useScopedEvents";

function Kpi({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <Card className="px-3 py-2.5">
      <div className="label-caps">{label}</div>
      <div className="mono mt-1 text-[22px] font-semibold leading-none text-ink-100">{value}</div>
      <div className="mt-1 text-[10px] leading-snug text-ink-500">{sub}</div>
    </Card>
  );
}

function DayDetail({ date, onClose }: { date: string; onClose: () => void }) {
  const { setModule, setFilters, selectEvent } = useSim.getState();
  const bda = useBdaRecords();
  const events = ALL_EVENTS.filter((e) => e.date === date);
  const weapons = [...new Set(events.flatMap((e) => e.weaponSystemIds))].map((id) => WEAPON_BY_ID.get(id)).filter(Boolean);
  const cats = [...new Set(events.map((e) => e.weaponCategory).filter((w) => w && w !== "n/a"))];
  const targetIds = new Set(events.flatMap((e) => e.targetIds));
  const records = bda.filter((r) => targetIds.has(r.targetId));
  const day = CAMPAIGN_DAYS.find((d) => d.date === date);
  return (
    <Card className="border-olive-600">
      <div className="flex items-center justify-between border-b border-ink-700 px-3 py-2">
        <div>
          <span className="mono text-olive-300">{day?.label}</span> <span className="text-ink-200">· {day?.title}</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => {
              setFilters({ days: [date] });
              useSim.getState().selectDay(date);
              setModule("geospatial");
            }}
          >
            <MapIcon /> Open on map
          </Button>
          <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close day detail">
            <X />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-3">
        <div>
          <div className="label-caps mb-1">Events ({events.length})</div>
          <div className="max-h-[220px] space-y-1 overflow-auto">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  selectEvent(e.id);
                  setModule("geospatial");
                }}
                className="block w-full border border-ink-700 bg-ink-900 px-2 py-1 text-left hover:border-olive-500"
              >
                <div className="flex items-center gap-1.5">
                  <EvidenceBadge cls={e.evidenceClass} />
                  <span className="mono text-[10px] text-ink-400">
                    {e.id} {e.time ?? "--:--"}
                  </span>
                  <span className="text-[10px] text-ink-500">{EVENT_TYPE_LABEL[e.eventType]}</span>
                </div>
                <div className="text-[12px] text-ink-100">{e.title}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="label-caps mb-1">Weapon-system categories</div>
          <ul className="space-y-0.5 text-[11px] text-ink-300">
            {cats.map((c) => (
              <li key={c}>· {c}</li>
            ))}
          </ul>
          {weapons.length > 0 && (
            <>
              <div className="label-caps mb-1 mt-3">Named systems (with usage status)</div>
              <div className="flex flex-wrap gap-1">
                {weapons.map((w) => (
                  <span key={w!.id} className="border border-ink-700 bg-ink-900 px-1.5 py-0.5 text-[11px] text-ink-200" title={w!.usageNote}>
                    {w!.name} <span className="text-[9px] uppercase text-ink-500">{w!.usageStatus.replace(/_/g, " ")}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <div className="label-caps mb-1">Assessment records ({records.length})</div>
          <div className="max-h-[220px] space-y-1 overflow-auto">
            {records.map((r) => (
              <button
                key={r.targetId}
                onClick={() => {
                  useSim.getState().selectTarget(r.targetId);
                  setModule("assessment");
                }}
                className="block w-full border border-ink-700 bg-ink-900 px-2 py-1 text-left hover:border-olive-500"
              >
                <div className="text-[12px] text-ink-100">{r.targetName}</div>
                <div className="text-[10px] text-ink-400">
                  L{r.damageLevel ?? "?"} · {CLAIM_LABEL[r.claimStatus]}
                </div>
              </button>
            ))}
            {records.length === 0 && <div className="text-[11px] text-ink-500">No target assessment records for this day.</div>}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function OverviewModule() {
  const [upToClock, setUpToClock] = useState(false);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const events = useScopedEvents(upToClock);
  const records = useBdaRecords();
  const filters = useSim((s) => s.filters);
  const simTime = useSim((s) => s.simTime);
  const resetFilters = useSim((s) => s.resetFilters);

  const k = useMemo(() => {
    const ids = new Set(events.flatMap((e) => [...e.targetIds, ...e.location.locationIds]));
    const strikeTargets = TARGETS.filter((t) => t.side === "indian_strike_target" && ids.has(t.id));
    const civ = events.filter((e) => e.eventType === "civilian_impact" || /civilian/i.test(e.casualties?.category ?? ""));
    return {
      total: events.length,
      targets: strikeTargets.length,
      milInfra: events.filter((e) => e.eventType === "military_infrastructure_strike" || e.eventType === "sead_strike").length,
      uav: events.filter((e) => e.eventType === "counter_uas" || /drone|uav|ucav|loitering/i.test(e.weaponCategory)).length,
      ad: events.filter((e) => e.eventType === "air_defence_engagement" || e.eventType === "counter_uas").length,
      damage: events.filter((e) => e.damageAssessment.status === "claimed" && (e.damageAssessment.level ?? 1) > 0).length,
      civ: civ.length,
      esc: maxEscalation(events.slice(0, upToClock ? events.length : indexAtTime(events, simTime) + 1)),
    };
  }, [events, simTime, upToClock]);

  const filtered = filters.days.length + filters.domains.length + filters.actors.length + filters.evidence.length + filters.types.length > 0 || !!filters.search;

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader code="A" title="Campaign Overview">
        {filtered && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <FilterX /> Clear filters
          </Button>
        )}
        <ScopeToggle value={upToClock} onChange={setUpToClock} />
      </ModuleHeader>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {filtered && (
          <div className="border border-warn/40 bg-warn/10 px-3 py-1.5 text-[11px] text-warn">
            Filters active (set in Geospatial or by clicking charts): {[...filters.days.map(formatDateLabel), ...filters.actors, ...filters.domains, ...filters.evidence, ...filters.types, filters.search].filter(Boolean).join(", ")}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
          <Kpi label="Operational events" value={k.total} sub="Event records in scope" />
          <Kpi label="Indian-reported targets" value={k.targets} sub="Strike-target locations referenced" />
          <Kpi label="Mil. infrastructure events" value={k.milInfra} sub="Infrastructure + AD-suppression strikes" />
          <Kpi label="UAV activity" value={k.uav} sub="UAV-related event records (not drone count)" />
          <Kpi label="Air-defence events" value={k.ad} sub="AD engagement + counter-UAS records" />
          <Kpi label="Damage reports" value={k.damage} sub="Events with damage claimed/acknowledged" />
          <Kpi label="Civilian casualty reports" value={k.civ} sub="Records; figures not summed" />
          <Kpi label="Escalation level" value={`L${k.esc}`} sub={upToClock ? ESCALATION_LEVELS[k.esc] : `Peak at clock: ${ESCALATION_LEVELS[k.esc]}`} />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {CAMPAIGN_DAYS.map((d) => {
            const evs = ALL_EVENTS.filter((e) => e.date === d.date);
            const lvl = maxEscalation(evs);
            const active = openDay === d.date;
            return (
              <button
                key={d.date}
                onClick={() => setOpenDay(active ? null : d.date)}
                className={`border p-3 text-left transition-colors ${active ? "border-olive-400 bg-ink-800" : "border-ink-700 bg-ink-850 hover:border-olive-600"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[16px] font-semibold text-olive-300">{d.label}</span>
                  <Badge color="#e3a83b">Peak L{lvl}</Badge>
                </div>
                <div className="mt-1 text-[13px] font-medium text-ink-100">{d.title}</div>
                <div className="mono mt-2 flex gap-3 text-[10px] text-ink-400">
                  <span>{evs.length} events</span>
                  <span style={{ color: "#4a86dc" }}>IND {evs.filter((e) => e.actor === "India").length}</span>
                  <span style={{ color: "#d24848" }}>PAK {evs.filter((e) => e.actor === "Pakistan").length}</span>
                </div>
              </button>
            );
          })}
        </div>
        {openDay && <DayDetail date={openDay} onClose={() => setOpenDay(null)} />}

        <Card>
          <div className="flex items-center justify-between border-b border-ink-700 px-3 py-2">
            <span className="label-caps">Campaign timeline</span>
            <PlaybackControls />
          </div>
          <TimeSlider />
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          <EventsPerDayChart events={events} />
          <DomainPieChart events={events} />
          <EscalationLineChart events={events} />
          <TargetCategoryChart events={events} />
          <DamageDistributionChart records={records.filter((r) => events.some((e) => r.associatedEventIds.includes(e.id)))} />
          <UavTimelineChart events={events} />
          <OffenceDefenceChart events={events} />
          <EvidenceChart events={events} />
          <CivilianImpactChart events={events} />
          <RegionalDensityChart events={events} />
        </div>
        <p className="text-[10px] text-ink-500">
          All figures are counts of records in this reconstruction database. They are not totals of strikes, munitions, drones or casualties, and official claims are not presented as verified statistics. Damage level
          5 means destruction claimed by the government unless a record is marked independently verified.
        </p>
      </div>
    </div>
  );
}
