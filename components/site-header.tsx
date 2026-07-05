import Link from "next/link";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Peta" },
  { href: "/katalog", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex flex-col transition-opacity hover:opacity-80">
          <span className="font-heading text-lg font-semibold leading-tight tracking-tight text-primary">
            Ensiklopedia Flora &amp; Fauna
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Papua Barat Daya · Arsip Hayati Digital
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/katalog"
            aria-label="Cari spesies"
            className="text-primary transition-opacity hover:opacity-70"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/katalog"
            className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
          >
            Jelajahi Katalog
          </Link>
        </div>
      </div>
    </header>
  );
}
