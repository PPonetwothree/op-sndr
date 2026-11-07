import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, LabelList } from "recharts";
import { ChartCard, AXIS, GRID, TOOLTIP, LEGEND } from "./ChartCard";
import {
  eventsPerDay,
  eventsByDomain,
  escalationSeries,
  targetCategories,
  damageDistribution,
  uavTimeline,
  offenceDefence,
  evidenceDistribution,
  civilianTimeline,
  regionalDensity,
  infrastructureStatus,
  claimsVsCorroboration,
  CAT,
  SERIES,
  CLAIM_ORDER,
  CLAIM_COLOR,
} from "@/engine/analytics";
import { CLAIM_LABEL, type BdaRecord } from "@/engine/bdaEngine";
import { ESCALATION_LEVELS } from "@/engine/assessmentEngine";
import { formatIst } from "@/engine/timelineEngine";
import type { TimedEvent } from "@/engine/eventEngine";
import { useSim } from "@/store/simulationStore";

const R = [3, 3, 0, 0] as [number, number, number, number];
const GAP = { stroke: "#1a1d20", strokeWidth: 2 };

export function EventsPerDayChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => eventsPerDay(events), [events]);
  const setFilters = useSim((s) => s.setFilters);
  return (
    <ChartCard title="1 · Events per day" note="Database event records per date (click a bar to filter by that day)" table={{ columns: ["Date", "Events"], rows: data.map((d) => [d.label, d.count]) }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Bar isAnimationActive={false} dataKey="count" name="Events" fill={CAT[0]} radius={R} maxBarSize={36} onClick={(d: { date?: string }) => d?.date && setFilters({ days: [d.date] })} className="cursor-pointer">
            <LabelList dataKey="count" position="top" fill="#aeb4bb" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DomainPieChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => eventsByDomain(events), [events]);
  return (
    <ChartCard title="2 · Events by domain" note="Share of event records" table={{ columns: ["Domain", "Events"], rows: data.map((d) => [d.name, d.value]) }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="78%" paddingAngle={1} stroke="#1a1d20" strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP} />
          <Legend {...LEGEND} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function EscalationLineChart({ events, height = 220 }: { events: TimedEvent[]; height?: number }) {
  const data = useMemo(() => escalationSeries(events.filter((e) => e.phase !== "prelude")), [events]);
  const selectEvent = useSim((s) => s.selectEvent);
  return (
    <ChartCard
      height={height}
      title="3 · Escalation level over time"
      note="Ladder level of each event (step) and running peak, 7 May onward – analytical tagging (prelude = level 0)"
      table={{ columns: ["Event", "Time", "Level", "Peak"], rows: data.map((d) => [d.id, formatIst(d.t), d.level, d.peak]) }}
    >
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }} onClick={(s: { activePayload?: { payload: { id: string } }[] }) => s?.activePayload?.[0] && selectEvent(s.activePayload[0].payload.id)}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={(t: number) => formatIst(t).slice(0, 6)} {...AXIS} />
          <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={(t: number) => formatIst(t)}
            formatter={(v: number, n: string) => [`L${v} – ${ESCALATION_LEVELS[v]}`, n]}
          />
          <Legend {...LEGEND} />
          <Line isAnimationActive={false} type="stepAfter" dataKey="level" name="Event level" stroke={CAT[3]} strokeWidth={2} dot={{ r: 2.5, fill: CAT[3], stroke: "#1a1d20" }} activeDot={{ r: 5 }} />
          <Line isAnimationActive={false} type="stepAfter" dataKey="peak" name="Running peak" stroke={CAT[1]} strokeWidth={2} strokeDasharray="4 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TargetCategoryChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => targetCategories(events), [events]);
  return (
    <ChartCard title="4 · Target / location categories" note="Distinct locations referenced by the filtered events" table={{ columns: ["Category", "Indian strike targets", "Locations attacked (India)", "Context"], rows: data.map((d) => [d.category, d.indian, d.pakistani, d.context]) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 30, bottom: 0 }}>
          <CartesianGrid {...GRID} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...AXIS} />
          <YAxis type="category" dataKey="category" width={110} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Legend {...LEGEND} />
          <Bar isAnimationActive={false} dataKey="indian" name="Indian-reported strike target" stackId="a" fill={SERIES.offensive} {...GAP} />
          <Bar isAnimationActive={false} dataKey="pakistani" name="Location attacked (as reported by India)" stackId="a" fill={SERIES.pakistani} {...GAP} />
          <Bar isAnimationActive={false} dataKey="context" name="Context" stackId="a" fill="#5a6068" {...GAP} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DamageDistributionChart({ records, height = 220 }: { records: BdaRecord[]; height?: number }) {
  const data = useMemo(() => damageDistribution(records), [records]);
  const used = CLAIM_ORDER.filter((c) => data.some((d) => (d[c] as number) > 0));
  return (
    <ChartCard
      height={height}
      title="5 · Damage assessment distribution"
      note="BDA records by damage level (0–5), stacked by claim status. L5 = destruction claimed OR established – see colour."
      table={{ columns: ["Level", ...used.map((c) => CLAIM_LABEL[c])], rows: data.map((d) => [d.level as string, ...used.map((c) => d[c] as number)]) }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="level" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Legend {...LEGEND} />
          {used.map((c) => (
            <Bar isAnimationActive={false} key={c} dataKey={c} name={CLAIM_LABEL[c]} stackId="s" fill={CLAIM_COLOR[c]} maxBarSize={40} {...GAP} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function UavTimelineChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => uavTimeline(events), [events]);
  return (
    <ChartCard title="6 · UAV activity timeline" note="Number of UAV-related EVENT records per day – not the number of drones" table={{ columns: ["Date", "Hostile UAV events", "Indian UAV / C-UAS events"], rows: data.map((d) => [d.label, d.hostile, d.indian]) }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Legend {...LEGEND} />
          <Line isAnimationActive={false} dataKey="hostile" name="Pakistani UAV activity (reported)" stroke={SERIES.pakistani} strokeWidth={2} dot={{ r: 3 }} />
          <Line isAnimationActive={false} dataKey="indian" name="Indian UAV / counter-UAS" stroke={SERIES.defensive} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OffenceDefenceChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => offenceDefence(events), [events]);
  return (
    <ChartCard
      title="7 · Defensive and offensive events"
      note="Event records per day by role"
      table={{ columns: ["Date", "Indian offensive", "Defensive (AD / C-UAS)", "Pakistani attack (as reported)"], rows: data.map((d) => [d.label, d.indianOffensive, d.indianDefensive, d.pakistaniAttack]) }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={2}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Legend {...LEGEND} />
          <Bar isAnimationActive={false} dataKey="indianOffensive" name="Indian offensive" fill={SERIES.offensive} radius={R} maxBarSize={18} />
          <Bar isAnimationActive={false} dataKey="indianDefensive" name="Defensive (AD / C-UAS)" fill={SERIES.defensive} radius={R} maxBarSize={18} />
          <Bar isAnimationActive={false} dataKey="pakistaniAttack" name="Pakistani attack (as reported)" fill={SERIES.pakistani} radius={R} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function EvidenceChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => evidenceDistribution(events), [events]);
  return (
    <ChartCard title="8 · Evidence confidence distribution" note="Event records by evidence classification" table={{ columns: ["Class", "Meaning", "Events"], rows: data.map((d) => [d.cls, d.desc, d.count]) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid {...GRID} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...AXIS} />
          <YAxis type="category" dataKey="cls" width={56} {...AXIS} />
          <Tooltip {...TOOLTIP} formatter={(v: number, _n: string, p: { payload?: { desc: string } }) => [v, p.payload?.desc ?? ""]} />
          <Bar isAnimationActive={false} dataKey="count" name="Events" radius={[0, 3, 3, 0]} maxBarSize={22}>
            {data.map((d) => (
              <Cell key={d.cls} fill={d.color} />
            ))}
            <LabelList dataKey="count" position="right" fill="#aeb4bb" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CivilianImpactChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => civilianTimeline(events), [events]);
  return (
    <ChartCard
      title="9 · Civilian impact timeline"
      note="Event records reporting civilian impact. Stated casualty figures are in the tooltip/table – they are not summed."
      table={{ columns: ["Date", "Reports", "Stated figures"], rows: data.map((d) => [d.label, d.reports, d.statements.join(" | ") || "—"]) }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <div style={TOOLTIP.contentStyle} className="max-w-[260px] p-2">
                  <div className="text-[10px] text-ink-400">{(payload[0].payload as { label: string }).label}</div>
                  <div>{(payload[0].payload as { reports: number }).reports} report(s)</div>
                  {(payload[0].payload as { statements: string[] }).statements.map((s) => (
                    <div key={s} className="mt-1 text-[10px] text-ink-300">
                      {s}
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          <Bar isAnimationActive={false} dataKey="reports" name="Civilian-impact reports" fill={CAT[3]} radius={R} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RegionalDensityChart({ events }: { events: TimedEvent[] }) {
  const data = useMemo(() => regionalDensity(events), [events]);
  return (
    <ChartCard title="10 · Event density by geographic region" note="Events touching each region (an event can touch several)" table={{ columns: ["Region", "Events"], rows: data.map((d) => [d.region, d.count]) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 40, bottom: 0 }}>
          <CartesianGrid {...GRID} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...AXIS} />
          <YAxis type="category" dataKey="region" width={130} {...AXIS} interval={0} />
          <Tooltip {...TOOLTIP} />
          <Bar isAnimationActive={false} dataKey="count" name="Events" fill={CAT[2]} radius={[0, 3, 3, 0]} maxBarSize={14}>
            <LabelList dataKey="count" position="right" fill="#aeb4bb" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function InfrastructureStatusChart({ records }: { records: BdaRecord[] }) {
  const data = useMemo(() => infrastructureStatus(records), [records]);
  return (
    <ChartCard title="Infrastructure functional status" note="BDA records by stated functional status" table={{ columns: ["Status", "Records"], rows: data.map((d) => [d.status, d.count]) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 40, bottom: 0 }}>
          <CartesianGrid {...GRID} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...AXIS} />
          <YAxis type="category" dataKey="status" width={150} {...AXIS} interval={0} />
          <Tooltip {...TOOLTIP} />
          <Bar isAnimationActive={false} dataKey="count" name="Records" fill={CAT[4]} radius={[0, 3, 3, 0]} maxBarSize={18}>
            <LabelList dataKey="count" position="right" fill="#aeb4bb" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ClaimsChart({ records }: { records: BdaRecord[] }) {
  const data = useMemo(() => claimsVsCorroboration(records), [records]);
  return (
    <ChartCard
      title="Claims vs corroboration"
      note="Reported targets = Indian strike targets. Unresolved = not independently corroborated (excl. attacks stated as neutralised)."
      table={{ columns: ["Metric", "Records"], rows: data.map((d) => [d.metric, d.count]) }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="metric" {...AXIS} interval={0} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Bar isAnimationActive={false} dataKey="count" name="Records" radius={R} maxBarSize={44}>
            {data.map((d, i) => (
              <Cell key={d.metric} fill={[CAT[0], CAT[3], CAT[5], CAT[4]][i]} />
            ))}
            <LabelList dataKey="count" position="top" fill="#aeb4bb" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
