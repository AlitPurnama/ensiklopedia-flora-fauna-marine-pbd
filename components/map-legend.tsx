"use client";

import { cn } from "@/lib/utils";

// Mirrors MapControls' private positionClasses in components/ui/map.tsx —
// duplicated here rather than exporting/refactoring that file for one value.
const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
} as const;

export function MapLegend({
  items,
  position = "bottom-left",
  className,
}: {
  items: { key: string; nama: string; warna: string }[];
  position?: keyof typeof positionClasses;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "absolute z-10 max-w-48 space-y-1 rounded-md border border-border bg-background/90 p-2 text-xs shadow-sm backdrop-blur-sm",
        positionClasses[position],
        className,
      )}
    >
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: it.warna }}
          />
          <span className="truncate">{it.nama}</span>
        </div>
      ))}
    </div>
  );
}
