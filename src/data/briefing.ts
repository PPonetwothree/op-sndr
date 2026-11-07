// Guided briefing script. Narration paraphrases the cited sources (no new facts); each step
// selects an event, frames the map and lists the sources it rests on. Caveats flag what is
// claimed rather than established.

export interface BriefingStep {
  id: string;
  chapter: string;
  title: string;
  eventId: string;
  view: { center: [number, number]; zoom: number };
  narration: string;
  caveat?: string;
  sources: string[];
}

export const BRIEFING: BriefingStep[] = [
  {
    id: "b01",
    chapter: "Prelude · 22–23 April",
    title: "The trigger: Pahalgam",
    eventId: "EVT-001",
    view: { center: [34.0, 75.2], zoom: 7 },
    narration:
      "On 22 April 2025, 26 people – 25 Indians and one Nepali national – were killed in an attack on tourists near Pahalgam. The Resistance Front claimed it; India describes TRF as a front for Lashkar-e-Taiba. The UN Security Council condemned the attack on 25 April.",
    caveat: "The attack itself is independently established (GREEN). Its attribution is the Indian government's position.",
    sources: ["SRC-MEA-0507", "SRC-UNSC-0425"],
  },
  {
    id: "b02",
    chapter: "Prelude · 22–23 April",
    title: "Non-military measures",
    eventId: "EVT-002",
    view: { center: [29.5, 73.5], zoom: 5 },
    narration:
      "The next day the Cabinet Committee on Security put the Indus Waters Treaty in abeyance, closed the Attari crossing, cancelled SAARC visa exemptions for Pakistani nationals, expelled Pakistan's defence advisers and cut High Commission strength from 55 to 30. Two weeks passed before any military action.",
    sources: ["SRC-MEA-0423", "SRC-PIB-0514A"],
  },
  {
    id: "b03",
    chapter: "7 May · Counter-terror strikes",
    title: "Operation Sindoor opens: 01:05–01:30 IST",
    eventId: "EVT-003",
    view: { center: [32.0, 73.2], zoom: 6 },
    narration:
      "Between 01:05 and 01:30 IST, nine sites described as terrorist infrastructure in Pakistan and PoJK were struck. India called the action focused, measured and non-escalatory, stating that no Pakistani military facility was targeted. A later PIB backgrounder names Rafale jets with SCALP missiles and HAMMER bombs.",
    caveat: "Package composition, routing and weapon-to-target pairing were not disclosed; the map shows abstract formations and illustrative vectors only.",
    sources: ["SRC-MEA-0507", "SRC-PIB-0507", "SRC-PIB-0514A"],
  },
  {
    id: "b04",
    chapter: "7 May · Counter-terror strikes",
    title: "Camps across the Line of Control",
    eventId: "EVT-004",
    view: { center: [33.8, 73.9], zoom: 8 },
    narration:
      "Five of the nine sites lay in PoJK: Sawai Nala and Syedna Bilal near Muzaffarabad, Gulpur and Abbas near Kotli, and Barnala near Bhimber. Briefers gave their distances from the LoC – from about 9 km (Barnala) to 30 km (Sawai Nala, Gulpur) – and linked them to earlier attacks in Jammu and Kashmir.",
    caveat: "Positions are village or town level. Dashed rings show plotting uncertainty; dotted lines compare stated and measured distances.",
    sources: ["SRC-MEA-0507"],
  },
  {
    id: "b05",
    chapter: "7 May · Counter-terror strikes",
    title: "Deep targets: Muridke and Bahawalpur",
    eventId: "EVT-012",
    view: { center: [30.6, 73.2], zoom: 6.5 },
    narration:
      "Four sites were inside Pakistan's Punjab. The deepest, Markaz Subhan Allah in Bahawalpur, was described as Jaish-e-Mohammed's headquarters, about 100 km from the International Border; Markaz Taiba at Muridke was linked to the 2008 Mumbai attackers' training.",
    caveat: "“Successfully destroyed” is a government claim; no independent damage assessment is held in this database.",
    sources: ["SRC-MEA-0507", "SRC-MEA-0509"],
  },
  {
    id: "b06",
    chapter: "7 May · Counter-terror strikes",
    title: "Shelling across the LoC",
    eventId: "EVT-014",
    view: { center: [33.8, 74.2], zoom: 8 },
    narration:
      "Pakistan intensified mortar and artillery fire across the LoC from Kupwara to Rajouri. By 8 May India reported 16 civilians killed, including three women and five children. In Poonch, a shell killed two students near Christ School and a Gurdwara was hit.",
    sources: ["SRC-PIB-0508", "SRC-MEA-0508", "SRC-MEA-0509"],
  },
  {
    id: "b07",
    chapter: "7–8 May · Drones, missiles and air defence",
    title: "First retaliation: 15 locations",
    eventId: "EVT-015",
    view: { center: [29.5, 73.5], zoom: 5.5 },
    narration:
      "From 20:30 IST on 7 May, Pakistan attempted to engage military targets at 15 locations from Awantipura to Bhuj with drones and missiles. India states these were neutralised by the Integrated Counter-UAS Grid and air-defence systems, with debris recovered at several sites.",
    caveat: "Interception is an official account; no engagement-level data has been published.",
    sources: ["SRC-PIB-0508", "SRC-MEA-0509"],
  },
  {
    id: "b08",
    chapter: "7–8 May · Drones, missiles and air defence",
    title: "Same domain, same intensity: Lahore",
    eventId: "EVT-017",
    view: { center: [31.6, 74.5], zoom: 7.5 },
    narration:
      "On the morning of 8 May, India struck air-defence radars and systems at several locations in Pakistan – described as a response in the same domain and with the same intensity. An air-defence system at Lahore was reported neutralised. This was the first Indian strike on Pakistani military assets.",
    caveat: "Only Lahore was named; the system type was not stated.",
    sources: ["SRC-PIB-0508"],
  },
  {
    id: "b09",
    chapter: "8–9 May · The drone war",
    title: "300–400 drones from Leh to Sir Creek",
    eventId: "EVT-018",
    view: { center: [29.0, 72.5], zoom: 5 },
    narration:
      "On the night of 8–9 May, drone intrusions were attempted at 36 locations along the whole western front. India assessed them as probing air defences and gathering intelligence; preliminary forensics pointed to Turkish Asisguard Songar drones. Some were brought down by kinetic and non-kinetic means.",
    caveat: "The 36 locations were not published – the map spreads illustrative arrows along the LoC and IB.",
    sources: ["SRC-MEA-0509"],
  },
  {
    id: "b10",
    chapter: "8–9 May · The drone war",
    title: "Bathinda and the AD sites",
    eventId: "EVT-020",
    view: { center: [30.6, 74.6], zoom: 7 },
    narration:
      "Later that night an armed Pakistani UAV aimed at Bathinda military station was detected and neutralised. In response, India launched armed drones at four Pakistani air-defence sites; one destroyed an AD radar. Those four sites were not named and are not plotted.",
    sources: ["SRC-MEA-0509"],
  },
  {
    id: "b11",
    chapter: "9–10 May · Air bases",
    title: "Multi-vector attacks on Indian bases",
    eventId: "EVT-027",
    view: { center: [30.0, 74.0], zoom: 5.5 },
    narration:
      "On the night of 9–10 May Pakistan used UCAVs, drones, long-range weapons, loitering munitions and fighter aircraft against more than 26 locations from Srinagar to Naliya, and high-speed missile attacks were reported at air bases in Punjab after 01:40. India acknowledged limited damage to equipment and personnel at Udhampur, Pathankot, Adampur and Bhuj.",
    sources: ["SRC-MEA-0510A"],
  },
  {
    id: "b12",
    chapter: "9–10 May · Air bases",
    title: "India strikes Pakistani air bases",
    eventId: "EVT-033",
    view: { center: [30.5, 71.5], zoom: 5.5 },
    narration:
      "India then engaged military targets at Rafiqui, Murid, Chaklala (Nur Khan), Rahim Yar Khan, Sukkur and Chunian with air-launched precision weapons, and radar sites at Pasrur and Sialkot. The evening briefing added extensive damage claims at Skardu, Sargodha, Jacobabad and Bholari – the peak of the escalation ladder.",
    caveat: "Damage levels at most air bases were not stated; strike times for the later four were not given.",
    sources: ["SRC-MEA-0510A", "SRC-MEA-0510C", "SRC-PIB-0518"],
  },
  {
    id: "b13",
    chapter: "9–10 May · Air bases",
    title: "The information battle",
    eventId: "EVT-046",
    view: { center: [30.4, 75.0], zoom: 6.5 },
    narration:
      "India rejected Pakistani claims of destroying an S-400 at Adampur, airfields at Sirsa and Suratgarh and a BrahMos base, showing time-stamped imagery of intact runways. Both sides' claims about the other's losses remain largely unverified.",
    caveat: "Rejected adversary claims are recorded as GREY (disputed), not deleted.",
    sources: ["SRC-MEA-0510A", "SRC-MEA-0510C"],
  },
  {
    id: "b14",
    chapter: "10 May · Cessation",
    title: "The DGMO call: 15:35 → 17:00 IST",
    eventId: "EVT-048",
    view: { center: [29.5, 73.5], zoom: 5 },
    narration:
      "At 15:35 IST Pakistan's DGMO called his Indian counterpart. Both sides agreed to stop all firing and military action on land, in the air and at sea from 17:00 IST, with further DGMO talks set for 12 May.",
    sources: ["SRC-MEA-0510B"],
  },
  {
    id: "b15",
    chapter: "10 May · Cessation",
    title: "A tested understanding",
    eventId: "EVT-050",
    view: { center: [32.8, 74.8], zoom: 6.5 },
    narration:
      "Within hours India reported repeated violations, and drones were intercepted over civilian and military areas. The armed forces were told to respond strongly to any repetition.",
    sources: ["SRC-MEA-0510D", "SRC-PIB-0514A"],
  },
  {
    id: "b16",
    chapter: "Aftermath · 11–12 May",
    title: "Outcome claims – and what remains open",
    eventId: "EVT-051",
    view: { center: [29.5, 73.5], zoom: 5 },
    narration:
      "Indian officials later said over 100 terrorists were killed and named high-value individuals; the Prime Minister set out a doctrine that future terror attacks would get a fitting reply. Almost all of this record rests on Indian official accounts: damage extent, casualty figures and engagement details still lack independent corroboration – see the After-Action Review and Methods.",
    sources: ["SRC-PIB-0514A", "SRC-MEA-PM0512"],
  },
];
