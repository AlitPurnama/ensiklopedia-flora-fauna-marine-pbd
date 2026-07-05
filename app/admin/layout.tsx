import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Sprout, Tags, LogOut } from "lucide-react";
import { verifySession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/spesies", label: "Spesies", icon: Sprout },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check (proxy.ts only does the optimistic cookie test).
  if (!(await verifySession())) redirect("/login");

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="flex w-56 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center gap-2 px-4">
          <Sprout className="size-5 text-sidebar-primary" />
          <span className="font-heading text-sm font-semibold">
            Ensiklopedia PBD
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="border-t border-sidebar-border p-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Toaster />
    </div>
  );
}
