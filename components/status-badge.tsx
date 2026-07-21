import { cn } from "@/lib/utils";

// Conservation status chip. Color by slug, graduated by severity;
// unassigned status shows the literal "Kurang Data" fallback, not nothing.
// Exported so other status displays (e.g. the reason callout) share the tone.
export const STATUS_TONE: Record<string, string> = {
  "risiko-rendah": "border-primary/40 bg-primary/10 text-primary",
  rentan: "border-plume/40 bg-plume/10 text-plume",
  "hampir-terancam": "border-plume/50 bg-plume/15 text-plume",
  terancam: "border-destructive/25 bg-destructive/5 text-destructive",
  genting: "border-destructive/40 bg-destructive/10 text-destructive",
  kritis: "border-destructive/60 bg-destructive/15 text-destructive",
  "kurang-data": "border-border bg-muted text-muted-foreground",
};

const TONE_TEXT: Record<string, string> = {
  "risiko-rendah": "text-primary",
  rentan: "text-plume",
  "hampir-terancam": "text-plume",
  terancam: "text-destructive",
  genting: "text-destructive",
  kritis: "text-destructive",
  "kurang-data": "text-muted-foreground",
};

export function statusTextTone(slug: string | null): string {
  return TONE_TEXT[slug ?? "kurang-data"] ?? "text-muted-foreground";
}

export function StatusBadge({
  nama,
  slug,
  className,
}: {
  nama: string | null;
  slug: string | null;
  className?: string;
}) {
  const label = nama ?? "Kurang Data";
  const tone = STATUS_TONE[slug ?? "kurang-data"] ?? "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
