import { useState } from "react";
import { Save, X, Plus, Trash2 } from "lucide-react";
import type { BdaRecord, ClaimStatus } from "@/engine/bdaEngine";
import { CLAIM_LABEL } from "@/engine/bdaEngine";
import { DAMAGE_LEVELS } from "@/engine/assessmentEngine";
import { useSim, allSources } from "@/store/simulationStore";
import { Button } from "@/components/ui/button";

const input = "h-7 w-full border border-ink-600 bg-ink-900 px-1.5 text-[12px] outline-none focus:border-olive-500";
const area = "w-full border border-ink-600 bg-ink-900 px-1.5 py-1 text-[12px] outline-none focus:border-olive-500";

export function BdaEditor({ record, onSave, onCancel }: { record: BdaRecord; onSave: (r: BdaRecord) => void; onCancel: () => void }) {
  const [r, setR] = useState<BdaRecord>(record);
  const userSources = useSim((s) => s.userSources);
  const sources = allSources(userSources);
  const [addSrc, setAddSrc] = useState("");
  const [img, setImg] = useState({ url: "", caption: "", sourceId: "" });
  const greenAttached = r.evidenceSourceIds.some((id) => sources.find((s) => s.id === id)?.evidenceClass === "GREEN");
  const set = <K extends keyof BdaRecord>(k: K, v: BdaRecord[K]) => setR((x) => ({ ...x, [k]: v }));
  const verifiedBlocked = r.claimStatus === "independently_verified" && !greenAttached;

  return (
    <div className="space-y-2 text-[12px]">
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="label-caps">Damage level</span>
          <select className={input} value={r.damageLevel ?? ""} onChange={(e) => set("damageLevel", e.target.value === "" ? null : Number(e.target.value))}>
            <option value="">UNKNOWN</option>
            {DAMAGE_LEVELS.map((d) => (
              <option key={d.level} value={d.level}>
                {d.short}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-caps">Claim status</span>
          <select className={input} value={r.claimStatus} onChange={(e) => set("claimStatus", e.target.value as ClaimStatus)}>
            {(Object.keys(CLAIM_LABEL) as ClaimStatus[]).map((c) => (
              <option key={c} value={c} disabled={c === "independently_verified" && !greenAttached}>
                {CLAIM_LABEL[c]}
                {c === "independently_verified" && !greenAttached ? " (needs a GREEN source)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-caps">Assessment confidence</span>
          <select className={input} value={r.confidence} onChange={(e) => set("confidence", e.target.value as BdaRecord["confidence"])}>
            {["high", "medium", "low", "unknown"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-caps">Functional status</span>
          <input className={input} value={r.functionalStatus} onChange={(e) => set("functionalStatus", e.target.value)} />
        </label>
      </div>
      {(
        [
          ["infrastructureCondition", "Infrastructure condition"],
          ["reportedWeaponCategory", "Reported weapon category"],
          ["secondaryDamage", "Secondary damage"],
          ["civilianImpact", "Civilian impact"],
        ] as const
      ).map(([k, l]) => (
        <label key={k} className="block">
          <span className="label-caps">{l}</span>
          <input className={input} value={r[k]} onChange={(e) => set(k, e.target.value)} />
        </label>
      ))}
      <label className="block">
        <span className="label-caps">Reported damage</span>
        <textarea className={area} rows={4} value={r.reportedDamage} onChange={(e) => set("reportedDamage", e.target.value)} />
      </label>
      <label className="block">
        <span className="label-caps">Analyst notes</span>
        <textarea className={area} rows={2} value={r.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>

      <div>
        <span className="label-caps">Evidence sources</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {r.evidenceSourceIds.map((id) => (
            <span key={id} className="flex items-center gap-1 border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-[11px]">
              {id}
              <button
                onClick={() =>
                  set(
                    "evidenceSourceIds",
                    r.evidenceSourceIds.filter((x) => x !== id)
                  )
                }
                aria-label={`Remove ${id}`}
                className="text-ink-500 hover:text-hostile"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-1 flex gap-1">
          <select aria-label="Add a source from the register" className={input} value={addSrc} onChange={(e) => setAddSrc(e.target.value)}>
            <option value="">Add a source from the register…</option>
            {sources
              .filter((s) => !r.evidenceSourceIds.includes(s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.evidenceClass}] {s.id} – {s.title}
                </option>
              ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={!addSrc}
            onClick={() => {
              const s = sources.find((x) => x.id === addSrc)!;
              setR((x) => ({
                ...x,
                evidenceSourceIds: [...x.evidenceSourceIds, addSrc],
                evidenceTimeline: [
                  ...x.evidenceTimeline,
                  { date: s.publicationDate, sourceId: s.id, eventId: null, note: `Added by analyst: ${s.title}` },
                ].sort((a, b) => a.date.localeCompare(b.date)),
              }));
              setAddSrc("");
            }}
          >
            <Plus /> Add
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-ink-500">
          Add new public sources in Source Management first. Attaching a source never changes the claim status by itself.
        </p>
      </div>

      <div>
        <span className="label-caps">Before/after imagery (only publicly available, properly sourced)</span>
        {r.imagery.map((im, i) => (
          <div key={i} className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="flex-1 truncate">
              {im.caption} – {im.sourceId}
            </span>
            <button
              onClick={() =>
                set(
                  "imagery",
                  r.imagery.filter((_, j) => j !== i)
                )
              }
              aria-label="Remove imagery link"
              className="text-ink-500 hover:text-hostile"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <div className="mt-1 grid grid-cols-[1fr_1fr_1fr_auto] gap-1">
          <input className={input} placeholder="Image URL (https://…)" value={img.url} onChange={(e) => setImg({ ...img, url: e.target.value })} />
          <input
            className={input}
            placeholder="Caption (before/after, date)"
            value={img.caption}
            onChange={(e) => setImg({ ...img, caption: e.target.value })}
          />
          <select aria-label="Imagery source" className={input} value={img.sourceId} onChange={(e) => setImg({ ...img, sourceId: e.target.value })}>
            <option value="">Source…</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={!/^https:\/\//.test(img.url) || !img.caption || !img.sourceId}
            onClick={() => {
              set("imagery", [...r.imagery, img]);
              setImg({ url: "", caption: "", sourceId: "" });
            }}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {verifiedBlocked && <div className="text-[11px] text-hostile">“Independently verified” requires at least one GREEN (independent) source attached.</div>}
      <div className="flex gap-1 pt-1">
        <Button onClick={() => onSave(r)} disabled={verifiedBlocked}>
          <Save /> Save record
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
