"use client";

import Link from "next/link";
import type { FeatureCollection } from "geojson";
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { representativePoint } from "@/lib/geo";
import { useThemedMapStyle } from "@/lib/map-style";
import { kelasDariKelompok, warnaKelas } from "@/lib/kelompok-warna";
import { cn } from "@/lib/utils";
import { MapLegend } from "@/components/map-legend";

export type MapSpecies = {
  slug: string;
  namaIlmiah: string;
  namaLokal: string;
  kerajaan: "flora" | "fauna";
  kelompokSlug: string | null;
  kelompokNama: string | null;
  distribusi: FeatureCollection | null;
};

// Papua Barat Daya, centered between Raja Ampat and Fakfak.
const PBD_CENTER: [number, number] = [131.4, -1.4];
// ponytail: rough PBD province bbox w/ padding (Raja Ampat → Maybrat)
export const PBD_BOUNDS: [[number, number], [number, number]] = [
  [128.8, -3.8], // SW corner
  [134.2, 1.5], // NE corner
];
const MOSS = "#3F6B4E"; // maplibre paint needs literal colors, not CSS vars

export function SpeciesMap({
  species,
  center = PBD_CENTER,
  zoom = 6.4,
  showShapes = false,
  legend = true,
  className,
  // App is light-only (no theme switcher); pin the basemap so it can't drift to
  // OS-dark while the page stays paper. Thread a real value when dark mode lands.
  theme = "light",
}: {
  species: MapSpecies[];
  center?: [number, number];
  zoom?: number;
  showShapes?: boolean;
  legend?: boolean;
  className?: string;
  theme?: "light" | "dark";
}) {
  const styles = useThemedMapStyle();
  const legendItems: { key: string; nama: string; warna: string }[] = [];
  if (legend) {
    const seen = new Set<string>();
    for (const s of species) {
      const kelas = kelasDariKelompok(s.kelompokSlug);
      if (kelas && !seen.has(kelas)) {
        seen.add(kelas);
        legendItems.push({ key: kelas, nama: kelas, warna: warnaKelas(kelas) });
      }
    }
  }
  return (
    <Map
      viewport={{ center, zoom }}
      maxBounds={PBD_BOUNDS}
      minZoom={5.5}
      theme={theme}
      styles={styles ?? undefined}
      className={cn("h-full w-full", className)}
    >
      <MapControls position="bottom-right" showZoom showFullscreen />
      {legend && <MapLegend items={legendItems} position="bottom-left" />}
      {showShapes &&
        species.map(
          (s) =>
            s.distribusi && (
              <MapGeoJSON
                key={`shape-${s.slug}`}
                data={s.distribusi}
                fillPaint={{ "fill-color": MOSS, "fill-opacity": 0.18 }}
                linePaint={{ "line-color": MOSS, "line-width": 1.5 }}
              />
            ),
        )}
      {species.map((s) => {
        const p = representativePoint(s.distribusi);
        if (!p) return null;
        return (
          <MapMarker key={s.slug} longitude={p[0]} latitude={p[1]}>
            <MarkerContent>
              <span
                className="block size-3.5 rounded-full border-2 border-background shadow"
                style={{ backgroundColor: warnaKelas(kelasDariKelompok(s.kelompokSlug)) }}
              />
            </MarkerContent>
            <MarkerPopup closeButton>
              <p className="font-binomial text-base leading-tight">
                {s.namaIlmiah}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.namaLokal}
              </p>
              {s.kelompokNama && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.kelompokNama}
                </p>
              )}
              <Link
                href={`/katalog/${s.slug}`}
                className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
              >
                Lihat detail →
              </Link>
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </Map>
  );
}
