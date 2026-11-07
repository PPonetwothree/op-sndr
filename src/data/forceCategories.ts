// Force-category grouping for the weapons database (organisational view only).
export interface ForceCategory {
  id: string;
  side: "India" | "Pakistan";
  label: string;
  weaponIds: string[];
}

export const FORCE_CATEGORIES: ForceCategory[] = [
  { id: "in-iaf", side: "India", label: "Indian Air Force", weaponIds: ["WPN-RAFALE", "WPN-SCALP", "WPN-HAMMER"] },
  { id: "in-army", side: "India", label: "Indian Army", weaponIds: ["WPN-AKASHTEER", "WPN-MANPADS", "WPN-LLAD"] },
  { id: "in-navy", side: "India", label: "Indian Navy", weaponIds: ["WPN-CBG"] },
  { id: "in-iad", side: "India", label: "Integrated air-defence assets", weaponIds: ["WPN-AKASH", "WPN-PECHORA", "WPN-OSA-AK", "WPN-LRSAM-IN", "WPN-S400", "WPN-IACCS"] },
  { id: "in-cuas", side: "India", label: "Counter-UAS assets", weaponIds: ["WPN-CUAS-GRID"] },
  { id: "in-ew", side: "India", label: "Electronic warfare capabilities", weaponIds: ["WPN-EW"] },
  { id: "in-uav", side: "India", label: "UAV platforms / loitering munitions", weaponIds: ["WPN-LOITERING-IN", "WPN-ARMED-DRONE-IN"] },
  { id: "in-tri", side: "India", label: "Tri-service missile systems", weaponIds: ["WPN-BRAHMOS"] },
  { id: "pk-paf", side: "Pakistan", label: "Pakistani Air Force", weaponIds: ["WPN-PK-FIGHTERS", "WPN-JF17", "WPN-PL15"] },
  { id: "pk-ad", side: "Pakistan", label: "Pakistani air-defence systems", weaponIds: ["WPN-PK-CN-AD"] },
  { id: "pk-uav", side: "Pakistan", label: "UAVs and UCAVs", weaponIds: ["WPN-SONGAR", "WPN-PK-UCAV", "WPN-PK-QUAD"] },
  { id: "pk-lm", side: "Pakistan", label: "Loitering munitions", weaponIds: ["WPN-YIHA", "WPN-PK-LOITERING"] },
  { id: "pk-arty", side: "Pakistan", label: "Artillery", weaponIds: ["WPN-PK-ARTY"] },
  { id: "pk-msl", side: "Pakistan", label: "Missile systems", weaponIds: ["WPN-PK-HSM", "WPN-PK-LR-ROCKETS"] },
];

export const USAGE_LABEL: Record<string, { label: string; color: string }> = {
  officially_confirmed_used: { label: "Officially stated as used", color: "#4f8fe6" },
  debris_recovered_official: { label: "Debris recovered (official)", color: "#4f8fe6" },
  officially_named_capability: { label: "Named capability – use not detailed", color: "#9aa874" },
  preliminary_identification: { label: "Preliminary identification", color: "#e3a83b" },
  adversary_claim_rejected: { label: "Appears only in rejected claims", color: "#8a8f98" },
  media_reported_only: { label: "Media-reported only", color: "#e3a83b" },
  not_established: { label: "Not established", color: "#8a8f98" },
};
