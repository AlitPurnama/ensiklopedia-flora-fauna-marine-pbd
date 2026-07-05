"use client";

import { useEffect, useRef, useState } from "react";
import type MapLibreGL from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import {
  TerraDraw,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { MapPin, Hexagon, MousePointer2, Trash2 } from "lucide-react";
import { Map } from "@/components/ui/map";
import { cn } from "@/lib/utils";

const PBD_CENTER: [number, number] = [131.4, -1.4];
type Mode = "point" | "polygon" | "select";

function toFC(features: Feature[]): FeatureCollection {
  return { type: "FeatureCollection", features };
}

// Terra Draw needs a `mode` property + id on each seeded feature.
function prep(fc: FeatureCollection | null): Feature[] {
  if (!fc?.features) return [];
  return fc.features.map((f) => ({
    ...f,
    id: (f.id as string) ?? crypto.randomUUID(),
    properties: {
      ...f.properties,
      mode: f.geometry.type === "Polygon" ? "polygon" : "point",
    },
  }));
}

export function DrawMap({
  value,
  onChange,
}: {
  value: FeatureCollection | null;
  onChange: (fc: FeatureCollection | null) => void;
}) {
  const [map, setMap] = useState<MapLibreGL.Map | null>(null);
  const [mode, setMode] = useState<Mode>("point");
  const drawRef = useRef<TerraDraw | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!map) return;
    let draw: TerraDraw | null = null;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [
          new TerraDrawPointMode(),
          new TerraDrawPolygonMode(),
          new TerraDrawSelectMode({
            flags: {
              point: { feature: { draggable: true } },
              polygon: {
                feature: {
                  draggable: true,
                  coordinates: { midpoints: true, draggable: true, deletable: true },
                },
              },
            },
          }),
        ],
      });
      draw.start();
      const seed = prep(value);
      // ponytail: our features are only Point/Polygon; terra-draw's stricter
      // GeoJSONStoreFeatures type doesn't accept the generic Geometry union.
      if (seed.length) draw.addFeatures(seed as never);
      draw.setMode("point");
      draw.on("change", () => {
        const fc = toFC(draw!.getSnapshot());
        onChangeRef.current(fc.features.length ? fc : null);
      });
      drawRef.current = draw;
    };

    if (map.isStyleLoaded()) init();
    else map.once("load", init);

    return () => {
      cancelled = true;
      try {
        draw?.stop();
      } catch {
        // map may already be gone
      }
      drawRef.current = null;
    };
    // seed only on mount; value changes after are user-driven
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    drawRef.current?.setMode(mode);
  }, [mode]);

  const clearAll = () => {
    drawRef.current?.clear();
    onChangeRef.current(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ToolButton active={mode === "point"} onClick={() => setMode("point")} icon={MapPin}>
          Titik
        </ToolButton>
        <ToolButton active={mode === "polygon"} onClick={() => setMode("polygon")} icon={Hexagon}>
          Poligon
        </ToolButton>
        <ToolButton active={mode === "select"} onClick={() => setMode("select")} icon={MousePointer2}>
          Pilih / Geser
        </ToolButton>
        <button
          type="button"
          onClick={clearAll}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" /> Hapus semua
        </button>
      </div>
      <div className="h-96 overflow-hidden rounded-md border border-border">
        <Map ref={setMap} viewport={{ center: PBD_CENTER, zoom: 6.4 }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Mode <strong>Titik</strong>: klik untuk menandai lokasi. Mode{" "}
        <strong>Poligon</strong>: klik tiap sudut, klik dua kali untuk menutup.
      </p>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:bg-muted",
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}
