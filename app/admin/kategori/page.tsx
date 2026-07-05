import { db, kategori } from "@/lib/db";
import { KategoriManager } from "@/components/admin/kategori-manager";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const items = await db.select().from(kategori).orderBy(kategori.nama);
  return (
    <div className="p-6">
      <h1 className="mb-2 font-heading text-2xl font-semibold tracking-tight">
        Manajemen Kategori
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Master data pendukung. Kategori yang sedang dipakai spesies tidak dapat
        dihapus.
      </p>
      <KategoriManager items={items} />
    </div>
  );
}
