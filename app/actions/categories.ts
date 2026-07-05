"use server";

import { z } from "zod";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, kategori, spesies } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export type KategoriState = { error?: string; ok?: boolean };

const schema = z.object({
  tipe: z.enum(["ordo", "famili", "status_konservasi", "wilayah"]),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function guard() {
  return verifySession();
}

export async function createKategori(
  _prev: KategoriState,
  formData: FormData,
): Promise<KategoriState> {
  if (!(await guard())) return { error: "Tidak terautentikasi." };
  const parsed = schema.safeParse({
    tipe: formData.get("tipe"),
    nama: formData.get("nama"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const slug = slugify(parsed.data.nama);
  const existing = await db
    .select({ id: kategori.id })
    .from(kategori)
    .where(and(eq(kategori.tipe, parsed.data.tipe), eq(kategori.slug, slug)));
  if (existing.length) return { error: "Kategori serupa sudah ada." };

  await db.insert(kategori).values({ ...parsed.data, slug });
  revalidatePath("/admin/kategori");
  return { ok: true };
}

export async function renameKategori(
  id: number,
  formData: FormData,
): Promise<KategoriState> {
  if (!(await guard())) return { error: "Tidak terautentikasi." };
  const nama = String(formData.get("nama") ?? "").trim();
  if (!nama) return { error: "Nama wajib diisi" };
  await db
    .update(kategori)
    .set({ nama, slug: slugify(nama) })
    .where(eq(kategori.id, id));
  revalidatePath("/admin/kategori");
  return { ok: true };
}

export async function deleteKategori(id: number): Promise<KategoriState> {
  if (!(await guard())) return { error: "Tidak terautentikasi." };
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(spesies)
    .where(
      or(
        eq(spesies.familiId, id),
        eq(spesies.ordoId, id),
        eq(spesies.statusId, id),
        eq(spesies.wilayahId, id),
      ),
    );
  if (n > 0) {
    return { error: `Tidak bisa dihapus: dipakai ${n} spesies.` };
  }
  await db.delete(kategori).where(eq(kategori.id, id));
  revalidatePath("/admin/kategori");
  return { ok: true };
}
