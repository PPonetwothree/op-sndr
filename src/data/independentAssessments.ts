// Independent damage assessments applied to BDA baselines. Only sources classed GREEN (independent)
// are used; levels are this reconstruction's 0–5 classification of what those sources describe.
// The Indian claim stays visible in the record's condition text.

export interface IndependentAssessment {
  targetId: string;
  level: number;
  finding: string;
  sources: string[];
}

export const INDEPENDENT_ASSESSMENTS: IndependentAssessment[] = [
  {
    targetId: "TGT-SARGODHA",
    level: 2,
    finding: "Runway cratered to halt take-offs temporarily; repairs visible in imagery by 11 May",
    sources: ["SRC-IND-STIMSON"],
  },
  { targetId: "TGT-RAHIM-YAR-KHAN", level: 2, finding: "Runway cratered to halt take-offs temporarily", sources: ["SRC-IND-STIMSON"] },
  { targetId: "TGT-SUKKUR", level: 2, finding: "Large hangar hit; no clear evidence aircraft were hit; base not disabled", sources: ["SRC-IND-STIMSON"] },
  { targetId: "TGT-BHOLARI", level: 2, finding: "Large hangar hit; no clear evidence aircraft were hit; base not disabled", sources: ["SRC-IND-STIMSON"] },
  { targetId: "TGT-JACOBABAD", level: 2, finding: "Large hangar hit; no clear evidence aircraft were hit; base not disabled", sources: ["SRC-IND-STIMSON"] },
  {
    targetId: "TGT-LAHORE-AD",
    level: 2,
    finding: "Strike established by videos and debris; Pakistan acknowledged 'partial damage' to equipment",
    sources: ["SRC-IND-STIMSON"],
  },
  {
    targetId: "TGT-MURIDKE",
    level: 3,
    finding: "Administrative block and mosque struck, roof partly collapsed, three killed (reporter on site)",
    sources: ["SRC-IND-AJ-MURIDKE"],
  },
];
