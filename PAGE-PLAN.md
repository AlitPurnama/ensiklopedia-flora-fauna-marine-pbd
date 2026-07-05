### Struktur Halaman dan Rute Aplikasi

| Area Akses | Rute (URL) | Nama Halaman | Fungsi & Komponen Utama |
| :--- | :--- | :--- | :--- |
| **Publik** | `/` | Beranda (Peta Utama) | Peta sebaran interaktif layar penuh (`mapcn`), bilah pencarian global melayang, ringkasan statistik spesies. |
| **Publik** | `/katalog` | Katalog Spesies | Tampilan *grid/list* spesies, sistem filter kompleks (Famili, Status Konservasi, Wilayah), di-render menggunakan SSR. |
| **Publik** | `/katalog/[slug]` | Detail Spesies | Informasi taksonomi lengkap, deskripsi, galeri foto, dan komponen peta mini (`mapcn`) yang khusus menyorot lokasi spesies tersebut. |
| **Publik** | `/tentang` | Tentang | Latar belakang proyek, metodologi pengumpulan data (referensi ilmiah), dan kredit. |
| **Publik** | `/login` | Autentikasi | Halaman masuk khusus administrator dengan form validasi (shadcn/ui + Zod). |
| **Admin** | `/admin` | Dashboard Utama | Panel metrik sistem, statistik jumlah spesies, grafik kunjungan web. |
| **Admin** | `/admin/spesies` | Manajemen Spesies | Tabel data master (`shadcn/ui DataTable`), *sorting*, pencarian cepat, *pagination*. |
| **Admin** | `/admin/spesies/tambah` | Tambah Spesies | Form *input* multi-langkah: (1) Data teks, (2) Unggah media, (3) Input spasial interaktif (menandai titik/poligon langsung di peta). |
| **Admin** | `/admin/spesies/[id]/edit` | Edit Spesies | Pembaruan data taksonomi dan koreksi koordinat peta persebaran. |
| **Admin** | `/admin/kategori` | Manajemen Kategori | CRUD untuk master data pendukung (misal: Ordo, Famili, Status Konservasi) guna mencegah duplikasi atau *typo* saat *input* spesies. |
