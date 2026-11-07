// Source table for src/data/targets.json. Coordinates are TOWN-LEVEL public gazetteer points,
// NOT reported impact points. Regenerate with: node scripts/targets.src.mjs
import { writeFileSync } from "node:fs";

const T = [];
const add = (o) => T.push({ altNames: [], attribution: null, officialDescription: "", statedDistance: null, ...o });
// Distances stated by Indian briefers (MEA 7 May transcript) – used to draw measured vs stated checks.
const SD = (min, max, from) => ({ km: [min, max], from, sourceId: "SRC-MEA-0507" });
const S07 = ["SRC-MEA-0507"];

// --- 7 May terrorist-infrastructure targets (as named by Indian briefers) ---
add({
  statedDistance: SD(30, 30, "LoC"),
  id: "TGT-SAWAI-NALA",
  name: "Sawai Nala camp",
  country: "PoJK",
  region: "Muzaffarabad",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 34.37,
  lng: 73.47,
  precision: "town",
  attribution: "Lashkar-e-Taiba (as stated by Indian briefers)",
  officialDescription:
    "Stated as ~30 km from LoC; LeT training centre linked by briefers to Sonamarg (Oct 2024), Gulmarg (Oct 2024) and Pahalgam (Apr 2025) attackers.",
  sources: S07,
  evidenceClass: "BLUE",
});
add({
  id: "TGT-SYEDNA-BILAL",
  name: "Syedna Bilal camp",
  country: "PoJK",
  region: "Muzaffarabad",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 34.34,
  lng: 73.52,
  precision: "town",
  attribution: "Jaish-e-Mohammed (as stated)",
  officialDescription: "Stated as a JeM staging area; weapons, explosives and jungle-survival training.",
  sources: S07,
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(30, 30, "LoC"),
  id: "TGT-GULPUR",
  name: "Gulpur camp",
  country: "PoJK",
  region: "Kotli",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 33.437,
  lng: 73.857,
  precision: "town",
  attribution: "Lashkar-e-Taiba (as stated)",
  officialDescription:
    "Stated as ~30 km from LoC; LeT base active in Rajouri–Poonch; linked by briefers to Poonch (Apr 2023) and pilgrim bus attack (Jun 2024). Position: Gulpur town centre (OpenStreetMap); the camp's exact site is not public and may lie outside the town.",
  sources: [...S07, "SRC-OSM-GEOCODE"],
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(13, 13, "LoC"),
  id: "TGT-ABBAS",
  name: "Abbas camp",
  country: "PoJK",
  region: "Kotli",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 33.55,
  lng: 73.86,
  precision: "town",
  attribution: "Lashkar-e-Taiba (as stated)",
  officialDescription: "Stated as ~13 km from LoC; fidayeen preparation; stated capacity ~15 trainees.",
  sources: S07,
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(9, 9, "LoC"),
  id: "TGT-BARNALA",
  name: "Barnala camp",
  country: "PoJK",
  region: "Bhimber",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 32.99,
  lng: 74.1,
  precision: "town",
  attribution: "Not specified in briefing",
  officialDescription: "Stated as ~9 km from LoC; weapons handling, IED and jungle-survival training.",
  sources: S07,
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(6, 6, "IB"),
  id: "TGT-SARJAL",
  name: "Sarjal camp",
  altNames: ["Sarjal / Tehra Kalan"],
  country: "Pakistan",
  region: "Narowal district (Shakargarh / Zafarwal area, opposite Samba–Kathua)",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 32.35,
  lng: 75.123,
  precision: "town",
  attribution: "Not specified in briefing",
  officialDescription:
    "Stated as ~6 km from IB opposite Samba–Kathua; linked by briefers to killing of four J&K Police personnel (Mar 2025). Position: Sarjal village (OpenStreetMap), opposite Samba; media place the facility in Tehra Kalan village health centre, Shakargarh area. Village-level, not the facility.",
  sources: [...S07, "SRC-MEDIA-PRINT-SARJAL", "SRC-OSM-GEOCODE"],
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(12, 18, "IB"),
  id: "TGT-MEHMOONA-JOYA",
  name: "Mehmoona Joya camp",
  country: "Pakistan",
  region: "Sialkot (Head Marala area)",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 32.616,
  lng: 74.513,
  precision: "town",
  attribution: "Hizbul Mujahideen (as stated)",
  officialDescription:
    "Stated as 12–18 km from IB; HM camp described as control centre for Kathua–Jammu; briefers linked it to the Pathankot air base attack. Position: Kotli Bhatta village (OpenStreetMap), Head Marala area; media place the camp in the Bhutta Kotli Basic Health Unit premises. Village-level, not the facility.",
  sources: [...S07, "SRC-MEDIA-OB-9CAMPS", "SRC-OSM-GEOCODE"],
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(18, 25, "IB"),
  id: "TGT-MURIDKE",
  name: "Markaz Taiba, Muridke",
  country: "Pakistan",
  region: "Muridke (Punjab)",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 31.8,
  lng: 74.26,
  precision: "town",
  attribution: "Lashkar-e-Taiba (as stated)",
  officialDescription: "Stated as 18–25 km from IB; briefers linked it to 2008 Mumbai attackers' training.",
  sources: S07,
  evidenceClass: "BLUE",
});
add({
  statedDistance: SD(100, 100, "IB"),
  id: "TGT-BAHAWALPUR",
  name: "Markaz Subhan Allah, Bahawalpur",
  country: "Pakistan",
  region: "Bahawalpur (Punjab)",
  category: "terrorist_infrastructure",
  markerLayer: "targets",
  side: "indian_strike_target",
  lat: 29.39,
  lng: 71.68,
  precision: "town",
  attribution: "Jaish-e-Mohammed HQ (as stated)",
  officialDescription: "Stated as ~100 km from IB; JeM headquarters for training, recruitment and indoctrination.",
  sources: [...S07, "SRC-MEA-0509"],
  evidenceClass: "BLUE",
});

// --- Pakistani air-defence / radar targets ---
add({
  id: "TGT-LAHORE-AD",
  name: "Air-defence system, Lahore",
  country: "Pakistan",
  region: "Lahore",
  category: "air_defence_radar",
  markerLayer: "airDefence",
  side: "indian_strike_target",
  lat: 31.55,
  lng: 74.34,
  precision: "town",
  officialDescription: "'Reliably learnt' that an AD system at Lahore was neutralised (8 May). System type not stated.",
  sources: ["SRC-PIB-0508"],
  evidenceClass: "BLUE",
});
add({
  id: "TGT-GUJRANWALA-RADAR",
  name: "Radar facilities near Gujranwala",
  country: "Pakistan",
  region: "Gujranwala",
  category: "air_defence_radar",
  markerLayer: "airDefence",
  side: "indian_strike_target",
  lat: 32.16,
  lng: 74.19,
  precision: "district",
  officialDescription: "PIB 14 May backgrounder: radar facilities near Gujranwala destroyed. Date of strike not stated.",
  sources: ["SRC-PIB-0514A"],
  evidenceClass: "BLUE",
});
add({
  id: "TGT-PASRUR-RADAR",
  name: "Radar site, Pasrur",
  country: "Pakistan",
  region: "Sialkot district",
  category: "air_defence_radar",
  markerLayer: "airDefence",
  side: "indian_strike_target",
  lat: 32.27,
  lng: 74.66,
  precision: "town",
  officialDescription: "Targeted using precision munitions (10 May).",
  sources: ["SRC-MEA-0510A"],
  evidenceClass: "BLUE",
});
add({
  id: "TGT-SIALKOT-AVN",
  name: "Sialkot aviation base (radar site)",
  country: "Pakistan",
  region: "Sialkot",
  category: "air_defence_radar",
  markerLayer: "airDefence",
  side: "indian_strike_target",
  lat: 32.52,
  lng: 74.55,
  precision: "town",
  officialDescription: "Radar sites at Pasrur and Sialkot aviation base targeted using precision munitions (10 May).",
  sources: ["SRC-MEA-0510A"],
  evidenceClass: "BLUE",
});

// --- Pakistani air bases / military targets, 10 May ---
const base = (id, name, region, country, lat, lng, src, desc) =>
  add({
    id,
    name,
    country,
    region,
    category: "air_base",
    markerLayer: "military",
    side: "indian_strike_target",
    lat,
    lng,
    precision: "town",
    officialDescription: desc,
    sources: src,
    evidenceClass: "BLUE",
  });
const M10 = "Engaged with air-launched precision weapons from fighter aircraft (10 May morning briefing).";
base("TGT-RAFIQUI", "Rafiqui air base", "Shorkot (Punjab)", "Pakistan", 30.76, 72.28, ["SRC-MEA-0510A"], M10);
base("TGT-MURID", "Murid air base", "Chakwal (Punjab)", "Pakistan", 32.97, 72.79, ["SRC-MEA-0510A"], M10);
base(
  "TGT-CHAKLALA",
  "Chaklala / Nur Khan air base",
  "Rawalpindi",
  "Pakistan",
  33.62,
  73.1,
  ["SRC-MEA-0510A", "SRC-PIB-0518"],
  M10 + " PIB 18 May names Nur Khan, with visual evidence of damage presented during official briefings."
);
base(
  "TGT-RAHIM-YAR-KHAN",
  "Rahim Yar Khan air base",
  "Rahim Yar Khan (Punjab)",
  "Pakistan",
  28.4,
  70.28,
  ["SRC-MEA-0510A", "SRC-PIB-0518"],
  M10 + " PIB 18 May names Rahimyar Khan, with visual evidence presented in briefings."
);
base("TGT-SUKKUR", "Sukkur air base", "Sukkur (Sindh)", "Pakistan", 27.72, 68.79, ["SRC-MEA-0510A"], M10);
base(
  "TGT-CHUNIAN",
  "Chunian (military target)",
  "Kasur district (Punjab)",
  "Pakistan",
  30.96,
  73.98,
  ["SRC-MEA-0510A"],
  M10 + " Nature of facility not specified beyond 'military target'."
);
base(
  "TGT-SKARDU",
  "Skardu air base",
  "Skardu (Gilgit-Baltistan)",
  "Gilgit-Baltistan",
  35.34,
  75.54,
  ["SRC-MEA-0510C"],
  "'Extensive damage' claimed in the 10 May evening MoD briefing."
);
base(
  "TGT-SARGODHA",
  "Sargodha air base",
  "Sargodha (Punjab)",
  "Pakistan",
  32.05,
  72.67,
  ["SRC-MEA-0510C"],
  "'Extensive damage' claimed in the 10 May evening MoD briefing."
);
base(
  "TGT-JACOBABAD",
  "Jacobabad air base",
  "Jacobabad (Sindh)",
  "Pakistan",
  28.28,
  68.45,
  ["SRC-MEA-0510C"],
  "'Extensive damage' claimed in the 10 May evening MoD briefing."
);
base(
  "TGT-BHOLARI",
  "Bholari air base",
  "Thatta district (Sindh)",
  "Pakistan",
  25.18,
  67.92,
  ["SRC-MEA-0510C", "SRC-PIB-0514A"],
  "'Extensive damage' claimed (10 May evening). PIB 14 May: high casualties, death of a named squadron leader and destruction of 'key fighter jets' claimed."
);

// --- Indian locations Pakistan attempted to engage ---
const ind = (id, name, region, lat, lng, src, layer = "military", cat = "military_station", desc = "") =>
  add({
    id,
    name,
    country: "India",
    region,
    category: cat,
    markerLayer: layer,
    side: "pakistani_attack_target",
    lat,
    lng,
    precision: "town",
    officialDescription: desc,
    sources: src,
    evidenceClass: "BLUE",
  });
const P8 = ["SRC-PIB-0508"];
ind("IND-AWANTIPURA", "Awantipura", "Jammu & Kashmir", 33.92, 75.01, [...P8, "SRC-MEA-0510A"]);
ind("IND-SRINAGAR", "Srinagar", "Jammu & Kashmir", 34.0, 74.78, [...P8, "SRC-MEA-0510A"]);
ind("IND-JAMMU", "Jammu", "Jammu & Kashmir", 32.73, 74.86, P8);
ind("IND-PATHANKOT", "Pathankot", "Punjab", 32.27, 75.65, [...P8, "SRC-MEA-0510A"]);
ind("IND-AMRITSAR", "Amritsar", "Punjab", 31.63, 74.87, P8);
ind("IND-KAPURTHALA", "Kapurthala", "Punjab", 31.38, 75.38, P8);
ind("IND-JALANDHAR", "Jalandhar", "Punjab", 31.33, 75.58, [...P8, "SRC-MEA-0510A"]);
ind("IND-LUDHIANA", "Ludhiana", "Punjab", 30.9, 75.85, P8);
ind("IND-ADAMPUR", "Adampur", "Punjab", 31.43, 75.76, [...P8, "SRC-MEA-0510A"]);
ind("IND-BATHINDA", "Bathinda", "Punjab", 30.21, 74.95, [...P8, "SRC-MEA-0509"]);
ind("IND-CHANDIGARH", "Chandigarh", "Chandigarh", 30.73, 76.78, P8);
ind("IND-NAL", "Nal", "Bikaner, Rajasthan", 28.07, 73.21, P8);
ind("IND-PHALODI", "Phalodi", "Rajasthan", 27.13, 72.37, P8);
ind("IND-UTTARLAI", "Uttarlai", "Barmer, Rajasthan", 25.81, 71.48, P8);
ind("IND-BHUJ", "Bhuj", "Gujarat", 23.25, 69.67, [...P8, "SRC-MEA-0510A"]);
ind("IND-UDHAMPUR", "Udhampur", "Jammu & Kashmir", 32.93, 75.14, ["SRC-MEA-0509", "SRC-MEA-0510A"]);
ind(
  "IND-NALIYA",
  "Naliya",
  "Kutch, Gujarat",
  23.26,
  68.84,
  ["SRC-MEA-0510A"],
  "military",
  "military_station",
  "Southern end of the 'Srinagar till Naliya' front (10 May)."
);
ind(
  "IND-SIRSA",
  "Sirsa",
  "Haryana",
  29.53,
  75.03,
  ["SRC-MEA-0510A"],
  "military",
  "military_station",
  "Pakistani claim of destruction rejected; time-stamped imagery shown by Indian briefers."
);
ind(
  "IND-SURATGARH",
  "Suratgarh",
  "Rajasthan",
  29.32,
  73.9,
  ["SRC-MEA-0510A"],
  "military",
  "military_station",
  "Pakistani claim of destruction rejected; time-stamped imagery shown by Indian briefers."
);
ind(
  "IND-FEROZEPUR",
  "Ferozepur",
  "Punjab",
  30.93,
  74.61,
  ["SRC-MEA-0510A"],
  "civilian",
  "civilian_area",
  "Overnight property damage and civilian injuries reported (10 May)."
);

// --- LoC sectors (shelling) ---
const sec = (id, name, lat, lng, src) =>
  add({
    id,
    name: name + " sector",
    country: "India",
    region: "Jammu & Kashmir (LoC)",
    category: "lo_c_sector",
    markerLayer: "civilian",
    side: "pakistani_attack_target",
    lat,
    lng,
    precision: "district",
    sources: src,
    evidenceClass: "BLUE",
  });
sec("SEC-KUPWARA", "Kupwara", 34.53, 74.25, ["SRC-PIB-0508", "SRC-MEA-0510A"]);
sec("SEC-BARAMULLA", "Baramulla", 34.2, 74.34, ["SRC-PIB-0508", "SRC-MEA-0510A"]);
sec("SEC-URI", "Uri", 34.08, 74.05, ["SRC-PIB-0508", "SRC-MEA-0509"]);
sec("SEC-TANGDHAR", "Tangdhar", 34.48, 73.97, ["SRC-MEA-0509"]);
sec("SEC-POONCH", "Poonch", 33.77, 74.09, ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A"]);
sec("SEC-MENDHAR", "Mendhar", 33.6, 74.13, ["SRC-PIB-0508", "SRC-MEA-0509"]);
sec("SEC-RAJOURI", "Rajouri", 33.38, 74.31, ["SRC-PIB-0508", "SRC-MEA-0509", "SRC-MEA-0510A"]);
sec("SEC-AKHNOOR", "Akhnoor", 32.9, 74.74, ["SRC-MEA-0509", "SRC-MEA-0510A"]);

// --- Context locations ---
add({
  id: "LOC-PAHALGAM",
  name: "Baisaran meadow, Pahalgam",
  country: "India",
  region: "Anantnag, Jammu & Kashmir",
  category: "civilian_area",
  markerLayer: "civilian",
  side: "context",
  lat: 34.0,
  lng: 75.33,
  precision: "town",
  officialDescription: "Site of the 22 April 2025 terrorist attack on tourists.",
  sources: ["SRC-MEA-0507"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-NEW-DELHI",
  name: "New Delhi",
  country: "India",
  region: "National Capital Territory",
  category: "government",
  markerLayer: "eventLocations",
  side: "context",
  lat: 28.61,
  lng: 77.21,
  precision: "town",
  officialDescription: "Seat of CCS decisions and MEA/MoD briefings.",
  sources: ["SRC-MEA-0423"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-POONCH-TOWN",
  name: "Poonch town (Gurdwara, Christ School, convent)",
  country: "India",
  region: "Poonch, Jammu & Kashmir",
  category: "religious_site",
  markerLayer: "civilian",
  side: "pakistani_attack_target",
  lat: 33.74,
  lng: 74.15,
  precision: "town",
  officialDescription: "Gurdwara attacked (Ragi among those killed); shell landed behind Christ School killing two students; convent damaged (7 May).",
  sources: ["SRC-MEA-0509"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-SAMBA",
  name: "Samba (International Border)",
  country: "India",
  region: "Samba, Jammu & Kashmir",
  category: "military_station",
  markerLayer: "eventLocations",
  side: "context",
  lat: 32.56,
  lng: 75.12,
  precision: "district",
  officialDescription: "BSF foiled an infiltration attempt along the IB.",
  sources: ["SRC-PIB-0518"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-ARABIAN-SEA",
  name: "Arabian Sea (north)",
  country: "India",
  region: "Maritime – Arabian Sea",
  category: "naval",
  markerLayer: "eventLocations",
  side: "context",
  lat: 22.0,
  lng: 65.5,
  precision: "regional",
  officialDescription: "Carrier Battle Group operating area – broad region only, not an actual position.",
  sources: ["SRC-PIB-0518"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-LEH",
  name: "Leh",
  country: "India",
  region: "Ladakh",
  category: "military_station",
  markerLayer: "uav",
  side: "pakistani_attack_target",
  lat: 34.16,
  lng: 77.58,
  precision: "town",
  officialDescription: "Northern end of the 'Leh to Sir Creek' drone-intrusion front (8–9 May).",
  sources: ["SRC-MEA-0509"],
  evidenceClass: "BLUE",
});
add({
  id: "LOC-SIR-CREEK",
  name: "Sir Creek",
  country: "India",
  region: "Kutch, Gujarat",
  category: "military_station",
  markerLayer: "uav",
  side: "pakistani_attack_target",
  lat: 23.75,
  lng: 68.45,
  precision: "regional",
  officialDescription: "Southern end of the 'Leh to Sir Creek' drone-intrusion front (8–9 May).",
  sources: ["SRC-MEA-0509"],
  evidenceClass: "BLUE",
});

writeFileSync("src/data/targets.json", JSON.stringify(T, null, 2));
console.log("targets:", T.length);
