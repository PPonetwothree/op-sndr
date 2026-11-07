// Pre-renders the fixed set of APP-6 / MIL-STD-2525C symbols used by the map, so the ~1 MB
// milsymbol library is not shipped to the browser. Regenerate with: node scripts/build-symbols.mjs
import { writeFileSync } from "node:fs";
import ms from "milsymbol";

const AFF = ["H", "F", "U"];
const CODES = ["GPI-----H----", "GPIBA---H----", "GPUCD--------", "GPESR--------", "SPCLCV-------"];
const SIZES = [11, 16, 22];
const out = {};
for (const a of AFF)
  for (const c of CODES)
    for (const size of SIZES) {
      const sidc = `S${a}${c}`;
      const sym = new ms.Symbol(sidc, { size, outlineWidth: size === 11 ? 2 : 2.5, outlineColor: "#0b0d0e" });
      if (!sym.isValid()) throw new Error(`invalid SIDC ${sidc}`);
      const { width, height } = sym.getSize();
      const { x, y } = sym.getAnchor();
      out[`${sidc}|${size}`] = { svg: sym.asSVG(), w: width, h: height, ax: x, ay: y };
    }
writeFileSync("src/data/geo/milsymbols.json", JSON.stringify(out));
console.log("symbols:", Object.keys(out).length);
