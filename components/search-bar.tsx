import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Native GET form → /katalog?q=… . No client JS.
export function SearchBar({
  defaultValue,
  className,
  placeholder = "Cari spesies…",
}: {
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <form
      action="/katalog"
      role="search"
      className={cn("relative flex items-center", className)}
    >
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Cari spesies"
        className="h-10 w-full rounded-md border border-border bg-background/95 pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}
