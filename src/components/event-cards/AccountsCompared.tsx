import { ExternalLink } from "lucide-react";
import { useSim, allSources } from "@/store/simulationStore";
import { Badge } from "@/components/ui/primitives";
import type { Account, AccountStance } from "@/types";

const PARTY: Record<Account["party"], { label: string; color: string }> = {
  indian_official: { label: "Indian official", color: "#5e78e6" },
  pakistan_official: { label: "Pakistani official", color: "#d24848" },
  independent: { label: "Independent", color: "#16a08a" },
};

export const STANCE: Record<AccountStance, { label: string; color: string }> = {
  confirms_occurrence: { label: "Confirms it happened", color: "#16a08a" },
  confirms_damage: { label: "Confirms damage", color: "#16a08a" },
  concedes: { label: "Concedes (against own interest)", color: "#16a08a" },
  disputes_damage: { label: "Accepts strike · disputes damage", color: "#b28c16" },
  disputes_target: { label: "Accepts strike · disputes target", color: "#b28c16" },
  not_acknowledged: { label: "Not acknowledged", color: "#8a8f98" },
  no_evidence_found: { label: "No supporting evidence found", color: "#8a8f98" },
  denies: { label: "Denies", color: "#d24848" },
  claims_other: { label: "Competing claim", color: "#d24848" },
};

/** Side-by-side accounts: Indian official (the event itself), Pakistani official and independent. */
export function AccountsCompared({ accounts, indianSummary }: { accounts: Account[]; indianSummary?: string }) {
  const sources = allSources(useSim((s) => s.userSources));
  if (!accounts.length)
    return (
      <p className="text-[11px] text-ink-500">
        No Pakistani official or independent account is recorded for this event. It rests on the Indian official account only.
      </p>
    );
  const order: Account["party"][] = ["indian_official", "pakistan_official", "independent"];
  return (
    <div className="space-y-2" data-testid="accounts-compared">
      {indianSummary && !accounts.some((a) => a.party === "indian_official") && (
        <div className="border-l-2 pl-2" style={{ borderColor: PARTY.indian_official.color }}>
          <Badge color={PARTY.indian_official.color}>{PARTY.indian_official.label}</Badge>
          <p className="mt-0.5 text-[11.5px] text-ink-300">{indianSummary}</p>
        </div>
      )}
      {order.flatMap((party) =>
        accounts
          .filter((a) => a.party === party)
          .map((a, i) => {
            const s = sources.find((x) => x.id === a.sourceId);
            return (
              <div key={`${party}-${i}`} className="border-l-2 pl-2" style={{ borderColor: PARTY[party].color }}>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge color={PARTY[party].color}>{PARTY[party].label}</Badge>
                  <Badge color={STANCE[a.stance].color}>{STANCE[a.stance].label}</Badge>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-200">{a.summary}</p>
                {a.excerpt && <blockquote className="mt-0.5 text-[11px] italic text-ink-300">“{a.excerpt}”</blockquote>}
                {s && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-ink-400 hover:text-olive-300"
                  >
                    {s.publisher} · {s.publicationDate}
                    {a.locator ? ` · ${a.locator}` : ""}
                    <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}
