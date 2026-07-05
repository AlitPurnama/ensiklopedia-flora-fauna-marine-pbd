import { cn } from "@/lib/utils";

// Conservation status chip. Color by slug; unknown falls back to muted.
const TONE: Record<string, string> = {
  rentan: "border-plume/40 bg-plume/10 text-plume",
  "hampir-terancam": "border-plume/30 bg-plume/5 text-plume",
  "risiko-rendah": "border-primary/40 bg-primary/10 text-primary",
};

export function StatusBadge({
  nama,
  slug,
  className,
}: {
  nama: string | null;
  slug: string | null;
  className?: string;
}) {
  if (!nama) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        TONE[slug ?? ""] ?? "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {nama}
    </span>
  );
}
