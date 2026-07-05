"use client";

import { useEffect, useState } from "react";
import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

// Recolor CARTO's positron/dark-matter styles to the herbarium palette — the
// mapcn-documented `styles` prop path (a StyleSpecification object). maplibre
// paint takes literal hex, not CSS vars (same rule as MOSS in species-map).
// ponytail: tones eyeballed; tune these consts after a visual check.
const PALETTE = {
  light: {
    background: "#F3EFE4", // paper
    land: "#E7E9DD", //       faint moss over paper — vegetation hint
    water: "#C3D2D8", //      muted sky
    line: "#DED7C6", //       hairline roads
    boundary: "#C9BFA8",
    label: "#4A463C", //      muted ink
    halo: "#F3EFE4",
  },
  dark: {
    background: "#132A1F", // canopy
    land: "#173023",
    water: "#15242B",
    line: "#263A2D",
    boundary: "#2E4536",
    label: "#C7D0C4",
    halo: "#0E1F16",
  },
} as const;

type Tones = (typeof PALETTE)[keyof typeof PALETTE];
type Themed = { light: StyleSpecification; dark: StyleSpecification };

const STYLE_URLS = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  // fallback: swap light to voyager for a warmer stock basemap if recolor drifts:
  // "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
};

const has = (id: string, ...needles: string[]) =>
  needles.some((n) => id.includes(n));

function recolor(layer: LayerSpecification, t: Tones) {
  const id = layer.id;
  if (layer.type === "background") {
    layer.paint = { ...layer.paint, "background-color": t.background };
  } else if (layer.type === "fill") {
    const color = has(id, "water", "ocean", "sea", "bay")
      ? t.water
      : has(id, "wood", "forest", "park", "grass", "green", "wetland", "landcover", "landuse")
        ? t.land
        : t.background;
    layer.paint = { ...layer.paint, "fill-color": color };
  } else if (layer.type === "line") {
    const color = has(id, "water", "waterway", "river", "stream")
      ? t.water
      : has(id, "boundary", "admin", "border")
        ? t.boundary
        : t.line;
    layer.paint = { ...layer.paint, "line-color": color };
  } else if (layer.type === "symbol") {
    layer.paint = {
      ...layer.paint,
      "text-color": t.label,
      "text-halo-color": t.halo,
    };
  }
}

async function fetchThemed(url: string, t: Tones): Promise<StyleSpecification> {
  const style: StyleSpecification = await fetch(url).then((r) => r.json());
  for (const layer of style.layers) recolor(layer, t);
  return style;
}

// Fetch + recolor once, share across all map mounts.
let cache: Promise<Themed> | null = null;
function load(): Promise<Themed> {
  cache ??= Promise.all([
    fetchThemed(STYLE_URLS.light, PALETTE.light),
    fetchThemed(STYLE_URLS.dark, PALETTE.dark),
  ]).then(([light, dark]) => ({ light, dark }));
  return cache;
}

/** Palette-matched map styles, or null until fetched (Map shows its loader). */
export function useThemedMapStyle(): Themed | null {
  const [styles, setStyles] = useState<Themed | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setStyles(s));
    return () => {
      alive = false;
    };
  }, []);
  return styles;
}
