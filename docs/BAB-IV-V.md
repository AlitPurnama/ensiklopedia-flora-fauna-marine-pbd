# BAB IV: PERANCANGAN DAN IMPLEMENTASI SISTEM

> Catatan penulisan: seluruh isi teknis (arsitektur, skema database, potongan kode, riwayat bug) diambil langsung dari kode sumber proyek `ensiklopedia-flora-fauna-pbd` per commit `4c9ae23`. Bagian yang membutuhkan **data lapangan asli** (kutipan wawancara etnografi, nama informan, lokasi observasi) **belum tersedia di repo ini** dan ditandai `[ISI DATA WAWANCARA]` — draf di bawah memberi kerangka argumen yang konsisten dengan keputusan desain aktual, tapi kutipan informan harus Anda isi dari catatan lapangan sendiri agar tidak jadi klaim etnografi palsu.

## 4.1 Analisis Kebutuhan Sistem

### 4.1.1 Kebutuhan Pengguna (User Requirements)

`[ISI DATA WAWANCARA]` — kerangka argumen di bawah disusun dari keputusan desain yang sudah terwujud di kode; padankan dengan kutipan informan asli Anda.

Tiga temuan yang paling langsung membentuk keputusan rancangan:

1. **Nama lokal setara pentingnya dengan nama ilmiah.** Skema `spesies` (§4.3) menyimpan `namaIlmiah` dan `namaLokal` sebagai dua kolom wajib yang tampil berdampingan di setiap kartu spesies (`SpecimenCard`) dan halaman detail — bukan nama lokal sebagai catatan kaki dari nama ilmiah. Ini konsisten dengan temuan lapangan bahwa masyarakat mengenali flora/fauna lewat penyebutan lokal, sementara nama ilmiah baru relevan bagi peneliti/konservasionis.
2. **Peta sebagai pintu masuk utama, bukan tabel.** Beranda (`/`) adalah peta interaktif layar penuh, bukan daftar teks. Ini menjawab kebutuhan pengguna yang lebih terbiasa mengenali wilayah secara visual/spasial daripada menelusuri teks — sejalan dengan alasan di PRD internal proyek (`PAGE-PLAN.md`) yang secara eksplisit menempatkan peta sebagai halaman pertama.
3. **Admin harus sesederhana mungkin.** Alur admin dibatasi pada satu akun tunggal (kredensial di environment variable, lihat §4.3.2) tanpa manajemen banyak pengguna/peran — mencerminkan asumsi bahwa hanya satu operator (peneliti/pengelola data) yang akan mengisi data, bukan tim besar.

### 4.1.2 Kebutuhan Sistem

**Perangkat lunak (terverifikasi dari `package.json` & `docker-compose.yml`):**

| Komponen | Teknologi | Versi |
|---|---|---|
| Framework aplikasi | Next.js (App Router, Server Actions) | 16.2.10 |
| Bahasa & runtime UI | React / TypeScript | 19.2.4 / 5.x |
| Styling | Tailwind CSS v4 + shadcn (varian base-vega di atas Base UI, bukan Radix) | ^4 / ^4.13 |
| ORM & database | Drizzle ORM + PostgreSQL | 0.45.2 / Postgres 17 |
| Driver DB | `postgres` (postgres.js) | 3.4.9 |
| Autentikasi | JWT via `jose` (HS256, cookie httpOnly) | ^6.2.3 |
| Peta interaktif | MapLibre GL + Terra Draw (+ adapter) | 5.24.0 / 1.31.2 |
| Validasi input | Zod | ^4.4.3 |
| Notifikasi UI | Sonner | ^2.0.7 |

**Perangkat keras / infrastruktur:**
- Server aplikasi: cukup 1 vCPU / 512 MB–1 GB RAM untuk beban kecil (Next.js server-rendered, tanpa build-time SSG berat) — direkomendasikan minimal 1 vCPU/1 GB untuk headroom build.
- Basis data: PostgreSQL 17 dijalankan sebagai container Docker terpisah, port dibatasi ke `127.0.0.1:5432` (tidak diekspos publik — keputusan keamanan, lihat §5.1).
- Penyimpanan foto: direktori lokal `/uploads` yang disajikan lewat endpoint `app/api/upload/route.ts`, nama file di-UUID-kan untuk mencegah tabrakan/enumerasi.
- Klien: browser modern dengan dukungan WebGL (disyaratkan oleh MapLibre GL untuk rendering peta).

## 4.2 Perancangan Arsitektur dan Desain (UI/UX)

### 4.2.1 Arsitektur Sistem

Aplikasi berbasis Next.js App Router dengan pemisahan tiga lapisan:

```
Browser (React 19 client + server components)
        │
        ▼
Next.js App Router ── Route Groups: (public) | admin | login | api/upload
        │
        ├─ Server Actions (app/actions/*.ts)   ← mutasi data, dijaga verifySession()
        │     auth.ts · species.ts · categories.ts
        │
        ├─ Query layer (lib/queries.ts)        ← baca data (SELECT terparameter)
        │
        ├─ Auth layer (lib/auth.ts + rate-limit.ts)
        │     JWT (jose, HS256) di cookie httpOnly + brute-force limiter in-memory
        │
        ▼
Drizzle ORM (lib/db/schema.ts, lib/db/index.ts)
        │
        ▼
PostgreSQL 17 (Docker, 127.0.0.1:5432)
```

Alasan pemilihan: Server Actions dipakai (bukan REST/API route terpisah) karena seluruh mutasi hanya dikonsumsi dari UI admin milik sendiri — menghindari lapisan API publik yang tidak dibutuhkan. Satu-satunya API route sungguhan (`/api/upload`) ada karena unggah file butuh `multipart/form-data`, yang belum didukung Server Actions.

### 4.2.2 Skema Basis Data

```ts
// lib/db/schema.ts
export const kategoriTipe = pgEnum("kategori_tipe", [
  "ordo", "famili", "status_konservasi", "wilayah",
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
  distribusi: jsonb("distribusi").$type<FeatureCollection>(), // GeoJSON titik + poligon
  foto: jsonb("foto").$type<string[]>().notNull().default([]),
  dibuatPada: timestamp("dibuat_pada").notNull().defaultNow(),
  diperbaruiPada: timestamp("diperbarui_pada").notNull().defaultNow(),
});
```

`kategori` adalah satu tabel master data yang di-*discriminate* lewat kolom `tipe` (ordo/famili/status konservasi/wilayah) — dipilih ketimbang empat tabel terpisah karena keempatnya punya bentuk (nama + slug) dan alur CRUD yang identik; memisahkannya jadi empat tabel hanya menambah boilerplate tanpa manfaat query.

### 4.2.3 Struktur Halaman (Use Case per Rute)

| Akses | Rute | Fungsi |
|---|---|---|
| Publik | `/` | Peta sebaran interaktif layar penuh, bilah pencarian, ringkasan statistik |
| Publik | `/katalog` | Grid spesies + filter (famili, status konservasi, wilayah, pencarian teks), SSR (`dynamic="force-dynamic"`) |
| Publik | `/katalog/[slug]` | Detail taksonomi, deskripsi, galeri foto, peta mini menyorot lokasi spesies |
| Publik | `/tentang` | Latar belakang proyek & metodologi |
| Publik | `/login` | Login admin (form shadcn + Zod, dibatasi laju percobaan) |
| Admin | `/admin` | Dashboard: total spesies, jumlah flora/fauna, jumlah kategori |
| Admin | `/admin/spesies` | Tabel manajemen spesies |
| Admin | `/admin/spesies/tambah` | Form tambah: data teks → unggah foto → gambar titik/poligon sebaran di peta |
| Admin | `/admin/spesies/[id]/edit` | Edit data & koordinat sebaran |
| Admin | `/admin/kategori` | CRUD master data (ordo, famili, status konservasi, wilayah) |

Seluruh rute `/admin/*` dijaga di `app/admin/layout.tsx` lewat `verifySession()` — bukan per-halaman, agar tidak ada rute admin yang lupa dipasangi guard.

### 4.2.4 Desain Visual — Palet, Tipografi, dan Alasan Budaya

Sistem desain didokumentasikan di `DESIGN.md` dengan nama **"Papua Biome Archive"**. Ini bagian yang perlu kejujuran: palet warna **diambil dari bioma** Papua Barat Daya (kanopi hutan hujan dan karst gamping), **bukan dari motif ukiran** suku setempat secara literal. Rincian nyata di kode:

| Warna | Nilai | Alasan pemakaian |
|---|---|---|
| Deep Forest Green | `#1A2F23` | Warna utama tipografi & navigasi — merepresentasikan kanopi hutan hujan, dipakai agar teks terasa "berakar", bukan sekadar hitam |
| Moss Green | `#4A5D4E` | Aksi sekunder, ikon — nuansa lumut/lantai hutan |
| Sage | `#A3B18A` | Indikator status & aksen aktif |
| Warm Stone | `#E9E5D9` | Latar kartu/kontainer — merujuk batu karst, menghindari abu-abu digital yang terasa dingin |
| Paper `#FDF9ED` | Kanvas utama — kesan kertas/arsip museum, mengurangi silau layar |

Tipografi memasangkan **Playfair Display** (judul, kesan "arsip museum sejarah alam" yang berwibawa) dengan **Inter** (isi & label UI, keterbacaan fungsional); label kategori (mis. status konservasi) memakai gaya `label-caps` (huruf kapital kecil, tracking lebar) meniru label spesimen herbarium fisik.

**Yang belum ada dan sebaiknya diakui secara eksplisit di skripsi**: tidak ada elemen ornamen ukiran Papua (motif Asmat/Kamoro dsb.) di UI saat ini — identitas visual bertumpu pada palet & tipografi, bukan motif grafis. Kalau rubrik penilaian menuntut justifikasi ornamen ukiran, dua opsi jujur: (a) tulis ini sebagai *keterbatasan desain saat ini* di §5.2/BAB VI, atau (b) minta ditambahkan aksen SVG bermotif ukiran (mis. garis pembatas seksi, ikon kategori) sebagai pekerjaan lanjutan — bukan diklaim sudah ada.

### 4.2.5 Wireframe / Tangkapan Layar

Server pengembangan aplikasi ini berhasil dijalankan (`npm run dev`, terverifikasi merespons HTTP 200 di `/`, `/katalog`, `/login`) tetapi **tangkapan layar otomatis gagal diambil** di lingkungan kerja saat ini — sandbox eksekusi tidak memberi akses tampilan layar (`screencapture` gagal: *"could not create image from display"*) maupun akses jaringan penuh untuk Chrome headless ke `localhost`. Ini bukan kegagalan aplikasi, melainkan keterbatasan lingkungan otomatisasi.

Cara mengisi bagian ini secara manual (5 menit):
1. Pastikan Docker (`ensiklopedia-flora-fauna-pbd-db-1`) dan `npm run dev` berjalan — keduanya **sudah menyala** saat ini di `localhost:3000`.
2. Buka di browser lalu screenshot: `/` (peta beranda), `/katalog` (grid+filter), `/katalog/dorcopsis-muelleri` (contoh detail spesies nyata di database), `/login`.
3. Simpan ke `docs/screenshots/` dengan nama `home.png`, `katalog.png`, `detail.png`, `login.png`, lalu sisipkan dengan `![](screenshots/home.png)` dst di dokumen ini.

## 4.3 Implementasi (Pembuatan Produk)

### 4.3.1 Peta Interaktif Publik (Clamped ke Papua Barat Daya)

```tsx
// components/species-map.tsx
const PBD_CENTER: [number, number] = [131.4, -1.4];
export const PBD_BOUNDS: [[number, number], [number, number]] = [
  [128.8, -3.8], // SW
  [134.2, 1.5],  // NE
];

<Map
  viewport={{ center, zoom }}
  maxBounds={PBD_BOUNDS}
  minZoom={5.5}
  ...
>
```

Peta dikunci (`maxBounds` + `minZoom`) agar pengguna tidak bisa menggeser/zoom-out keluar dari cakupan data (Papua Barat Daya) — mencegah kesan "peta dunia kosong" di luar area yang relevan.

### 4.3.2 Autentikasi & Pembatasan Percobaan Login

```ts
// lib/auth.ts
if ((process.env.SESSION_SECRET ?? "").length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set("session", token, {
    httpOnly: true, secure: production, sameSite: "lax", maxAge: 60 * 60 * 24 * 7,
  });
}
```

```ts
// lib/rate-limit.ts — 5 kegagalan / 15 menit per IP, in-memory
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
```

Perbandingan kredensial memakai `timingSafeEqual` untuk menutup celah *timing attack*; sesi tidak disimpan di database (stateless JWT) karena hanya ada satu akun admin, jadi *session store* terpisah tidak diperlukan.

### 4.3.3 Impor Data Massal dari XLSX

```ts
// scripts/import-species.ts (141 spesies diimpor, dijalankan lewat `npm run db:import`)

// 91 string wilayah bebas-teks dipetakan ke 7 wilayah kanonik PBD,
// prioritas atas-ke-bawah: kata kunci pertama yang cocok menang.
const WILAYAH = [
  { nama: "Sorong Selatan", slug: "sorong-selatan", keywords: ["sorong selatan"] },
  { nama: "Raja Ampat", slug: "raja-ampat", keywords: ["raja ampat", "waigeo", "batanta", "misool", "kofiau", "salawati"] },
  // ... 5 wilayah lain, fallback ke "papua-barat-daya"
];
```

Dataset asal tidak memiliki koordinat per spesimen — hanya nama wilayah bebas-teks. Skrip ini mengonversinya menjadi titik representatif per wilayah, bukan koordinat GPS palsu (lihat §5.1 untuk evolusi/perbaikan pendekatan ini).

## Ringkasan Bagian yang Perlu Anda Lengkapi Sendiri
- Kutipan & atribusi wawancara etnografi di §4.1.1 (`[ISI DATA WAWANCARA]`)
- 4 tangkapan layar di §4.2.5 (aplikasi sudah jalan, tinggal screenshot manual)
- Keputusan sadar soal ornamen ukiran Papua (§4.2.4) — akui belum ada, atau minta ditambahkan

---

# BAB V: HASIL DAN PEMBAHASAN UJI COBA

## 5.1 Pengujian Teknis (Alpha Testing)

Pengujian alpha dilakukan internal oleh tim pengembang lewat siklus *build → jalankan → temukan bug → perbaiki*, tercatat di riwayat commit. Ini bukan simulasi — berikut kronologi nyata dari `git log`:

### Kasus 1 — Titik sebaran spesies jatuh di laut

**Iterasi 1** (`c6e8e8b feat: backfill distribusi with region-centroid points`): pendekatan awal menaruh satu titik centroid per wilayah untuk setiap spesies tanpa koordinat asli. Bug: seluruh spesies dari satu wilayah bertumpuk di titik identik, dan titik Raja Ampat jatuh di laut (centroid geografis wilayah kepulauan itu memang berada di air, bukan daratan Waigeo).

**Iterasi 2** (`61bb239 feat: spread species points with jitter, move Raja Ampat onto land`): ditambahkan *jitter* deterministik (di-seed dari slug spesies, pakai hash FNV-1a) agar titik menyebar dan tidak bertumpuk, serta titik jangkar Raja Ampat dipindah manual ke daratan Waigeo.

**Iterasi 3** (`4c9ae23 fix(map): sample species points inside per-regency land boxes`) — bug masih ada: jitter simetris di sekitar satu titik jangkar kadang tetap mendorong pin ke laut di wilayah pesisir lain (Sorong, Tambrauw). Perbaikan final: sampling dilakukan **di dalam kotak persegi yang sudah dipastikan seluruhnya daratan** per wilayah, bukan jitter di sekitar satu titik:

```ts
// scripts/import-species.ts
const WILAYAH_RECT: Record<string, [[number, number], [number, number]]> = {
  "raja-ampat": [[130.92, -0.32], [131.15, -0.12]], // interior inti Waigeo
  sorong: [[131.3, -1.02], [131.62, -0.85]],
  // ...
};
```
Fungsi `regionPoint()` memakai hash yang di-seed dari slug spesies → hasil sampling deterministik (idempoten): re-run skrip impor menghasilkan titik yang sama persis, bukan acak ulang tiap kali.

**Kesimpulan pengujian**: bug ini terdeteksi lewat pemeriksaan visual peta setelah impor (bukan unit test) — mengonfirmasi nilai *manual QA* untuk fitur geospasial, karena kesalahan semacam "pin di laut" tidak terdeteksi oleh type-checker atau linter.

### Kasus 2 — Tinjauan Keamanan Internal

Commit `945ef48 fix(security): add login rate limit and input hardening` mencatat hasil audit keamanan internal atas jalur auth/actions/upload/queries. Temuan & perbaikan:

| Temuan | Perbaikan |
|---|---|
| Login tidak dibatasi jumlah percobaan → rentan *brute force* | `lib/rate-limit.ts`: 5 gagal / 15 menit per IP |
| Field `foto[]` diterima tanpa validasi path | Divalidasi Zod agar wajib berawalan `/uploads/` |
| Port Postgres (5432) terekspos ke semua interface | Diikat ke `127.0.0.1:5432` di `docker-compose.yml` |
| `SESSION_SECRET` tidak divalidasi panjangnya | Ditambah *assert* wajib ≥32 karakter saat startup |

Query yang sudah ada sebelumnya (Drizzle, terparameter) dan validasi allowlist unggah foto dinilai sudah memadai — tidak ditemukan celah injeksi SQL maupun XSS pada audit ini.

**Item terbuka (jujur diakui, belum tuntas)**: nilai `SESSION_SECRET` sempat tercatat di transkrip asisten AI selama proses review dan **belum dirotasi** — didokumentasikan sebagai risiko terbuka di `handoff.md`. Ini contoh baik untuk bagian "keterbatasan sistem" di BAB VI: rotasi secret pra-produksi adalah langkah wajib yang belum dieksekusi.

### Kasus 3 — Cakupan Pengujian Otomatis

Status objektif saat ini:
- `tsc --noEmit`: bersih, tanpa error tipe.
- Lint (`eslint`): bersih kecuali beberapa isu pra-eksisting yang diketahui (komponen `map.tsx` hasil vendor, dependency `react-hooks` di form admin, penggunaan `<img>` alih-alih `next/image`) — dicatat, belum diperbaiki.
- **Tidak ada suite pengujian otomatis (unit/integration) yang terpasang** kecuali satu berkas ad hoc `lib/rate-limit.test.ts` yang dijalankan manual lewat `node --experimental-strip-types`, tanpa test runner/framework. Ini keterbatasan nyata yang perlu diakui, bukan ditutupi: pengujian sejauh ini bersifat manual/fungsional (jalankan server, klik alur, cek HTTP 200) dan tinjauan kode, bukan regresi otomatis.

### Kasus 4 — Verifikasi Fungsional Manual (sesi ini)

Sebagai bagian dari penyusunan bab ini, server pengembangan dijalankan ulang dan diverifikasi merespons:

| Rute | Status HTTP |
|---|---|
| `/` | 200 |
| `/katalog` | 200 |
| `/login` | 200 |

Query langsung ke database mengonfirmasi data spesies nyata tersedia (mis. `dorcopsis-muelleri` — nama ilmiah wallaby hutan Papua — dapat diambil dan dirender di halaman detail).

## Ringkasan Bagian yang Perlu Anda Lengkapi Sendiri
- Jika skripsi menuntut metrik kuantitatif (waktu muat halaman, akurasi sensor GPS, dsb.) yang belum diukur di sini — perlu sesi pengujian performa terpisah (mis. Lighthouse, `next build && next start` lalu ukur TTFB) karena bab ini hanya mencatat pengujian fungsional/keamanan yang benar-benar sudah terjadi di riwayat proyek.
