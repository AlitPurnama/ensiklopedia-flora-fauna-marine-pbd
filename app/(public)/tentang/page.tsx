import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang — Ensiklopedia Flora & Fauna PBD",
};

export default function TentangPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">
        Tentang Proyek
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        Ensiklopedia Flora &amp; Fauna Papua Barat Daya adalah katalog terbuka
        keanekaragaman hayati kawasan, memadukan basis data taksonomi dengan
        peta sebaran interaktif. Tujuannya mendokumentasikan kekayaan spesies
        endemik — dari cendrawasih Raja Ampat hingga pala Fakfak — dalam satu
        rujukan yang mudah diakses.
      </p>

      <Section title="Metodologi Pengumpulan Data">
        <p>
          Data spesies dihimpun dari catatan lapangan, literatur ilmiah, dan
          basis data konservasi. Setiap entri mencakup nama ilmiah, nama lokal,
          klasifikasi famili, status konservasi (mengacu kategori IUCN), serta
          titik dan poligon sebaran yang direkam sebagai GeoJSON.
        </p>
      </Section>

      <Section title="Status Konservasi">
        <p>
          Status mengikuti kategori Daftar Merah IUCN yang disederhanakan ke
          Bahasa Indonesia: Risiko Rendah, Hampir Terancam, Rentan, dan
          seterusnya. Status dapat berubah seiring pembaruan data lapangan.
        </p>
      </Section>

      <Section title="Kredit">
        <p>
          Disusun sebagai proyek etnografi keanekaragaman hayati Papua Barat
          Daya. Peta menggunakan MapLibre dengan ubin dasar Carto.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
