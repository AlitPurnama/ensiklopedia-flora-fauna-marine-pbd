"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FeatureCollection } from "geojson";
import { db, spesies } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export type SpeciesState = { error?: string };

const schema = z.object({
  namaIlmiah: z.string().trim().min(1, "Nama ilmiah wajib diisi"),
  namaLokal: z.string().trim().min(1, "Nama lokal wajib diisi"),
  kerajaan: z.enum(["flora", "fauna"]),
  deskripsi: z.string().trim().default(""),
  habitat: z.string().trim().default(""),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function numOrNull(v: FormDataEntryValue | null) {
  const n = Number(v);
  return v && Number.isFinite(n) && n > 0 ? n : null;
}

function jsonOrNull<T>(v: FormDataEntryValue | null): T | null {
  if (typeof v !== "string" || !v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

function parse(formData: FormData) {
  const base = schema.safeParse({
    namaIlmiah: formData.get("namaIlmiah"),
    namaLokal: formData.get("namaLokal"),
    kerajaan: formData.get("kerajaan"),
    deskripsi: formData.get("deskripsi") ?? "",
    habitat: formData.get("habitat") ?? "",
  });
  if (!base.success) {
    return { error: base.error.issues[0]?.message ?? "Data tidak valid" };
  }
  return {
    data: {
      ...base.data,
      familiId: numOrNull(formData.get("familiId")),
      ordoId: numOrNull(formData.get("ordoId")),
      statusId: numOrNull(formData.get("statusId")),
      wilayahId: numOrNull(formData.get("wilayahId")),
      distribusi: jsonOrNull<FeatureCollection>(formData.get("distribusi")),
      foto: jsonOrNull<string[]>(formData.get("foto")) ?? [],
    },
  };
}

async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = base || "spesies";
  const rows = await db
    .select({ id: spesies.id, slug: spesies.slug })
    .from(spesies)
    .where(eq(spesies.slug, slug));
  const clash = rows.find((r) => r.id !== ignoreId);
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  return slug;
}

export async function createSpesies(
  _prev: SpeciesState,
  formData: FormData,
): Promise<SpeciesState> {
  if (!(await verifySession())) return { error: "Tidak terautentikasi." };
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const slug = await uniqueSlug(slugify(parsed.data.namaLokal));
  await db.insert(spesies).values({ ...parsed.data, slug });

  revalidatePath("/admin/spesies");
  revalidatePath("/katalog");
  revalidatePath("/");
  redirect("/admin/spesies");
}

export async function updateSpesies(
  id: number,
  _prev: SpeciesState,
  formData: FormData,
): Promise<SpeciesState> {
  if (!(await verifySession())) return { error: "Tidak terautentikasi." };
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const slug = await uniqueSlug(slugify(parsed.data.namaLokal), id);
  await db
    .update(spesies)
    .set({ ...parsed.data, slug, diperbaruiPada: new Date() })
    .where(eq(spesies.id, id));

  revalidatePath("/admin/spesies");
  revalidatePath("/katalog");
  revalidatePath("/");
  redirect("/admin/spesies");
}

export async function deleteSpesies(id: number) {
  if (!(await verifySession())) throw new Error("Tidak terautentikasi.");
  await db.delete(spesies).where(eq(spesies.id, id));
  revalidatePath("/admin/spesies");
  revalidatePath("/katalog");
  revalidatePath("/");
}
