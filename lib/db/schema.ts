import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { FeatureCollection } from "geojson";

// Master data behind /admin/kategori. One table, discriminated by `tipe`.
export const kategoriTipe = pgEnum("kategori_tipe", [
  "ordo",
  "famili",
  "status_konservasi",
  "wilayah",
]);

export const kerajaan = pgEnum("kerajaan", ["flora", "fauna"]);

export const kategori = pgTable("kategori", {
  id: serial("id").primaryKey(),
  tipe: kategoriTipe("tipe").notNull(),
  nama: text("nama").notNull(),
  slug: text("slug").notNull(),
});

export const spesies = pgTable("spesies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  namaIlmiah: text("nama_ilmiah").notNull(),
  namaLokal: text("nama_lokal").notNull(),
  kerajaan: kerajaan("kerajaan").notNull(),
  familiId: integer("famili_id").references(() => kategori.id),
  ordoId: integer("ordo_id").references(() => kategori.id),
  statusId: integer("status_id").references(() => kategori.id),
  wilayahId: integer("wilayah_id").references(() => kategori.id),
  deskripsi: text("deskripsi").notNull().default(""),
  habitat: text("habitat").notNull().default(""),
  // GeoJSON FeatureCollection: points + polygons drawn in the admin map.
  distribusi: jsonb("distribusi").$type<FeatureCollection>(),
  foto: jsonb("foto").$type<string[]>().notNull().default([]),
  dibuatPada: timestamp("dibuat_pada").notNull().defaultNow(),
  diperbaruiPada: timestamp("diperbarui_pada").notNull().defaultNow(),
});

export type Spesies = typeof spesies.$inferSelect;
export type Kategori = typeof kategori.$inferSelect;
export type KategoriTipe = (typeof kategoriTipe.enumValues)[number];
