import "server-only";
import { and, eq, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, spesies, kategori } from "./db";
import type { KategoriTipe } from "./db";

const famili = alias(kategori, "famili");
const status = alias(kategori, "status");
const wilayah = alias(kategori, "wilayah");

const selection = {
  id: spesies.id,
  slug: spesies.slug,
  namaIlmiah: spesies.namaIlmiah,
  namaLokal: spesies.namaLokal,
  kerajaan: spesies.kerajaan,
  deskripsi: spesies.deskripsi,
  habitat: spesies.habitat,
  distribusi: spesies.distribusi,
  foto: spesies.foto,
  familiNama: famili.nama,
  familiSlug: famili.slug,
  statusNama: status.nama,
  statusSlug: status.slug,
  wilayahNama: wilayah.nama,
  wilayahSlug: wilayah.slug,
};

export type SpesiesView = Awaited<ReturnType<typeof listSpesies>>[number];

function baseQuery() {
  return db
    .select(selection)
    .from(spesies)
    .leftJoin(famili, eq(spesies.familiId, famili.id))
    .leftJoin(status, eq(spesies.statusId, status.id))
    .leftJoin(wilayah, eq(spesies.wilayahId, wilayah.id));
}

export type SpesiesFilter = {
  q?: string;
  kerajaan?: string;
  famili?: string;
  status?: string;
  wilayah?: string;
};

export async function listSpesies(filter: SpesiesFilter = {}) {
  const where = and(
    filter.q
      ? sql`(${spesies.namaIlmiah} ilike ${"%" + filter.q + "%"} or ${spesies.namaLokal} ilike ${"%" + filter.q + "%"})`
      : undefined,
    filter.kerajaan === "flora" || filter.kerajaan === "fauna"
      ? eq(spesies.kerajaan, filter.kerajaan)
      : undefined,
    filter.famili ? eq(famili.slug, filter.famili) : undefined,
    filter.status ? eq(status.slug, filter.status) : undefined,
    filter.wilayah ? eq(wilayah.slug, filter.wilayah) : undefined,
  );
  return baseQuery().where(where).orderBy(spesies.namaLokal);
}

export async function adminListSpesies(q = "", page = 1, pageSize = 10) {
  const where = q
    ? sql`(${spesies.namaIlmiah} ilike ${"%" + q + "%"} or ${spesies.namaLokal} ilike ${"%" + q + "%"})`
    : undefined;
  const offset = (page - 1) * pageSize;
  const [rows, [{ total }]] = await Promise.all([
    baseQuery()
      .where(where)
      .orderBy(spesies.namaLokal)
      .limit(pageSize)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(spesies).where(where),
  ]);
  return { rows, total, page, pageSize };
}

export async function getSpesiesForEdit(id: number) {
  const [row] = await db.select().from(spesies).where(eq(spesies.id, id)).limit(1);
  return row ?? null;
}

export async function getSpesiesBySlug(slug: string) {
  const rows = await baseQuery().where(eq(spesies.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getKategoriByTipe(tipe: KategoriTipe) {
  return db
    .select()
    .from(kategori)
    .where(eq(kategori.tipe, tipe))
    .orderBy(kategori.nama);
}

export async function getStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      flora: sql<number>`(count(*) filter (where ${spesies.kerajaan} = 'flora'))::int`,
      fauna: sql<number>`(count(*) filter (where ${spesies.kerajaan} = 'fauna'))::int`,
      diperbarui: sql<string | null>`max(${spesies.diperbaruiPada})::text`,
    })
    .from(spesies);
  const [{ wilayah: wilayahCount }] = await db
    .select({ wilayah: sql<number>`count(*)::int` })
    .from(kategori)
    .where(eq(kategori.tipe, "wilayah"));
  return { ...row, wilayah: wilayahCount };
}
