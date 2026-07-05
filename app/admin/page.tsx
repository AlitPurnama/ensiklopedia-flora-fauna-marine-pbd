import Link from "next/link";
import { Sprout, Leaf, Bird, Tags, Plus } from "lucide-react";
import { getStats, getKategoriByTipe } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, famili, status, wilayah] = await Promise.all([
    getStats(),
    getKategoriByTipe("famili"),
    getKategoriByTipe("status_konservasi"),
    getKategoriByTipe("wilayah"),
  ]);
  const kategoriTotal = famili.length + status.length + wilayah.length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <Link
          href="/admin/spesies/tambah"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> Tambah Spesies
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={Sprout} label="Total Spesies" value={stats.total} />
        <Tile icon={Leaf} label="Flora" value={stats.flora} />
        <Tile icon={Bird} label="Fauna" value={stats.fauna} />
        <Tile icon={Tags} label="Kategori" value={kategoriTotal} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Grafik kunjungan web akan ditambahkan saat data analitik tersedia.
      </p>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
