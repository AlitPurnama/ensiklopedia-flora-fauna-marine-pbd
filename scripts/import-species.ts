import { readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { z } from "zod";
import type { FeatureCollection } from "geojson";
import { kategori, spesies } from "../lib/db/schema";

process.loadEnvFile(".env");

// slugify: copied verbatim from app/actions/species.ts (6 lines, not worth an import cycle).
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 91 messy free-text Wilayah strings -> 7 canonical PBD regions. Priority is top->bottom:
// the first keyword that matches wins, so multi-region rows ("Sorong, Raja Ampat") resolve
// to the higher-priority region. Anything unmatched falls through to papua-barat-daya.
const WILAYAH: { nama: string; slug: string; keywords: string[] }[] = [
  { nama: "Sorong Selatan", slug: "sorong-selatan", keywords: ["sorong selatan"] },
  { nama: "Raja Ampat", slug: "raja-ampat", keywords: ["raja ampat", "waigeo", "batanta", "misool", "kofiau", "salawati"] },
  { nama: "Tambrauw", slug: "tambrauw", keywords: ["tambrauw", "jamursba"] },
  { nama: "Maybrat", slug: "maybrat", keywords: ["maybrat", "ayamaru"] },
  { nama: "Pegunungan Arfak", slug: "pegunungan-arfak", keywords: ["arfak"] },
  { nama: "Sorong", slug: "sorong", keywords: ["sorong"] },
  { nama: "Papua Barat Daya", slug: "papua-barat-daya", keywords: [] }, // fallback / province-wide
];

function canonWilayah(raw: string): { nama: string; slug: string } {
  const s = raw.toLowerCase();
  for (const w of WILAYAH) {
    if (w.keywords.some((k) => s.includes(k))) return { nama: w.nama, slug: w.slug };
  }
  return { nama: "Papua Barat Daya", slug: "papua-barat-daya" };
}

// Approximate regency centroids [lng, lat] within the PBD map bounds. The dataset has no
// per-specimen coordinates, so the map plots one representative point per canonical region —
// an honest "found in <regency>" pin, not a fake precise GPS fix.
const WILAYAH_CENTROID: Record<string, [number, number]> = {
  "raja-ampat": [130.85, -0.5],
  sorong: [131.29, -0.86],
  "sorong-selatan": [132.0, -1.5],
  tambrauw: [132.2, -0.6],
  maybrat: [132.3, -1.28],
  "pegunungan-arfak": [133.9, -1.1],
  "papua-barat-daya": [131.3, -1.2],
};

function regionPoint(slug: string): FeatureCollection {
  const [lng, lat] = WILAYAH_CENTROID[slug] ?? WILAYAH_CENTROID["papua-barat-daya"];
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lng, lat] } }],
  };
}

const rowSchema = z.object({
  namaIlmiah: z.string().trim().min(1),
  namaLokal: z.string().trim().min(1),
  kerajaan: z.enum(["Flora", "Fauna"]),
  famili: z.string().trim().min(1),
  statusKonservasi: z.string().trim().min(1),
  wilayah: z.string().trim().min(1),
  habitat: z.string().trim().default(""),
  foto: z.string().nullable(), // always the "Buka Foto (Offline)" placeholder — ignored
});

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const raw = JSON.parse(readFileSync("data/spesies.json", "utf-8"));
  const rows = z.array(rowSchema).parse(raw);
  console.log(`Parsed ${rows.length} rows${DRY_RUN ? " (DRY RUN — no writes)" : ""}`);

  // Collect unique categories. famili + status use the raw string; wilayah is canonicalized.
  const cats = new Map<string, { tipe: "famili" | "status_konservasi" | "wilayah"; nama: string; slug: string }>();
  const add = (tipe: "famili" | "status_konservasi" | "wilayah", nama: string, slug = slugify(nama)) => {
    cats.set(`${tipe}:${slug}`, { tipe, nama, slug });
  };
  for (const r of rows) {
    add("famili", r.famili);
    add("status_konservasi", r.statusKonservasi);
    const w = canonWilayah(r.wilayah);
    add("wilayah", w.nama, w.slug);
    console.log(`  wilayah: ${r.wilayah}  ->  ${w.nama}`);
  }
  console.log(
    `Categories: ${[...cats.values()].filter((c) => c.tipe === "famili").length} famili, ` +
      `${[...cats.values()].filter((c) => c.tipe === "status_konservasi").length} status, ` +
      `${[...cats.values()].filter((c) => c.tipe === "wilayah").length} wilayah`,
  );

  if (DRY_RUN) {
    console.log("Dry run complete. Re-run without --dry-run to write.");
    return;
  }

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema: { kategori, spesies } });

  await db.transaction(async (tx) => {
    // kategori has no unique index on (tipe, slug), so dedupe against existing rows in code.
    const existing = await tx.select().from(kategori);
    const seen = new Set(existing.map((c) => `${c.tipe}:${c.slug}`));
    const toInsert = [...cats.values()].filter((c) => !seen.has(`${c.tipe}:${c.slug}`));
    if (toInsert.length) await tx.insert(kategori).values(toInsert);

    const all = await tx.select().from(kategori);
    const idOf = (tipe: string, slug: string) => all.find((c) => c.tipe === tipe && c.slug === slug)?.id ?? null;

    let inserted = 0;
    let updated = 0;
    for (const r of rows) {
      const slug = slugify(r.namaIlmiah); // scientific name is unique — the stable natural key
      const w = canonWilayah(r.wilayah);
      // Sheet-owned columns only. deskripsi/foto/distribusi are human-backfilled in admin and
      // must survive a re-import, so they're set on insert but excluded from onConflict update.
      const sheetCols = {
        namaLokal: r.namaLokal,
        kerajaan: r.kerajaan.toLowerCase() as "flora" | "fauna",
        familiId: idOf("famili", slugify(r.famili)),
        statusId: idOf("status_konservasi", slugify(r.statusKonservasi)),
        wilayahId: idOf("wilayah", w.slug),
        habitat: r.habitat,
      };
      const res = await tx
        .insert(spesies)
        .values({ slug, namaIlmiah: r.namaIlmiah, deskripsi: "", foto: [], distribusi: regionPoint(w.slug), ...sheetCols })
        .onConflictDoUpdate({
          target: spesies.slug,
          // coalesce keeps a human-drawn distribusi if one exists, else backfills the region
          // point. deskripsi/foto stay untouched (not in the set) so manual edits survive.
          set: { ...sheetCols, distribusi: sql`coalesce(${spesies.distribusi}, excluded.distribusi)`, diperbaruiPada: new Date() },
        })
        .returning({ createdAt: spesies.dibuatPada, updatedAt: spesies.diperbaruiPada });
      // On a fresh insert both timestamps default to now(); on update only diperbaruiPada moves.
      const rrow = res[0];
      if (rrow && rrow.createdAt.getTime() === rrow.updatedAt.getTime()) inserted++;
      else updated++;
    }
    console.log(`Species: ${inserted} inserted, ${updated} updated`);
  });

  await client.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
