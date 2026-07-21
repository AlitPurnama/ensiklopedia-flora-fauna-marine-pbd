"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createKategori,
  renameKategori,
  deleteKategori,
  setFamiliKelompok,
} from "@/app/actions/categories";
import type { Kategori } from "@/lib/db";

const COLUMNS = [
  { tipe: "famili", label: "Famili" },
  { tipe: "kelompok", label: "Kelompok" },
  { tipe: "ordo", label: "Ordo" },
  { tipe: "status_konservasi", label: "Status Konservasi" },
  { tipe: "wilayah", label: "Wilayah" },
] as const;

export function KategoriManager({ items }: { items: Kategori[] }) {
  const kelompokOptions = items.filter((i) => i.tipe === "kelompok");
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {COLUMNS.map((c) => (
        <Column
          key={c.tipe}
          tipe={c.tipe}
          label={c.label}
          items={items.filter((i) => i.tipe === c.tipe)}
          kelompokOptions={kelompokOptions}
        />
      ))}
    </div>
  );
}

function Column({
  tipe,
  label,
  items,
  kelompokOptions,
}: {
  tipe: string;
  label: string;
  items: Kategori[];
  kelompokOptions: Kategori[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const addRef = useRef<HTMLInputElement>(null);

  const run = (fn: () => Promise<{ error?: string; ok?: boolean }>, done?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else {
        done?.();
        router.refresh();
      }
    });

  return (
    <section className="rounded-lg border border-border shadow-soft">
      <h2 className="border-b border-border px-3 py-2 font-heading text-sm font-semibold">
        {label}
      </h2>
      <ul className="divide-y divide-border">
        {items.length === 0 && (
          <li className="px-3 py-3 text-sm text-muted-foreground">Kosong</li>
        )}
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-1 px-2 py-1.5">
            <RenameInput
              defaultValue={it.nama}
              disabled={pending}
              onCommit={(nama) => {
                if (nama && nama !== it.nama) {
                  const fd = new FormData();
                  fd.set("nama", nama);
                  run(() => renameKategori(it.id, fd));
                }
              }}
            />
            {tipe === "famili" && (
              <select
                defaultValue={it.parentId ?? ""}
                disabled={pending}
                onChange={(e) =>
                  run(() =>
                    setFamiliKelompok(
                      it.id,
                      e.target.value ? Number(e.target.value) : null,
                    ),
                  )
                }
                className="h-8 shrink-0 rounded-md border border-border bg-background px-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Tanpa kelompok</option>
                {kelompokOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={pending}
              aria-label={`Hapus ${it.nama}`}
              onClick={() => {
                if (confirm(`Hapus "${it.nama}"?`))
                  run(() => deleteKategori(it.id));
              }}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1 border-t border-border p-2">
        <input
          ref={addRef}
          placeholder="Tambah…"
          disabled={pending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitAdd();
            }
          }}
          className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          disabled={pending}
          onClick={submitAdd}
          aria-label={`Tambah ${label}`}
          className="shrink-0 rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </section>
  );

  function submitAdd() {
    const nama = addRef.current?.value.trim();
    if (!nama) return;
    const fd = new FormData();
    fd.set("tipe", tipe);
    fd.set("nama", nama);
    run(
      () => createKategori({}, fd),
      () => {
        if (addRef.current) addRef.current.value = "";
      },
    );
  }
}

function RenameInput({
  defaultValue,
  disabled,
  onCommit,
}: {
  defaultValue: string;
  disabled: boolean;
  onCommit: (nama: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value.trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-sm outline-none hover:border-border focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
