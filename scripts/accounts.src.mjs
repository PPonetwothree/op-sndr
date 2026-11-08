// Other parties' accounts of events (Pakistani official statements, independent analyses, Indian
// statements against interest). Summaries paraphrase; excerpts are verbatim and ≤ 15 words.
// UPGRADES lists events whose occurrence is corroborated outside Indian official accounts; the schema
// refuses GREEN without a qualifying account. Damage is never upgraded here (see BDA assessments).

const PAK7 = "SRC-PAK-DAWN-0507";
const PAK10 = "SRC-PAK-RP-0510";
const PAK13 = "SRC-PAK-RP-0513";
const STIM = "SRC-IND-STIMSON";
const AJM = "SRC-IND-AJ-MURIDKE";

const a = (party, sourceId, stance, summary, excerpt, locator) => ({
  party,
  sourceId,
  stance,
  summary,
  ...(excerpt ? { excerpt } : {}),
  ...(locator ? { locator } : {}),
});
const NOT_IN_LIST = (where) =>
  a(
    "pakistan_official",
    PAK7,
    "not_acknowledged",
    `Pakistan's site-by-site account of the 7 May strikes does not list a separate site at ${where}.`,
    undefined,
    "DG ISPR site list"
  );

const STIM_AIRBASE_NO_IMAGERY = a(
  "independent",
  STIM,
  "no_evidence_found",
  "Stimson's review knew of no commercial satellite imagery validating the Indian claim at this site.",
  "no commercial imagery validating Indian claims at Chunian, Arifwala, Pasrur, or Rafiqui",
  "Section on 9–10 May strikes"
);
const STIM_RUNWAYS = a(
  "independent",
  STIM,
  "confirms_damage",
  "Commercial imagery shows runways cratered to halt take-offs temporarily; the bases were damaged but not disabled.",
  "India decided to crater runways to temporarily halt takeoffs",
  "Section on 9–10 May strikes"
);
const STIM_HANGARS = a(
  "independent",
  STIM,
  "confirms_damage",
  "Commercial imagery shows large hangars hit; there is no clear evidence that aircraft were hit, and the base was not disabled.",
  "large hangers were hit that could have housed aircraft",
  "Section on 9–10 May strikes"
);
const PAK_AIRBASES = a(
  "pakistan_official",
  PAK10,
  "disputes_damage",
  "Pakistan's military acknowledged that India fired air-to-surface missiles at Nur Khan, Murid and Shorkot, but said all air force assets were safe and most missiles were intercepted.",
  "India has targeted the Pakistan Air Force’s Nur Khan, Murid and Shorkot air bases",
  "DG ISPR, 10 May"
);

export const ACCOUNTS = {
  "EVT-001": [
    a(
      "independent",
      "SRC-UNSC-0425",
      "confirms_occurrence",
      "The UN Security Council condemned the attack and called for those responsible to be held accountable; it did not attribute it to a group."
    ),
  ],
  "EVT-003": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_target",
      "Pakistan's military acknowledged Indian strikes at six sites (India says nine) and said mosques and civilians were hit, not terrorist camps.",
      "late-night strikes launched by its neighbouring country at six sites"
    ),
    a(
      "pakistan_official",
      PAK13,
      "disputes_target",
      "Pakistan's final toll for the night of 6–7 May: 40 civilians killed, including 7 women and 15 children, and 121 injured.",
      "Forty civilians, including seven women and fifteen children, were martyred"
    ),
    a(
      "independent",
      STIM,
      "confirms_occurrence",
      "Stimson's independent review describes the 7 May strikes on nine sites, including the deep strikes at Muridke and Bahawalpur.",
      "India struck nine sites across Pakistan shortly after midnight"
    ),
  ],
  "EVT-004": [NOT_IN_LIST("Sawai Nala – for Muzaffarabad it names only the Bilal mosque")],
  "EVT-005": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_target",
      "Pakistan said the Bilal mosque in Muzaffarabad was hit by seven impacts and destroyed, with a girl injured. Treating it as India's 'Syedna Bilal camp' is a name match (analytical).",
      "In Muzaffarabad, Bilal mosque was targeted. There were seven impacts"
    ),
  ],
  "EVT-006": [NOT_IN_LIST("Gulpur – for Kotli it names only the Abbas mosque")],
  "EVT-007": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_target",
      "Pakistan said the Abbas mosque in Kotli was hit by five impacts and two people were killed, including a 16-year-old girl.",
      "In Kotli, Abbat Mosque was targeted. There were five impacts"
    ),
  ],
  "EVT-008": [NOT_IN_LIST("Barnala / Bhimber")],
  "EVT-009": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_damage",
      "Pakistan said there were two strikes near Shakargarh with no damage except minor damage to a dispensary – consistent in place with India's claim of a facility in a health centre.",
      "There was minor damage to a dispensary",
      "DG ISPR site list"
    ),
  ],
  "EVT-010": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_damage",
      "Pakistan said two strikes hit Kotki Lohara village in Sialkot district – one missile misfired, one fell in an open field, no damage. The village differs from the media-reported site, so the match with Mehmoona Joya is uncertain.",
      "In Sialkot district, in the village of Kotki Lohara, there were two strikes"
    ),
  ],
  "EVT-011": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_target",
      "Pakistan said the Umm-ul-Qura mosque at Muridke took four strikes and was destroyed; one man killed, one injured, two missing.",
      "In Muridke, Umalkura Mosque was targeted and there were four strikes"
    ),
    a(
      "independent",
      AJM,
      "confirms_damage",
      "Al Jazeera's reporter at the compound hours later found the administrative block and the mosque struck, with a collapsed roof section; three clerical staff were killed. The compound was founded by Hafiz Saeed (JuD, widely seen as an LeT front).",
      "Two gaping holes in the ceiling marked the spots where missiles had struck.",
      "On-site report"
    ),
  ],
  "EVT-012": [
    a(
      "pakistan_official",
      PAK7,
      "disputes_target",
      "Pakistan said the Subhan mosque in Ahmedpur East (Bahawalpur) took four strikes and was destroyed; five killed, including a three-year-old girl, and 31 injured. India names the site Markaz Subhan Allah, Bahawalpur.",
      "five innocent Pakistanis were slain, including a three-year-old girl"
    ),
    a(
      "independent",
      STIM,
      "confirms_occurrence",
      "Stimson's review notes the strikes deep in Pakistani Punjab at Muridke and Bahawalpur as a deliberate political signal.",
      "strikes deeper into Pakistan at Muridke and Bahawalpur"
    ),
  ],
  "EVT-015": [
    a("pakistan_official", STIM, "denies", "Pakistan publicly denied launching drone attacks on India on the night of 7–8 May (as reported by Stimson)."),
    a(
      "independent",
      STIM,
      "confirms_occurrence",
      "Stimson treats the drone attacks as having occurred and finds the evidence, including satellite imagery, supports India's claim that they largely failed with minimal damage.",
      "The bulk of the evidence, including satellite imagery, supports that claim."
    ),
  ],
  "EVT-017": [
    a(
      "independent",
      STIM,
      "confirms_occurrence",
      "Stimson finds overwhelming evidence of the Lahore strike from videos and recovered debris, reportedly from Harpy/Harop loitering munitions.",
      "There is overwhelming evidence—videos and subsequent debris—of this attack taking place."
    ),
    a(
      "pakistan_official",
      STIM,
      "confirms_damage",
      "Pakistan said the attack injured four soldiers and caused 'partial damage' to equipment (as reported by Stimson)."
    ),
  ],
  "EVT-027": [
    a(
      "pakistan_official",
      PAK13,
      "confirms_occurrence",
      "Pakistan describes its own retaliatory strikes on India as Operation Bunyanum Marsoos.",
      "delivering precise and notch-up retributive strikes through Operation Bunyanum Marsoos"
    ),
  ],
  "EVT-029": [
    a(
      "independent",
      STIM,
      "no_evidence_found",
      "Stimson found no commercial imagery showing meaningful damage at Indian facilities; a building at Udhampur may show damage but the imagery is ambiguous. Consistent with India's 'limited damage' acknowledgement."
    ),
  ],
  "EVT-031": [PAK_AIRBASES, STIM_AIRBASE_NO_IMAGERY],
  "EVT-032": [PAK_AIRBASES],
  "EVT-033": [
    PAK_AIRBASES,
    a(
      "independent",
      STIM,
      "confirms_occurrence",
      "Stimson places the Nur Khan strike at about 02:30 Pakistan time; the blasts woke residents in Islamabad.",
      "Around 2:30 am Pakistan time, India struck the Nur Khan airbase"
    ),
    a(
      "independent",
      "SRC-IND-WAPO",
      "confirms_damage",
      "The Washington Post's imagery analysis found damage at six airfields (headline finding only; article not read)."
    ),
  ],
  "EVT-034": [STIM_RUNWAYS],
  "EVT-035": [STIM_HANGARS],
  "EVT-036": [STIM_AIRBASE_NO_IMAGERY],
  "EVT-037": [STIM_AIRBASE_NO_IMAGERY],
  "EVT-040": [{ ...STIM_RUNWAYS, summary: STIM_RUNWAYS.summary + " Imagery of 11 May shows repairs under way at Sargodha." }],
  "EVT-041": [STIM_HANGARS],
  "EVT-042": [
    STIM_HANGARS,
    a(
      "pakistan_official",
      PAK13,
      "concedes",
      "Pakistan's list of personnel killed includes Squadron Leader Usman Yousuf, whom PIB names as killed at Bholari; Pakistan does not state where he died.",
      "Squadron Leader Usman Yousuf"
    ),
  ],
  "EVT-046": [
    a(
      "independent",
      STIM,
      "no_evidence_found",
      "Stimson found no imagery showing meaningful damage at Indian facilities, and notes Pakistan's claim of destroying an S-400 element at Adampur – supporting India's rejection."
    ),
  ],
  "EVT-051": [
    a(
      "pakistan_official",
      PAK13,
      "disputes_target",
      "Pakistan says those killed on 6–7 May were 40 civilians, including 7 women and 15 children – not terrorists."
    ),
    a(
      "pakistan_official",
      PAK13,
      "claims_other",
      "Pakistan's own figure for its armed forces is 11 personnel killed over the conflict, against the 35–40 military fatalities India's DGMO cited."
    ),
  ],
  "EVT-055": [
    a(
      "indian_official",
      "SRC-IND-AJ-CDS",
      "concedes",
      "India's Chief of Defence Staff acknowledged initial aerial losses on the first day without giving a number, and called Pakistan's figure of five 'absolutely incorrect'.",
      "suffered initial losses in the air during a recent military conflict"
    ),
    a(
      "pakistan_official",
      PAK7,
      "claims_other",
      "Pakistan claimed five Indian jets were shot down on 7 May.",
      "Pakistani military has brought down five Indian jets"
    ),
    a(
      "indian_official",
      "SRC-IND-AJ-IAF",
      "claims_other",
      "India's air chief later claimed five Pakistani fighters and one large aircraft were shot down during May, mostly by the S-400.",
      "India shot down five Pakistani fighter jets and one other military aircraft"
    ),
    a(
      "indian_official",
      "SRC-MED-PTI-0511",
      "concedes",
      "At the 11 May briefing the Director General of Air Operations acknowledged losses without detail and said all pilots were back home.",
      "Losses are a part of combat.",
      "DGAO Air Marshal AK Bharti, 11 May (PTI)"
    ),
    a(
      "indian_official",
      "SRC-MED-PTI-0511",
      "claims_other",
      "The same briefing claimed 'a few' Pakistani planes were downed, without a number or wreckage.",
      "definitely we have downed a few planes",
      "DGAO Air Marshal AK Bharti, 11 May (PTI)"
    ),
    a("pakistan_official", "SRC-IND-AJ-IAF", "denies", "Pakistan has denied that India downed any Pakistani aircraft (as reported by Al Jazeera)."),
  ],
};

export const UPGRADES = [
  "EVT-003",
  "EVT-005",
  "EVT-007",
  "EVT-009",
  "EVT-010",
  "EVT-011",
  "EVT-012",
  "EVT-015",
  "EVT-017",
  "EVT-027",
  "EVT-031",
  "EVT-032",
  "EVT-033",
  "EVT-034",
  "EVT-035",
  "EVT-040",
  "EVT-041",
  "EVT-042",
  "EVT-055",
];
