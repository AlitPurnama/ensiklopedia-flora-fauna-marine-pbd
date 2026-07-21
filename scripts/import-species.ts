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

// Per-regency LAND rectangles [[x0,y0],[x1,y1]] (lng/lat), each chosen to sit entirely INSIDE
// that regency's main landmass. The dataset has no per-specimen coordinates, so the map plots a
// representative point per species — an honest "found in <regency>" pin, not a fake GPS fix.
// A point anchor + symmetric jitter used to straddle the coast (Waisai, Sorong city) and drop
// pins in the sea; sampling inside a fully-on-land box keeps every pin dry while still spreading
// them out. Raja Ampat plots on Waigeo (its main island), not per-island.
const WILAYAH_RECT: Record<string, [[number, number], [number, number]]> = {
  "raja-ampat": [[130.92, -0.32], [131.15, -0.12]], // core Waigeo interior (off Waisai bay & W bays)
  sorong: [[131.3, -1.02], [131.62, -0.85]], // mainland E of the city toward Aimas/Klamono
  "sorong-selatan": [[131.75, -1.6], [132.35, -1.3]], // inland around Teminabuan
  tambrauw: [[131.95, -0.95], [132.55, -0.62]], // mainland S of the N coast
  maybrat: [[132.05, -1.45], [132.55, -1.12]], // inland lake district
  "pegunungan-arfak": [[133.62, -1.28], [134.05, -0.98]], // inland mountains
  "papua-barat-daya": [[131.55, -1.5], [132.15, -1.15]], // Bird's-Head mainland interior (fallback)
};

function regionPoint(slug: string, speciesSlug: string): FeatureCollection {
  const [[x0, y0], [x1, y1]] = WILAYAH_RECT[slug] ?? WILAYAH_RECT["papua-barat-daya"];
  // Deterministic uniform sample inside the box: two FNV-1a-derived values in [0,1], seeded by
  // the species slug -> same slug yields the same point on every re-run (idempotent import).
  let h = 0x811c9dc5;
  for (let i = 0; i < speciesSlug.length; i++) {
    h ^= speciesSlug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const u = ((h >>> 0) % 1000) / 1000;
  const v = (((h >>> 10) >>> 0) % 1000) / 1000;
  const lng = x0 + u * (x1 - x0);
  const lat = y0 + v * (y1 - y0);
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
        .values({ slug, namaIlmiah: r.namaIlmiah, deskripsi: "", foto: [], distribusi: regionPoint(w.slug, slug), ...sheetCols })
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
