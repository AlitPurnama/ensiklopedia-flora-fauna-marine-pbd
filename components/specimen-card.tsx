import Link from "next/link";
import { Leaf, Bird } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import type { SpesiesView } from "@/lib/queries";

// The signature element: a herbarium specimen tag. The top strip carries
// collection meta (kingdom + region) in mono, the body carries the Latin
// binomial as the specimen's true name.
export function SpecimenCard({ s }: { s: SpesiesView }) {
  const Icon = s.kerajaan === "flora" ? Leaf : Bird;
  return (
    <Link
      href={`/katalog/${s.slug}`}
      className={cn(
        "group block rounded-lg border border-border bg-card shadow-soft",
        "transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {s.kerajaan}
        </span>
        <span className="tabular-nums">
          No. {String(s.id).padStart(4, "0")}
        </span>
      </div>

      <div className="px-4 py-4">
        <p className="font-binomial text-lg leading-tight text-primary">
          {s.namaIlmiah}
        </p>
        <p className="mt-1 font-heading text-sm font-medium text-muted-foreground">
          {s.namaLokal}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge nama={s.statusNama} slug={s.statusSlug} />
          {s.kelompokNama && (
            <span className="rounded-full bg-sage/25 px-2 py-0.5 text-[11px] font-medium text-primary">
              {s.kelompokNama}
            </span>
          )}
          {s.wilayahNama && (
            <span className="text-xs text-muted-foreground">
              {s.wilayahNama}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
