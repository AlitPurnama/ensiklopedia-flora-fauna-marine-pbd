import { Suspense } from "react";
import Link from "next/link";
import { SpecimenCard } from "@/components/specimen-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listSpesies,
  getKategoriByTipe,
  type SpesiesFilter,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const filter: SpesiesFilter = {
    q: one(sp.q),
    kerajaan: one(sp.kerajaan),
    kelompok: one(sp.kelompok),
    status: one(sp.status),
    wilayah: one(sp.wilayah),
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[16rem_1fr]">
      <FilterRail filter={filter} />
      <section>
        <h1 className="mb-4 font-heading text-3xl font-semibold text-primary">
          Katalog Spesies
        </h1>
        <Suspense key={JSON.stringify(filter)} fallback={<GridSkeleton />}>
          <SpeciesGrid filter={filter} />
        </Suspense>
      </section>
    </div>
  );
}

async function SpeciesGrid({ filter }: { filter: SpesiesFilter }) {
  const rows = await listSpesies(filter);
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-12 text-center text-sm text-muted-foreground">
        Tidak ada spesies yang cocok dengan filter. Coba longgarkan pencarian.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((s) => (
        <SpecimenCard key={s.id} s={s} />
      ))}
    </div>
  );
}

async function FilterRail({ filter }: { filter: SpesiesFilter }) {
  const [kelompok, status, wilayah] = await Promise.all([
    getKategoriByTipe("kelompok"),
    getKategoriByTipe("status_konservasi"),
    getKategoriByTipe("wilayah"),
  ]);

  return (
    <form action="/katalog" className="h-max space-y-5 md:sticky md:top-20">
      <FilterField label="Cari">
        <input
          type="search"
          name="q"
          defaultValue={filter.q}
          placeholder="Nama ilmiah / lokal"
          className="h-9 w-full border-0 border-b border-ring bg-transparent px-1 text-sm outline-none transition focus-visible:border-b-2 focus-visible:shadow-[0_8px_16px_-8px_var(--sage)]"
        />
      </FilterField>

      <FilterSelect
        label="Kerajaan"
        name="kerajaan"
        value={filter.kerajaan}
        options={[
          { slug: "flora", nama: "Flora" },
          { slug: "fauna", nama: "Fauna" },
        ]}
      />
      <FilterSelect
        label="Kelompok"
        name="kelompok"
        value={filter.kelompok}
        options={kelompok}
      />
      <FilterSelect
        label="Status Konservasi"
        name="status"
        value={filter.status}
        options={status}
      />
      <FilterSelect
        label="Wilayah"
        name="wilayah"
        value={filter.wilayah}
        options={wilayah}
      />

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="h-9 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Terapkan
        </button>
        <Link
          href="/katalog"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Atur ulang
        </Link>
      </div>
    </form>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: { slug: string; nama: string }[];
}) {
  return (
    <FilterField label={label}>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-9 w-full border-0 border-b border-ring bg-transparent px-1 text-sm outline-none transition focus-visible:border-b-2 focus-visible:shadow-[0_8px_16px_-8px_var(--sage)]"
      >
        <option value="">Semua</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.nama}
          </option>
        ))}
      </select>
    </FilterField>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-lg" />
      ))}
    </div>
  );
}
