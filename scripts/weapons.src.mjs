// Authoring source for src/data/weapons.json. Usage status reflects ONLY what retrieved sources say.
// Regenerate with: node scripts/weapons.src.mjs
import { writeFileSync } from "node:fs";

const W = [];
const w = (o) => W.push({ eventIds: [], ...o });

// ── INDIA ──
w({ id: "WPN-RAFALE", name: "Rafale", country: "France", operator: "India", domain: "air", platformCategory: "Multirole fighter aircraft", weaponClass: "Strike platform", force: "Indian Air Force",
  publicRole: "Multirole combat aircraft in IAF service.", usageStatus: "officially_confirmed_used",
  usageNote: "PIB 14 May names 'Rafale jets' for the 7 May mission. Numbers, bases and per-target employment not disclosed.", sources: ["SRC-PIB-0514A"], confidence: "medium" });
w({ id: "WPN-SCALP", name: "SCALP (Storm Shadow family)", country: "France / UK", operator: "India", domain: "air", platformCategory: "Air-launched cruise missile", weaponClass: "Stand-off precision strike", force: "Indian Air Force",
  publicRole: "Long-range air-launched cruise missile.", usageStatus: "officially_confirmed_used",
  usageNote: "Named by PIB 14 May for the 7 May mission. Not attributed to any specific target.", sources: ["SRC-PIB-0514A"], confidence: "medium" });
w({ id: "WPN-HAMMER", name: "HAMMER (AASM)", country: "France", operator: "India", domain: "air", platformCategory: "Precision-guided air-to-surface munition", weaponClass: "Precision strike", force: "Indian Air Force",
  publicRole: "Modular precision-guided bomb/rocket-boosted munition.", usageStatus: "officially_confirmed_used",
  usageNote: "Named by PIB 14 May for the 7 May mission. Not attributed to any specific target.", sources: ["SRC-PIB-0514A"], confidence: "medium" });
w({ id: "WPN-LOITERING-IN", name: "Loitering munitions (Indian, type not named)", country: "India / various", operator: "India", domain: "air", platformCategory: "Loitering munition", weaponClass: "SEAD / precision strike", force: "Indian Army / IAF (not specified)",
  publicRole: "Munitions that loiter over an area to find and strike targets.", usageStatus: "officially_confirmed_used",
  usageNote: "PIB 14 May: used 'to devastating effect', destroying high-value targets including radar and missile systems. Not tied to specific dated events.", sources: ["SRC-PIB-0514B"], confidence: "medium" });
w({ id: "WPN-ARMED-DRONE-IN", name: "Armed drones (Indian, type not named)", country: "Not stated", operator: "India", domain: "air", platformCategory: "Armed UAV / loitering munition", weaponClass: "SEAD", force: "Not specified",
  publicRole: "Unmanned strike against AD sites.", usageStatus: "officially_confirmed_used",
  usageNote: "MEA 9 May: armed drones launched at four Pakistani AD sites; one destroyed an AD radar.", sources: ["SRC-MEA-0509"], confidence: "medium" });
w({ id: "WPN-AKASH", name: "Akash SAM", country: "India", operator: "India", domain: "land", platformCategory: "Surface-to-air missile system", weaponClass: "Short-range air defence", force: "Integrated air-defence assets",
  publicRole: "Short-range SAM protecting vulnerable areas/points; group or autonomous mode; ECCM.", usageStatus: "officially_confirmed_used",
  usageNote: "PIB 14 May / 18 May: used in the layered AD grid; 'stellar performance'. Operation-wide statement, not tied to specific engagements.", sources: ["SRC-PIB-0514B", "SRC-PIB-0518"], confidence: "medium" });
w({ id: "WPN-PECHORA", name: "Pechora (S-125)", country: "USSR / Russia", operator: "India", domain: "land", platformCategory: "Surface-to-air missile system", weaponClass: "Legacy air defence", force: "Indian Air Force",
  publicRole: "Legacy medium/low-altitude SAM.", usageStatus: "officially_confirmed_used", usageNote: "Named as used in PIB 14 May and 18 May. Operation-wide.", sources: ["SRC-PIB-0514B", "SRC-PIB-0518"], confidence: "medium" });
w({ id: "WPN-OSA-AK", name: "OSA-AK (SA-8)", country: "USSR / Russia", operator: "India", domain: "land", platformCategory: "Mobile SAM system", weaponClass: "Legacy air defence", force: "Indian Army AD",
  publicRole: "Mobile short-range SAM.", usageStatus: "officially_confirmed_used", usageNote: "Named as used in PIB 14 May and 18 May. Operation-wide.", sources: ["SRC-PIB-0514B", "SRC-PIB-0518"], confidence: "medium" });
w({ id: "WPN-LLAD", name: "Low-level air-defence (LLAD) guns", country: "Various", operator: "India", domain: "land", platformCategory: "AD gun", weaponClass: "Gun air defence / counter-UAS", force: "Indian Army AD",
  publicRole: "Low-level AD guns against aircraft and drones.", usageStatus: "officially_confirmed_used", usageNote: "Named as used in PIB 14 May and 18 May. Specific gun types not named in retrieved sources.", sources: ["SRC-PIB-0514B", "SRC-PIB-0518"], confidence: "medium" });
w({ id: "WPN-MANPADS", name: "Shoulder-fired MANPADS", country: "Not stated", operator: "India", domain: "land", platformCategory: "Man-portable SAM", weaponClass: "Very short-range air defence", force: "Indian Army AD",
  publicRole: "Shoulder-fired missiles in the inner AD layers.", usageStatus: "officially_named_capability", usageNote: "PIB 18 May lists shoulder-fired MANPADS among Army AD systems deployed. Type not named.", sources: ["SRC-PIB-0518", "SRC-PIB-0514B"], confidence: "medium" });
w({ id: "WPN-LRSAM-IN", name: "Long-range SAMs (type not named)", country: "Not stated", operator: "India", domain: "land", platformCategory: "Surface-to-air missile system", weaponClass: "Long-range air defence", force: "Integrated air-defence assets",
  publicRole: "Upper-tier AD.", usageStatus: "officially_named_capability", usageNote: "PIB 18 May refers to 'long-range SAMs' without naming the system.", sources: ["SRC-PIB-0518"], confidence: "low" });
w({ id: "WPN-S400", name: "S-400 Triumf ('Sudarshan Chakra' in IAF service)", country: "Russia", operator: "India", domain: "land", platformCategory: "Long-range SAM system", weaponClass: "Strategic air defence", force: "Indian Air Force",
  publicRole: "Long-range layered SAM.", usageStatus: "adversary_claim_rejected",
  usageNote: "Retrieved sources mention S-400 only to reject Pakistani claims that one was destroyed at Adampur. Its combat employment is not established in the sources retrieved for this build; later media accounts report statements on its use.", sources: ["SRC-MEA-0510A", "SRC-MEA-0510C"], confidence: "low" });
w({ id: "WPN-BRAHMOS", name: "BrahMos", country: "India / Russia", operator: "India", domain: "multi", platformCategory: "Supersonic cruise missile", weaponClass: "Precision strike", force: "Tri-service",
  publicRole: "Supersonic cruise missile (land, sea, air variants).", usageStatus: "adversary_claim_rejected",
  usageNote: "Retrieved sources mention BrahMos only to reject Pakistani claims that a BrahMos base/installation was destroyed. Its use in strikes is NOT established in retrieved sources; media reports exist.", sources: ["SRC-MEA-0510A", "SRC-MEA-0510C"], confidence: "low" });
w({ id: "WPN-IACCS", name: "Integrated Air Command and Control System (IACCS)", country: "India", operator: "India", domain: "multi", platformCategory: "C2 network", weaponClass: "Air-defence command & control", force: "Indian Air Force",
  publicRole: "Net-centric fusion of sensors and shooters.", usageStatus: "officially_confirmed_used", usageNote: "PIB 14 May / 18 May: brought AD elements together for real-time coordination.", sources: ["SRC-PIB-0514B", "SRC-PIB-0518"], confidence: "medium" });
w({ id: "WPN-AKASHTEER", name: "Akashteer", country: "India", operator: "India", domain: "land", platformCategory: "AD control and reporting system", weaponClass: "Air-defence C2 (Army)", force: "Indian Army AD",
  publicRole: "Automated AD control & reporting for Army AD.", usageStatus: "officially_confirmed_used", usageNote: "PIB 14 May credits the 'indigenous Akashteer system' within the multi-layered AD. Operation-wide; not tied to specific engagements.", sources: ["SRC-PIB-0514A", "SRC-PIB-AKASHTEER"], confidence: "medium" });
w({ id: "WPN-CUAS-GRID", name: "Integrated Counter-UAS Grid", country: "India", operator: "India", domain: "multi", platformCategory: "Counter-UAS network", weaponClass: "Counter-UAS", force: "Counter-UAS assets",
  publicRole: "Layered detection and defeat of drones.", usageStatus: "officially_confirmed_used", usageNote: "PIB 8 May: neutralised attacks on the night of 7–8 May.", sources: ["SRC-PIB-0508", "SRC-PIB-0514B"], confidence: "medium" });
w({ id: "WPN-EW", name: "Electronic-warfare assets (non-kinetic)", country: "Not stated", operator: "India", domain: "cyber_ew", platformCategory: "EW systems", weaponClass: "Electronic attack / counter-UAS", force: "Electronic warfare capabilities",
  publicRole: "Jamming / non-kinetic defeat.", usageStatus: "officially_confirmed_used", usageNote: "MEA 9 May: drones brought down by 'kinetic and non-kinetic means'; PIB 14 May: EW assets in the AD layers, and IAF 'bypassed and jammed' Pakistani AD.", sources: ["SRC-MEA-0509", "SRC-PIB-0514B", "SRC-PIB-0514A"], confidence: "medium" });
w({ id: "WPN-CBG", name: "Carrier Battle Group (MiG-29K, AEW helicopters)", country: "India", operator: "India", domain: "sea", platformCategory: "Carrier battle group", weaponClass: "Maritime air defence / sea control", force: "Indian Navy",
  publicRole: "Maritime surveillance, fleet AD and deterrence.", usageStatus: "officially_named_capability", usageNote: "PIB 18 May: CBG deployed during the operation. Position and composition beyond that not disclosed.", sources: ["SRC-PIB-0518"], confidence: "medium" });

// ── PAKISTAN ──
w({ id: "WPN-SONGAR", name: "Asisguard Songar", country: "Türkiye", operator: "Pakistan", domain: "air", platformCategory: "Armed multirotor UAV", weaponClass: "Small armed drone", force: "UAVs and UCAVs",
  publicRole: "Small armed rotary-wing drone.", usageStatus: "preliminary_identification", usageNote: "MEA 9 May: 'preliminary reports suggest' drone debris to be Songar; forensic examination ongoing.", sources: ["SRC-MEA-0509"], confidence: "low" });
w({ id: "WPN-YIHA", name: "'Yiha' / 'YEEHAW' UAV", country: "Türkiye (as stated)", operator: "Pakistan", domain: "air", platformCategory: "UAV / loitering munition", weaponClass: "Loitering munition", force: "Loitering munitions",
  publicRole: "Turkish-origin UAV.", usageStatus: "debris_recovered_official", usageNote: "PIB 14 May lists recovered and identified pieces of Turkish-origin UAVs named 'Yiha'.", sources: ["SRC-PIB-0514B"], confidence: "medium" });
w({ id: "WPN-PL15", name: "PL-15", country: "China", operator: "Pakistan", domain: "air", platformCategory: "Beyond-visual-range air-to-air missile", weaponClass: "Air-to-air missile", force: "Pakistani Air Force",
  publicRole: "Long-range active-radar AAM.", usageStatus: "debris_recovered_official", usageNote: "PIB 14 May: pieces of PL-15 missiles recovered. Engagement circumstances not described in retrieved sources.", sources: ["SRC-PIB-0514B"], confidence: "medium" });
w({ id: "WPN-PK-LR-ROCKETS", name: "Long-range rockets (type not named)", country: "Not stated", operator: "Pakistan", domain: "land", platformCategory: "Rocket artillery", weaponClass: "Long-range weapon", force: "Missile systems",
  publicRole: "Long-range rocket strike.", usageStatus: "debris_recovered_official", usageNote: "PIB 14 May lists long-range rocket debris; MEA 10 May refers to 'long-range weapons'. Pakistani-named systems (e.g. Fatah series) are not named in retrieved Indian sources.", sources: ["SRC-PIB-0514B", "SRC-MEA-0510A"], confidence: "low" });
w({ id: "WPN-PK-HSM", name: "High-speed missiles (type not named)", country: "Not stated", operator: "Pakistan", domain: "air", platformCategory: "Missile", weaponClass: "Missile system", force: "Missile systems",
  publicRole: "—", usageStatus: "officially_named_capability", usageNote: "MEA 10 May: 'several high-speed missile attacks' after 01:40 at Punjab air bases.", sources: ["SRC-MEA-0510A"], confidence: "low" });
w({ id: "WPN-PK-UCAV", name: "UCAVs / armed UAVs (type not named)", country: "Not stated", operator: "Pakistan", domain: "air", platformCategory: "Armed UAV", weaponClass: "UCAV", force: "UAVs and UCAVs",
  publicRole: "—", usageStatus: "officially_named_capability", usageNote: "MEA 9 and 10 May: armed UAV at Bathinda; UCAVs among threat vectors.", sources: ["SRC-MEA-0509", "SRC-MEA-0510A"], confidence: "medium" });
w({ id: "WPN-PK-LOITERING", name: "Loitering munitions (Pakistani, type not named)", country: "Not stated", operator: "Pakistan", domain: "air", platformCategory: "Loitering munition", weaponClass: "Loitering munition", force: "Loitering munitions",
  publicRole: "—", usageStatus: "officially_named_capability", usageNote: "MEA 10 May lists loitering munitions among threat vectors.", sources: ["SRC-MEA-0510A"], confidence: "medium" });
w({ id: "WPN-PK-FIGHTERS", name: "Fighter aircraft (types not named)", country: "—", operator: "Pakistan", domain: "air", platformCategory: "Combat aircraft", weaponClass: "Strike / air superiority", force: "Pakistani Air Force",
  publicRole: "—", usageStatus: "officially_named_capability", usageNote: "MEA 10 May: Pakistan employed fighter aircraft among threat vectors.", sources: ["SRC-MEA-0510A"], confidence: "medium" });
w({ id: "WPN-JF17", name: "JF-17", country: "China / Pakistan", operator: "Pakistan", domain: "air", platformCategory: "Multirole fighter", weaponClass: "Strike platform", force: "Pakistani Air Force",
  publicRole: "Light multirole fighter.", usageStatus: "adversary_claim_rejected", usageNote: "Named by Indian briefers only in rejecting a Pakistani claim that a JF-17 destroyed an Indian S-400.", sources: ["SRC-MEA-0510C"], confidence: "low" });
w({ id: "WPN-PK-CN-AD", name: "Chinese-supplied air-defence systems (type not named)", country: "China", operator: "Pakistan", domain: "land", platformCategory: "SAM / radar network", weaponClass: "Air defence", force: "Pakistani air-defence systems",
  publicRole: "—", usageStatus: "officially_named_capability", usageNote: "PIB 14 May: IAF 'bypassed and jammed' Pakistan's Chinese-supplied AD systems. Specific systems (e.g. HQ-9) are not named in retrieved sources.", sources: ["SRC-PIB-0514A", "SRC-PIB-0514B"], confidence: "low" });
w({ id: "WPN-PK-ARTY", name: "Heavy-calibre artillery, RT guns and mortars", country: "—", operator: "Pakistan", domain: "land", platformCategory: "Tube artillery / mortar", weaponClass: "Indirect fire", force: "Artillery",
  publicRole: "LoC fire.", usageStatus: "officially_confirmed_used", usageNote: "PIB 8 May, MEA 9 and 10 May describe mortar, heavy-calibre artillery and RT-gun fire across the LoC.", sources: ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A"], confidence: "high" });
w({ id: "WPN-PK-QUAD", name: "Quadcopters and commercial drones", country: "Various", operator: "Pakistan", domain: "air", platformCategory: "Small UAS", weaponClass: "Surveillance / harassment", force: "UAVs and UCAVs",
  publicRole: "—", usageStatus: "debris_recovered_official", usageNote: "PIB 14 May lists quadcopter and commercial-drone debris.", sources: ["SRC-PIB-0514B"], confidence: "medium" });

import { readFileSync } from "node:fs";
const events = JSON.parse(readFileSync("src/data/events.json", "utf8"));
for (const x of W) x.eventIds = events.filter((e) => e.weaponSystemIds.includes(x.id)).map((e) => e.id);
const known = new Set(W.map((x) => x.id));
for (const e of events) for (const wid of e.weaponSystemIds) if (!known.has(wid)) throw new Error(`${e.id} references unknown weapon ${wid}`);
writeFileSync("src/data/weapons.json", JSON.stringify(W, null, 2));
console.log("weapons:", W.length);
