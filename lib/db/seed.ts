import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { FeatureCollection } from "geojson";
import { kategori, spesies } from "./schema";

process.loadEnvFile(".env");

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema: { kategori, spesies } });

// Papua Barat Daya: Sorong / Raja Ampat / Fakfak area, ~[131.5, -1.2].
function point(lng: number, lat: number): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lng, lat] } },
    ],
  };
}

async function main() {
  console.log("Seeding…");
  await db.delete(spesies);
  await db.delete(kategori);

  const cats = await db
    .insert(kategori)
    .values([
      { tipe: "famili", nama: "Paradisaeidae", slug: "paradisaeidae" },
      { tipe: "famili", nama: "Bucerotidae", slug: "bucerotidae" },
      { tipe: "famili", nama: "Nepenthaceae", slug: "nepenthaceae" },
      { tipe: "famili", nama: "Myristicaceae", slug: "myristicaceae" },
      { tipe: "status_konservasi", nama: "Rentan", slug: "rentan" },
      { tipe: "status_konservasi", nama: "Hampir Terancam", slug: "hampir-terancam" },
      { tipe: "status_konservasi", nama: "Risiko Rendah", slug: "risiko-rendah" },
      { tipe: "wilayah", nama: "Raja Ampat", slug: "raja-ampat" },
      { tipe: "wilayah", nama: "Sorong", slug: "sorong" },
      { tipe: "wilayah", nama: "Fakfak", slug: "fakfak" },
    ])
    .returning();

  const cat = (slug: string) => cats.find((c) => c.slug === slug)?.id;

  await db.insert(spesies).values([
    {
      slug: "cendrawasih-merah",
      namaIlmiah: "Paradisaea rubra",
      namaLokal: "Cendrawasih Merah",
      kerajaan: "fauna",
      familiId: cat("paradisaeidae"),
      statusId: cat("hampir-terancam"),
      wilayahId: cat("raja-ampat"),
      habitat: "Hutan hujan dataran rendah",
      deskripsi:
        "Burung cendrawasih endemik Kepulauan Raja Ampat, dikenal dari bulu merah menyala dan tarian kawin jantan di kanopi hutan.",
      distribusi: point(130.62, -0.55),
    },
    {
      slug: "julang-papua",
      namaIlmiah: "Rhyticeros plicatus",
      namaLokal: "Julang Papua",
      kerajaan: "fauna",
      familiId: cat("bucerotidae"),
      statusId: cat("risiko-rendah"),
      wilayahId: cat("sorong"),
      habitat: "Hutan primer dataran rendah",
      deskripsi:
        "Rangkong besar penyebar biji penting bagi regenerasi hutan Papua Barat Daya. Suara kepakan sayapnya terdengar dari jauh.",
      distribusi: point(131.28, -0.88),
    },
    {
      slug: "kantong-semar-tempayan",
      namaIlmiah: "Nepenthes ampullaria",
      namaLokal: "Kantong Semar Tempayan",
      kerajaan: "flora",
      familiId: cat("nepenthaceae"),
      statusId: cat("risiko-rendah"),
      wilayahId: cat("sorong"),
      habitat: "Rawa gambut dan tepi hutan lembap",
      deskripsi:
        "Tumbuhan karnivora dengan kantong roset di permukaan tanah yang menangkap serasah daun sebagai sumber nitrogen.",
      distribusi: point(131.1, -1.05),
    },
    {
      slug: "pala-fakfak",
      namaIlmiah: "Myristica fragrans",
      namaLokal: "Pala Fakfak",
      kerajaan: "flora",
      familiId: cat("myristicaceae"),
      statusId: cat("rentan"),
      wilayahId: cat("fakfak"),
      habitat: "Hutan dataran rendah dan kebun rakyat",
      deskripsi:
        "Pala asli yang menjadi ikon rempah Fakfak, dibudidayakan turun-temurun dan bernilai ekonomi tinggi.",
      distribusi: point(132.29, -2.92),
    },
  ]);

  console.log("Done.");
  await client.end();
}

main();
