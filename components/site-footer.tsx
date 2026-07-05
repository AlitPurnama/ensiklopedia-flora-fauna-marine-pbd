import Link from "next/link";

const LINKS = [
  { href: "/", label: "Peta" },
  { href: "/katalog", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-12">
        <div className="space-y-4 md:col-span-5">
          <div className="font-heading text-2xl font-semibold text-primary">
            Ensiklopedia Flora &amp; Fauna Papua Barat Daya
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Katalog dan peta sebaran keanekaragaman hayati Papua Barat Daya —
            spesies flora dan fauna beserta lokasi persebarannya.
          </p>
          <p className="text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} Ensiklopedia PBD.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm md:col-span-7 md:flex-row md:items-center md:justify-end md:gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
