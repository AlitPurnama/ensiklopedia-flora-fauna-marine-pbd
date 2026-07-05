import Link from "next/link";
import { Plus, Pencil, Search } from "lucide-react";
import { adminListSpesies } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";
import { DeleteSpeciesButton } from "@/components/admin/delete-species-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminSpesiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await adminListSpesies(q, page, PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (p: number) =>
    `/admin/spesies?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Manajemen Spesies
        </h1>
        <Link
          href="/admin/spesies/tambah"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> Tambah
        </Link>
      </div>

      <form action="/admin/spesies" className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama ilmiah / lokal…"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      <div className="rounded-lg border border-border shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead>Nama Ilmiah</TableHead>
              <TableHead>Nama Lokal</TableHead>
              <TableHead>Kerajaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada spesies.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {String(s.id).padStart(4, "0")}
                  </TableCell>
                  <TableCell className="font-binomial">{s.namaIlmiah}</TableCell>
                  <TableCell>{s.namaLokal}</TableCell>
                  <TableCell className="capitalize">{s.kerajaan}</TableCell>
                  <TableCell>
                    <StatusBadge nama={s.statusNama} slug={s.statusSlug} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/spesies/${s.id}/edit`}
                        aria-label={`Edit ${s.namaLokal}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteSpeciesButton id={s.id} nama={s.namaLokal} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Halaman {page} dari {pages} · {total} spesies
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={link(page - 1)}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                Sebelumnya
              </Link>
            )}
            {page < pages && (
              <Link
                href={link(page + 1)}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                Berikutnya
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
