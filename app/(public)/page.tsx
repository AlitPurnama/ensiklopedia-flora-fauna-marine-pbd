import Link from "next/link";
import {
  ArrowRight,
  Bird,
  Database,
  Leaf,
  Map as MapIcon,
  Mountain,
  ShieldCheck,
} from "lucide-react";
import { SpeciesMap } from "@/components/species-map";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  listSpesies,
  getStats,
  getKategoriByTipe,
  type SpesiesView,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function HomePage() {
  const [species, stats, statusKategori] = await Promise.all([
    listSpesies(),
    getStats(),
    getKategoriByTipe("status_konservasi"),
  ]);

  const recent = [...species].sort((a, b) => b.id - a.id).slice(0, 6);
  const featured = [...species]
    .sort((a, b) => b.foto.length - a.foto.length)
    .slice(0, 3);

  const kategoriCards = [
    {
      label: "Flora",
      icon: Leaf,
      count: `${stats.flora} Spesimen`,
      href: "/katalog?kerajaan=flora",
    },
    {
      label: "Fauna",
      icon: Bird,
      count: `${stats.fauna} Spesimen`,
      href: "/katalog?kerajaan=fauna",
    },
    {
      label: "Wilayah",
      icon: Mountain,
      count: `${stats.wilayah} Wilayah`,
      href: "/katalog",
    },
    {
      label: "Status Konservasi",
      icon: ShieldCheck,
      count: `${statusKategori.length} Kategori`,
      href: "/katalog",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 md:px-6">
      {/* Header + stats strip. */}
      <section className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Database className="size-4" />
            Basis Data Hayati · Papua Barat Daya
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            Atlas Ekologi Papua Barat Daya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Repositori digital keanekaragaman hayati Kepala Burung—dari
            cendrawasih merah hingga pala fakfak—terdokumentasi sebagai
            spesimen beserta lokasi persebarannya. Pilih wilayah atau kategori
            untuk mulai menjelajah.
          </p>
        </div>
        <div className="flex gap-6 rounded-lg border border-border bg-muted/60 p-5">
          <Stat label="Spesies Terkatalog" value={stats.total} />
          <Separator orientation="vertical" className="h-auto" />
          <Stat label="Wilayah Terpetakan" value={stats.wilayah} />
          <Separator orientation="vertical" className="h-auto" />
          <Stat
            label="Pembaruan Terakhir"
            value={stats.diperbarui ? TANGGAL.format(new Date(stats.diperbarui)) : "—"}
          />
        </div>
      </section>

      {/* Map hero + recent entries. */}
      <section className="grid gap-6 lg:grid-cols-4">
        <div className="relative h-[600px] overflow-hidden rounded-xl border border-border bg-card shadow-soft lg:col-span-3">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border border-border bg-background/90 px-3 py-1.5 shadow-soft backdrop-blur-md">
            <MapIcon className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Topografi Interaktif
            </span>
          </div>
          <SpeciesMap
            species={species.map((s) => ({
              slug: s.slug,
              namaIlmiah: s.namaIlmiah,
              namaLokal: s.namaLokal,
              kerajaan: s.kerajaan,
              distribusi: s.distribusi,
            }))}
            showShapes
          />
        </div>

        <div className="flex h-auto flex-col rounded-xl border border-border bg-card p-6 shadow-soft lg:col-span-1 lg:h-[600px]">
          <h2 className="mb-4 border-b border-border pb-4 font-heading text-xl font-semibold text-primary">
            Entri Terbaru
          </h2>
          <div className="max-h-72 flex-1 space-y-1 overflow-y-auto pr-1 lg:max-h-none">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada entri.</p>
            )}
            {recent.map((s) => (
              <Link
                key={s.slug}
                href={`/katalog/${s.slug}`}
                className="block rounded-md p-3 transition-colors hover:bg-muted"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  No. {String(s.id).padStart(4, "0")} · {s.kerajaan}
                </div>
                <div className="text-sm font-semibold text-primary">
                  {s.namaLokal}
                </div>
                <div className="font-binomial text-[13px] italic text-muted-foreground">
                  {s.namaIlmiah}
                  {s.wilayahNama && (
                    <span className="not-italic font-sans"> · {s.wilayahNama}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/katalog"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
          >
            Lihat Katalog Lengkap
          </Link>
        </div>
      </section>

      {/* Category browse. */}
      <section>
        <h2 className="mb-6 font-heading text-2xl font-semibold text-primary md:text-3xl">
          Jelajah Kategori
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kategoriCards.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="group flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
            >
              <span className="mb-4 flex size-14 items-center justify-center rounded-xl bg-sage/25 text-primary transition-transform group-hover:scale-105">
                <k.icon className="size-7" />
              </span>
              <span className="font-heading text-lg font-semibold text-primary">
                {k.label}
              </span>
              <span className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                {k.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured species. */}
      <section>
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">
            Indeks Spesies Unggulan
          </h2>
          <Link
            href="/katalog"
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
          >
            Jelajahi Indeks <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <FeaturedCard key={s.slug} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-heading text-2xl font-semibold tabular-nums text-primary">
        {value}
      </div>
    </div>
  );
}

function FeaturedCard({ s }: { s: SpesiesView }) {
  const Fallback = s.kerajaan === "flora" ? Leaf : Bird;
  return (
    <Link
      href={`/katalog/${s.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-video bg-muted">
        {s.foto[0] ? (
          <img
            src={s.foto[0]}
            alt={s.namaLokal}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Fallback className="size-8 opacity-40" />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
          {s.kerajaan}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-base font-semibold text-primary">{s.namaLokal}</div>
        <div className="mb-4 font-binomial text-sm italic text-muted-foreground">
          {s.namaIlmiah}
        </div>
        <dl className="mt-auto space-y-2 border-t border-border pt-4">
          <FactRow label="Status" value={s.statusNama ?? "—"} />
          <FactRow label="Wilayah" value={s.wilayahNama ?? "—"} />
          <FactRow label="No." value={String(s.id).padStart(4, "0")} mono />
        </dl>
      </div>
    </Link>
  );
}

function FactRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-primary" : "font-medium text-primary"}>
        {value}
      </dd>
    </div>
  );
}
