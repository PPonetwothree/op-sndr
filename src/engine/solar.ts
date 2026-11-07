// Solar position and day/night terminator (low-precision astronomical formulae, ~0.1° –
// ample for map shading). Times are UTC milliseconds.

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function sunPosition(ms: number) {
  const jd = ms / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = rad((357.528 + 0.9856003 * n) % 360);
  const lambda = rad(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const eps = rad(23.4393 - 0.0000004 * n);
  const ra = deg(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)));
  const dec = deg(Math.asin(Math.sin(eps) * Math.sin(lambda)));
  const gmst = (((18.697374558 + 24.06570982441908 * n) % 24) + 24) % 24; // hours
  return { ra, dec, gmst };
}

/** Sun altitude in degrees at a point; negative = below the horizon. */
export function sunAltitude(lat: number, lng: number, ms: number): number {
  const { ra, dec, gmst } = sunPosition(ms);
  const ha = rad(gmst * 15 + lng - ra);
  const s = Math.sin(rad(lat)) * Math.sin(rad(dec)) + Math.cos(rad(lat)) * Math.cos(rad(dec)) * Math.cos(ha);
  return deg(Math.asin(s));
}

/** Night-side polygon ([lat, lng] ring) bounded by the terminator. */
export function nightPolygon(ms: number, step = 1): [number, number][] {
  const { ra, dec, gmst } = sunPosition(ms);
  const pts: [number, number][] = [];
  for (let lng = -180; lng <= 180; lng += step) {
    const ha = rad(gmst * 15 + lng - ra);
    const lat = deg(Math.atan(-Math.cos(ha) / Math.tan(rad(dec))));
    pts.push([lat, lng]);
  }
  const pole = dec < 0 ? 90 : -90; // the pole in permanent night this season
  return [[pole, -180], ...pts, [pole, 180]];
}
