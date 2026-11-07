import type { BdaRecord } from "@/engine/bdaEngine";
import { DAMAGE_RAMP } from "@/engine/analytics";
import { DAMAGE_LEVELS } from "@/engine/assessmentEngine";

/** Generic schematic of an infrastructure type. Never a depiction of the real site. */
function Shape({ category, stroke }: { category: BdaRecord["category"]; stroke: string }) {
  const s = { fill: "none", stroke, strokeWidth: 1.5 };
  switch (category) {
    case "terrorist_infrastructure":
      return (
        <g {...s}>
          <rect x="20" y="40" width="40" height="30" />
          <rect x="70" y="30" width="55" height="40" />
          <rect x="135" y="45" width="30" height="25" />
          <rect x="45" y="80" width="80" height="25" />
          <path d="M10 115 H190" strokeDasharray="4 3" />
        </g>
      );
    case "air_base":
    case "military_station":
      return (
        <g {...s}>
          <rect x="10" y="80" width="180" height="16" />
          <path d="M20 88 H180" strokeDasharray="8 6" />
          <path d="M30 70 h30 v-20 h-30 z M70 70 h30 v-20 h-30 z M110 70 h30 v-20 h-30 z" />
          <path d="M160 70 v-35 h12 v35" />
        </g>
      );
    case "air_defence_radar":
      return (
        <g {...s}>
          <path d="M60 90 A40 40 0 0 1 140 90" />
          <path d="M100 90 L125 55" />
          <rect x="50" y="90" width="100" height="14" />
          <circle cx="40" cy="60" r="10" />
          <circle cx="160" cy="60" r="10" />
        </g>
      );
    case "lo_c_sector":
      return (
        <g {...s}>
          <path d="M10 70 q20 -10 40 0 t40 0 t40 0 t40 0 t30 0" />
          <path d="M30 95 h40 M90 95 h40 M150 95 h30" />
          <rect x="40" y="35" width="25" height="18" />
          <rect x="120" y="30" width="30" height="22" />
        </g>
      );
    default:
      return (
        <g {...s}>
          <path d="M30 100 V65 L55 45 L80 65 V100 Z" />
          <path d="M95 100 V60 L125 40 L155 60 V100 Z" />
          <path d="M10 108 H190" />
        </g>
      );
  }
}

export function InfrastructureSchematic({ record }: { record: BdaRecord }) {
  const lv = record.damageLevel;
  const color = lv === null ? "#5a6068" : DAMAGE_RAMP[lv];
  const verified = record.claimStatus === "independently_verified";
  return (
    <div className="grid grid-cols-2 gap-2">
      <figure className="border border-ink-700 bg-ink-900">
        <svg viewBox="0 0 200 125" className="h-[130px] w-full">
          <Shape category={record.category} stroke="#8a9098" />
        </svg>
        <figcaption className="border-t border-ink-700 px-2 py-1 text-[10px] text-ink-400">Original infrastructure – generic schematic</figcaption>
      </figure>
      <figure className="relative border border-ink-700 bg-ink-900">
        <svg viewBox="0 0 200 125" className="h-[130px] w-full">
          <defs>
            <pattern id={`hatch-${record.targetId}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2" opacity={verified ? 0.9 : 0.55} />
            </pattern>
          </defs>
          <Shape category={record.category} stroke={color} />
          {lv !== null && lv > 0 && <rect x="0" y="0" width="200" height="125" fill={`url(#hatch-${record.targetId})`} opacity={0.15 + lv * 0.08} />}
          <text x="100" y="20" textAnchor="middle" fontSize="10" fill="#e8eaed" fontFamily="monospace">
            {lv === null ? "LEVEL UNKNOWN" : `L${lv} · ${DAMAGE_LEVELS[lv].label.toUpperCase()}`}
          </text>
        </svg>
        <figcaption className="border-t border-ink-700 px-2 py-1 text-[10px] text-ink-400">
          Reported damage state – {verified ? "independently verified" : "as claimed/reported, not verified"}
        </figcaption>
        <div className="pointer-events-none absolute right-1 top-1 rotate-0 border border-ink-600 bg-ink-950/80 px-1 text-[8px] tracking-widest text-ink-400">
          SCHEMATIC · NOT IMAGERY
        </div>
      </figure>
    </div>
  );
}

export function DamageScale({ level }: { level: number | null }) {
  return (
    <div className="flex gap-0.5">
      {DAMAGE_LEVELS.map((d) => (
        <div
          key={d.level}
          title={d.label}
          className="flex-1 border px-1 py-1 text-center text-[9px]"
          style={{
            background: level === d.level ? DAMAGE_RAMP[d.level] : "transparent",
            borderColor: level === d.level ? DAMAGE_RAMP[d.level] : "#2a2e33",
            color: level === d.level ? (d.level >= 3 ? "#fff" : "#15171a") : "#8a9098",
          }}
        >
          {d.short}
        </div>
      ))}
    </div>
  );
}
