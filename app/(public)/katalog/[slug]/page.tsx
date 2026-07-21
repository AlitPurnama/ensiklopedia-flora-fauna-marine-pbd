import Link from "next/link";
import { notFound } from "next/navigation";
import { Leaf, Bird } from "lucide-react";
import { getSpesiesBySlug } from "@/lib/queries";
import { representativePoint } from "@/lib/geo";
import { StatusBadge, STATUS_TONE } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { SpeciesMap } from "@/components/species-map";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getSpesiesBySlug(slug);
  if (!s) notFound();

  const Icon = s.kerajaan === "flora" ? Leaf : Bird;
  const center = representativePoint(s.distribusi) ?? undefined;

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link
        href="/katalog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kembali ke katalog
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4 border-b border-dashed border-border pb-6">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Icon className="size-3.5" /> {s.kerajaan} · No.{" "}
            {String(s.id).padStart(4, "0")}
          </p>
          <h1 className="mt-2 font-binomial text-4xl leading-tight md:text-5xl">
            {s.namaIlmiah}
          </h1>
          <p className="mt-2 font-heading text-xl text-muted-foreground">
            {s.namaLokal}
          </p>
        </div>
        <StatusBadge nama={s.statusNama} slug={s.statusSlug} />
      </header>

      {s.statusAlasan && (
        <section className="mt-6">
          <SectionTitle>Status Konservasi</SectionTitle>
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm leading-relaxed",
              STATUS_TONE[s.statusSlug ?? "kurang-data"] ?? "border-border bg-muted text-muted-foreground",
            )}
          >
            <span className="font-semibold">{s.statusNama}</span> karena {s.statusAlasan}
          </div>
        </section>
      )}

      {/* Asymmetric editorial split: prose 5 cols, imagery 7 cols. */}
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-5">
          {s.deskripsi && (
            <section>
              <SectionTitle>Deskripsi</SectionTitle>
              <p className="text-base leading-relaxed text-foreground/90">
                {s.deskripsi}
              </p>
            </section>
          )}
          {s.habitat && (
            <section>
              <SectionTitle>Habitat</SectionTitle>
              <p className="text-base leading-relaxed text-foreground/90">
                {s.habitat}
              </p>
            </section>
          )}

          <section>
            <SectionTitle>Taksonomi</SectionTitle>
            <dl className="divide-y divide-border rounded-lg border border-border bg-secondary/60 text-sm shadow-soft">
              <Row label="Kerajaan" value={s.kerajaan} mono />
              <Row label="Kelompok" value={s.kelompokNama} />
              <Row label="Famili" value={s.familiNama} />
              <Row label="Wilayah" value={s.wilayahNama} />
            </dl>
          </section>
        </div>

        <div className="lg:col-span-7">
          <Gallery foto={s.foto} nama={s.namaLokal} />
        </div>
      </div>

      <section className="mt-12">
        <SectionTitle>Peta Sebaran</SectionTitle>
        <div className="h-80 overflow-hidden rounded-lg border border-border shadow-soft">
          <SpeciesMap
            species={[
              {
                slug: s.slug,
                namaIlmiah: s.namaIlmiah,
                namaLokal: s.namaLokal,
                kerajaan: s.kerajaan,
                kelompokSlug: s.kelompokSlug,
                kelompokNama: s.kelompokNama,
                distribusi: s.distribusi,
              },
            ]}
            center={center}
            zoom={9}
            showShapes
            legend={false}
          />
        </div>
      </section>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <dt className="pt-px text-muted-foreground">{label}</dt>
      <dd className={cn("text-left", mono ? "font-mono text-xs" : "font-medium")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

// Asymmetric gallery: first photo is the hero (full width, double height),
// the rest fill single slots below it.
function Gallery({ foto, nama }: { foto: string[]; nama: string }) {
  if (!foto || foto.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground lg:h-full lg:min-h-80">
        Belum ada foto
      </div>
    );
  }
  const [hero, ...rest] = foto;
  const img = (src: string, i: number, isHero = false) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={i}
      src={src}
      alt={`${nama} — foto ${i + 1}`}
      className={
        (isHero ? "col-span-2 h-80 " : "h-40 ") +
        "w-full rounded-lg object-cover shadow-soft ring-1 ring-inset ring-primary/10"
      }
    />
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      {img(hero, 0, true)}
      {rest.map((src, i) => img(src, i + 1))}
    </div>
  );
}
