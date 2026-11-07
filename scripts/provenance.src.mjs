// Field-level provenance: which source supports which field of an event, where in the source,
// and a short verbatim excerpt (≤ 30 words). Official Indian government statements only, except
// where marked. Hindi excerpts are followed by an English gloss in `note`.
//
// Fields: time | location | description | casualties | damage | weapons | formation | attribution

const MEA7 = "SRC-MEA-0507";
const PIB8 = "SRC-PIB-0508";
const MEA8 = "SRC-MEA-0508";
const MEA9 = "SRC-MEA-0509";
const MEA10A = "SRC-MEA-0510A";
const MEA10B = "SRC-MEA-0510B";
const MEA10C = "SRC-MEA-0510C";
const MEA10D = "SRC-MEA-0510D";
const PIB14A = "SRC-PIB-0514A";
const PIB14B = "SRC-PIB-0514B";
const PIB18 = "SRC-PIB-0518";

const c = (field, sourceId, locator, excerpt, note) => ({ field, sourceId, locator, excerpt, ...(note ? { note } : {}) });

const QURESHI = "Col Sofiya Qureshi (Hindi), camp-by-camp listing";
const SINGH7 = "Wg Cdr Vyomika Singh, closing remarks";
const STRIKE_DAMAGE = c("damage", MEA7, "Wg Cdr Vyomika Singh, opening remarks", "Nine terrorist camps were targeted and successfully destroyed.");
const STRIKE_PRECISION = c("description", MEA7, SINGH7, "The point of impact at each of the target was a specific building or a group of buildings.");
const STRIKE_WINDOW = c(
  "time",
  MEA7,
  "Col Sofiya Qureshi (Hindi), opening",
  "6 से 7 मई 2025 की रात एक बजकर पाँच मिनट से डेढ़ बजे के बीच",
  "Gloss: between 01:05 and 01:30 on the night of 6–7 May 2025. Per-site times not given."
);
const BASES_10 = c(
  "description",
  MEA10A,
  "Wg Cdr Vyomika Singh",
  "Pakistan military targets at Rafiqui, Murid, Chaklala, Rahim Yar Khan, Sukkur and Chunian were engaged using air-launched precision weapons"
);
const RADAR_10 = c(
  "description",
  MEA10A,
  "Wg Cdr Vyomika Singh",
  "Radar sites at Pasrur and Sialkot aviation base were also targeted using precision munitions."
);
const BASES_DAMAGE = c(
  "damage",
  MEA10C,
  "Wg Cdr Vyomika Singh, evening MoD briefing",
  "extensive damage to the crucial Pakistani airbases like Skardu in Pakistan occupied Jammu and Kashmir, Sargodha, Jacobabad and Bholari"
);

export const PROVENANCE = {
  "EVT-001": [
    c("casualties", MEA7, "Foreign Secretary Vikram Misri, opening statement", "They murdered 26 people, including one national of Nepal"),
    c(
      "attribution",
      MEA7,
      "Foreign Secretary, opening statement",
      "A group calling itself The Resistance Front (TRF) has claimed responsibility for the attack."
    ),
    c(
      "description",
      "SRC-UNSC-0425",
      "UNSC press statement of 25 Apr 2025, as quoted by the Foreign Secretary",
      "The need to hold perpetrators, organisers, financiers and sponsors of this reprehensible act of terrorism accountable",
      "Independent body; confirms the attack occurred, not its attribution."
    ),
  ],
  "EVT-002": [
    c("description", PIB14A, "Non-Military Measures section", "The Indus Waters Treaty of 1960 will be held in abeyance with immediate effect"),
    c("description", PIB14A, "Non-Military Measures section", "The overall strength of the High Commissions will be brought down to 30 from the present 55"),
  ],
  "EVT-003": [
    STRIKE_WINDOW,
    c("description", MEA7, "Foreign Secretary, opening statement", "These actions were measured, non-escalatory, proportionate, and responsible."),
    c("weapons", PIB14A, "What Operation SINDOOR Achieved", "completing the mission in just 23 minutes using Rafale jets, SCALP missiles, and HAMMER bombs"),
    STRIKE_DAMAGE,
  ],
  "EVT-004": [
    STRIKE_WINDOW,
    c(
      "location",
      MEA7,
      QURESHI,
      "सवाई नाला कैंप मुज़फ़्फ़राबाद जो कि POJK के लाइन ऑफ़ कंट्रोल से 30 किलोमीटर दूर है",
      "Gloss: Sawai Nala camp, Muzaffarabad, 30 km from the LoC."
    ),
    STRIKE_PRECISION,
    STRIKE_DAMAGE,
  ],
  "EVT-005": [
    STRIKE_WINDOW,
    c(
      "location",
      MEA7,
      QURESHI,
      "सैयदाना बिलाल कैंप, मुज़फ़्फ़राबाद। यह एक जैश-ए-मोहम्मद का स्टेजिंग एरिया है।",
      "Gloss: Syedna Bilal camp, Muzaffarabad – a JeM staging area."
    ),
    STRIKE_DAMAGE,
  ],
  "EVT-006": [
    STRIKE_WINDOW,
    c("location", MEA7, QURESHI, "गुलपुर कैंप, कोटली। यह LoC से 30 किलोमीटर दूर था", "Gloss: Gulpur camp, Kotli – 30 km from the LoC."),
    c(
      "location",
      "SRC-OSM-GEOCODE",
      "OpenStreetMap node 2816160080",
      "گل پور, تحصیل کوٹلی",
      "Gazetteer position of Gulpur town (village-level, not the facility)."
    ),
    STRIKE_DAMAGE,
  ],
  "EVT-007": [
    STRIKE_WINDOW,
    c("location", MEA7, QURESHI, "अब्बास कैंप, कोटली। यह LoC से 13 किलोमीटर दूर है", "Gloss: Abbas camp, Kotli – 13 km from the LoC."),
    STRIKE_DAMAGE,
  ],
  "EVT-008": [
    STRIKE_WINDOW,
    c("location", MEA7, QURESHI, "बरनाला कैंप, बिंबर्ग। यह एलओसी से 9 किलोमीटर दूर है", "Gloss: Barnala camp, Bhimber – 9 km from the LoC."),
    STRIKE_DAMAGE,
  ],
  "EVT-009": [
    STRIKE_WINDOW,
    c("location", MEA7, QURESHI, "सरजाल कैंप, सियालकोट। ये अंतरराष्ट्रीय सीमा से 6 किलोमीटर की दूरी पर है", "Gloss: Sarjal camp, Sialkot – 6 km from the IB."),
    c(
      "location",
      "SRC-MEDIA-PRINT-SARJAL",
      "Lead paragraph (verified against live article, 8 Nov 2026)",
      "concealed in a primary health centre in Tehra Kalan village in Sarjal",
      "Media report (AMBER)."
    ),
    STRIKE_DAMAGE,
  ],
  "EVT-010": [
    STRIKE_WINDOW,
    c(
      "location",
      MEA7,
      QURESHI,
      "महमूना जाया कैंप, सियालकोट। यह 12 से 18 किलोमीटर IB से दूर था।",
      "Gloss: Mehmoona Joya camp, Sialkot – 12 to 18 km from the IB."
    ),
    c(
      "location",
      "SRC-MEDIA-OB-9CAMPS",
      "Camp list, Mehmoona Joya entry",
      "situated within the premises of the Bhutta Kotli Government Basic Health Unit",
      "Media report (AMBER)."
    ),
    STRIKE_DAMAGE,
  ],
  "EVT-011": [
    STRIKE_WINDOW,
    c(
      "location",
      MEA7,
      QURESHI,
      "मरकज़ तैय्यबा, मुरिदके। यह अंतरराष्ट्रीय सीमा से 18 से 25 किलोमीटर दूरी पर है।",
      "Gloss: Markaz Taiba, Muridke – 18 to 25 km from the IB."
    ),
    STRIKE_DAMAGE,
  ],
  "EVT-012": [
    STRIKE_WINDOW,
    c(
      "location",
      MEA7,
      QURESHI,
      "मरकज़ सुब्हानअल्लाह, बहावलपुर। यह इंटरनेशनल बाउंड्री से 100 किलोमीटर दूर है।",
      "Gloss: Markaz Subhan Allah, Bahawalpur – 100 km from the IB."
    ),
    c(
      "attribution",
      MEA9,
      "Foreign Secretary, answer to Bloomberg",
      "Bahawalpur is the headquarters of the Jaish-e-Mohammad terrorist group that is proscribed by the United Nations."
    ),
    STRIKE_PRECISION,
    STRIKE_DAMAGE,
  ],
  "EVT-013": [
    c("description", MEA9, "Foreign Secretary, answer to Times Now", "a shell fired from Pakistan landed just behind the Christ School"),
    c("casualties", MEA9, "Foreign Secretary, answer to Times Now", "Both students unfortunately lost their lives and their parents were severely injured."),
    c("time", MEA9, "Foreign Secretary, answer to Times Now", "During heavy shelling across the Line of Control in the early morning of 7th May"),
  ],
  "EVT-014": [
    c("location", PIB8, "Paragraph 4", "Kupwara, Baramulla, Uri, Poonch, Mendhar and Rajouri sectors in Jammu and Kashmir"),
    c("casualties", PIB8, "Paragraph 5", "Sixteen innocent lives have been lost, including three women and five children, due to Pakistani firing."),
    c(
      "casualties",
      MEA8,
      "Wg Cdr Vyomika Singh (via search excerpt)",
      "a total of 16 civilians have been killed, and 59 others have been injured",
      "Injured figure from the 8 May briefing; transcript read only in part."
    ),
  ],
  "EVT-015": [
    c("time", MEA9, "Wg Cdr Vyomika Singh", "a failed unprovoked drone and missile attack on 7th May at 0830 hours in the evening"),
    c("location", PIB8, "Paragraph 2", "Pakistan attempted to engage a number of military targets in Northern and Western India"),
    c("damage", PIB8, "Paragraph 2", "These were neutralised by the Integrated Counter UAS Grid and Air Defence systems."),
  ],
  "EVT-016": [
    c("description", PIB8, "Paragraph 2", "These were neutralised by the Integrated Counter UAS Grid and Air Defence systems."),
    c(
      "weapons",
      PIB14B,
      "Air Defence Capabilities",
      "The Integrated Air Command and Control System (IACCS) of the Indian Air Force brought all these elements together"
    ),
  ],
  "EVT-017": [
    c("description", PIB8, "Paragraph 3", "Today morning Indian Armed Forces targeted Air Defence Radars and systems at a number of locations in Pakistan."),
    c("damage", PIB8, "Paragraph 3", "It has been reliably learnt that an Air Defence system at Lahore has been neutralised."),
  ],
  "EVT-018": [
    c(
      "description",
      MEA9,
      "Wg Cdr Vyomika Singh",
      "drone intrusions were attempted from Leh to Sir Creek at 36 locations with approximately 300 to 400 drones"
    ),
    c("weapons", MEA9, "Wg Cdr Vyomika Singh", "Preliminary reports suggest them to be of ASISGUARD SONGAR drone of Turkey."),
  ],
  "EVT-019": [c("description", MEA9, "Wg Cdr Vyomika Singh", "Indian Armed Forces brought down a number of these drones using kinetic and non-kinetic means.")],
  "EVT-020": [
    c(
      "description",
      MEA9,
      "Wg Cdr Vyomika Singh",
      "an armed UAV of Pakistan attempted to target Bathinda military station, which was detected and neutralized."
    ),
  ],
  "EVT-021": [
    c("description", MEA9, "Wg Cdr Vyomika Singh", "armed drones were launched at four air defence sites in Pakistan."),
    c("damage", MEA9, "Wg Cdr Vyomika Singh", "One of the drones was able to destroy an AD radar."),
  ],
  "EVT-022": [
    c("location", MEA9, "Wg Cdr Vyomika Singh", "Tangdhar, Uri, Poonch, Mendhar, Rajouri, Akhnoor and Udhampur in J&K area"),
    c("casualties", MEA9, "Wg Cdr Vyomika Singh", "which resulted in some losses and injuries to Indian Army personnel."),
    c("damage", MEA9, "Wg Cdr Vyomika Singh", "Pakistan Army also suffered major losses in Indian retaliatory fire."),
  ],
  "EVT-023": [
    c(
      "description",
      MEA9,
      "Wg Cdr Vyomika Singh",
      "Pakistan did not close its civil airspace despite it launching a failed unprovoked drone and missile attack"
    ),
  ],
  "EVT-024": [
    c(
      "description",
      MEA9,
      "Foreign Secretary, closing points",
      "India targeting the Nankana Sahib Gurdwara through a drone attack. This is again yet another blatant lie"
    ),
  ],
  "EVT-025": [
    c("casualties", PIB18, "Introduction, BSF paragraph", "the BSF successfully neutralized at least two infiltrators"),
    c("location", PIB18, "Introduction, BSF paragraph", "a major infiltration attempt along the International Border in the Samba district"),
  ],
  "EVT-026": [
    c(
      "formation",
      PIB18,
      "Introduction, Navy paragraph",
      "the Navy deployed its Carrier Battle Group (CBG) equipped with MiG-29K fighter jets and airborne early warning helicopters"
    ),
  ],
  "EVT-027": [
    c("weapons", MEA10A, "Wg Cdr Vyomika Singh", "Pakistan employed UCAV, drones, long-range weapons, loitering munitions and fighter aircrafts"),
    c("location", MEA10A, "Wg Cdr Vyomika Singh", "from Srinagar till Naliya at more than 26 locations."),
  ],
  "EVT-028": [
    c(
      "time",
      MEA10A,
      "Wg Cdr Vyomika Singh",
      "several high-speed missile attacks noticed subsequently after 0140 hours in the night at several air bases in Punjab."
    ),
  ],
  "EVT-029": [
    c(
      "damage",
      MEA10A,
      "Wg Cdr Vyomika Singh",
      "limited damage was sustained to equipment and personnel at Indian Air Force stations at Udhampur, Pathankot, Adampur and Bhuj."
    ),
  ],
  "EVT-030": [
    c("description", MEA10A, "Wg Cdr Vyomika Singh", "attacked the medicare centre and school premises at the air bases of Srinagar, Awantipora and Udhampur"),
  ],
  "EVT-031": [BASES_10],
  "EVT-032": [BASES_10],
  "EVT-033": [
    BASES_10,
    c(
      "damage",
      PIB18,
      "Introduction, IAF paragraph",
      "Nur Khan Air Base and the Rahimyar Khan Air Base, with visual evidence of damage presented during official briefings"
    ),
  ],
  "EVT-034": [
    BASES_10,
    c(
      "damage",
      PIB18,
      "Introduction, IAF paragraph",
      "Nur Khan Air Base and the Rahimyar Khan Air Base, with visual evidence of damage presented during official briefings"
    ),
  ],
  "EVT-035": [BASES_10],
  "EVT-036": [BASES_10],
  "EVT-037": [RADAR_10],
  "EVT-038": [RADAR_10],
  "EVT-039": [BASES_DAMAGE],
  "EVT-040": [BASES_DAMAGE],
  "EVT-041": [BASES_DAMAGE],
  "EVT-042": [BASES_DAMAGE, c("casualties", PIB14A, "What Operation SINDOOR Achieved", "High casualties were inflicted at Bhoolari Airbase")],
  "EVT-043": [
    c(
      "casualties",
      MEA10A,
      "Foreign Secretary, closing points",
      "Pakistan shelled the town of Rajouri, killing the Additional District Development Commissioner Shri Raj Kumar Thapa"
    ),
  ],
  "EVT-044": [
    c("damage", MEA10A, "Foreign Secretary, closing points", "damage to property and injuries to civilians in Ferozepur and Jalandhar, among other places."),
  ],
  "EVT-045": [
    c(
      "location",
      MEA10A,
      "Wg Cdr Vyomika Singh",
      "Heavy exchange of artillery mortars and small-arm fire in Kupwara, Baramulla, Poonch, Rajouri and Akhnoor sectors continued."
    ),
    c("description", MEA10A, "Wg Cdr Vyomika Singh", "Pak military has been observed to be moving their troops into forward areas"),
  ],
  "EVT-046": [
    c(
      "description",
      MEA10A,
      "Wg Cdr Vyomika Singh",
      "claims of destruction of Indian S-400 system at Adampur, destruction of airfields at Suratgarh and Sirsa"
    ),
    c("damage", MEA10A, "Wg Cdr Vyomika Singh", "India unequivocally rejects these false narratives being spread by Pakistan."),
  ],
  "EVT-047": [c("time", MEA10B, "Statement, paragraph 1", "called the Director General of Military Operations of India at 1535 hours IST earlier today.")],
  "EVT-048": [
    c(
      "time",
      MEA10B,
      "Statement, paragraph 2",
      "stop all firing and military action on land and in the air and sea with effect from 1700 hours Indian Standard Time today."
    ),
  ],
  "EVT-049": [
    c("description", MEA10C, "Wg Cdr Vyomika Singh", "No religious sites, I repeat, no religious sites have been targeted by the Indian Armed Forces."),
    c("description", MEA10C, "Commodore Raghu R Nair", "whilst we will be adhering to the understanding that has been reached today"),
  ],
  "EVT-050": [
    c("description", MEA10D, "Statement, paragraph 1", "there have been repeated violations of the understanding arrived at earlier this evening"),
    c("description", PIB14A, "Pakistani Response after ceasefire", "Wave of UAVs and small drones intruded into Indian civilian and military areas."),
  ],
  "EVT-051": [
    c("casualties", PIB14A, "What Operation SINDOOR Achieved", "Over 100 terrorists were killed in action."),
    c("description", PIB14A, "What Operation SINDOOR Achieved", "High-value targets eliminated include Yusuf Azhar, Abdul Malik Rauf, Mudassir Ahmad."),
  ],
  "EVT-052": [c("time", MEA10B, "Statement, paragraph 4", "The Director Generals of Military Operations will talk again on the 12th of May at 1200 hours.")],
  "EVT-053": [
    c(
      "description",
      PIB14B,
      "Air Defence Measures of the Indian Army",
      "Counter Unmanned Aerial Systems, Electronic Warfare assets, and Air Defence Weapons from both Army and Air Force"
    ),
    c("weapons", PIB14B, "Evidence of Neutralized Threats", "Pieces of PL-15 missiles (of Chinese origin)"),
  ],
  "EVT-054": [c("description", PIB14A, "PM's address, first point", "if there is a terrorist attack on India, a fitting reply will be given.")],
};

// ── Supplementary citations (weapons / damage / casualty fields) ─────────────
const LEVEL_NOTE = "The 0–5 damage level is this reconstruction's classification of the reported impact, not a figure from the source.";
const add = (id, ...cits) => (PROVENANCE[id] = [...(PROVENANCE[id] ?? []), ...cits]);
add(
  "EVT-013",
  c("weapons", MEA9, "Foreign Secretary, answer to Times Now", "a shell fired from Pakistan landed just behind the Christ School"),
  c("damage", MEA9, "Foreign Secretary, answer to Times Now", "Another Pakistani shell struck a Christian Convent", LEVEL_NOTE)
);
add(
  "EVT-014",
  c("weapons", PIB8, "Paragraph 4", "unprovoked firing across the Line of Control using Mortars and heavy calibre Artillery"),
  c("damage", PIB8, "Paragraph 5", "Sixteen innocent lives have been lost", LEVEL_NOTE)
);
add("EVT-019", c("weapons", MEA9, "Wg Cdr Vyomika Singh", "using kinetic and non-kinetic means."));
add("EVT-020", c("weapons", MEA9, "Wg Cdr Vyomika Singh", "an armed UAV of Pakistan attempted to target Bathinda military station"));
add("EVT-021", c("weapons", MEA9, "Wg Cdr Vyomika Singh", "armed drones were launched at four air defence sites in Pakistan."));
add("EVT-022", c("weapons", MEA9, "Wg Cdr Vyomika Singh", "artillery shelling across the Line of Control using heavy-caliber artillery guns and armed drones"));
add(
  "EVT-026",
  c("weapons", PIB18, "Introduction, Navy paragraph", "Carrier Battle Group (CBG) equipped with MiG-29K fighter jets and airborne early warning helicopters")
);
add(
  "EVT-027",
  c("damage", MEA10A, "Wg Cdr Vyomika Singh", "Indian Armed Forces successfully neutralised these threats and majority of the vectors.", LEVEL_NOTE)
);
add("EVT-028", c("weapons", MEA10A, "Wg Cdr Vyomika Singh", "several high-speed missile attacks"));
add("EVT-030", c("damage", MEA10A, "Wg Cdr Vyomika Singh", "attacked the medicare centre and school premises", LEVEL_NOTE));
add(
  "EVT-043",
  c("weapons", MEA10A, "Foreign Secretary, closing points", "Pakistan shelled the town of Rajouri"),
  c("damage", MEA10A, "Foreign Secretary, closing points", "adding to the civilian casualties and the damage in that state.", LEVEL_NOTE)
);
add("EVT-044", c("casualties", MEA10A, "Foreign Secretary, closing points", "injuries to civilians in Ferozepur and Jalandhar, among other places."));
add(
  "EVT-045",
  c("weapons", MEA10A, "Wg Cdr Vyomika Singh", "Heavy exchange of artillery mortars and small-arm fire"),
  c(
    "damage",
    MEA10A,
    "Wg Cdr Vyomika Singh",
    "Indian Army has responded effectively and proportionately, causing extensive damage to Pakistan Army.",
    LEVEL_NOTE
  )
);
add("EVT-046", c("weapons", MEA10A, "Wg Cdr Vyomika Singh", "destruction of Indian S-400 system at Adampur"));
add(
  "EVT-049",
  c("weapons", MEA10C, "Wg Cdr Vyomika Singh", "our S-400 at a northern base was destroyed, which was completely false, and that it was destroyed by a JF-17")
);
