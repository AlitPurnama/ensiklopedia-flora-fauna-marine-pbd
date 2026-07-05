import type { FeatureCollection, Position } from "geojson";

/** First coordinate we can find in a FeatureCollection, as [lng, lat]. */
export function representativePoint(
  fc: FeatureCollection | null | undefined,
): [number, number] | null {
  const g = fc?.features?.[0]?.geometry;
  if (!g || g.type === "GeometryCollection") return null;
  const c = g.coordinates as Position | Position[] | Position[][];
  let p: unknown = c;
  while (Array.isArray(p) && Array.isArray(p[0])) p = p[0];
  const pos = p as Position;
  return Array.isArray(pos) && pos.length >= 2 ? [pos[0], pos[1]] : null;
}
