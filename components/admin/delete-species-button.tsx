"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSpesies } from "@/app/actions/species";

export function DeleteSpeciesButton({
  id,
  nama,
}: {
  id: number;
  nama: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Hapus ${nama}`}
      onClick={() => {
        if (!confirm(`Hapus "${nama}"? Tindakan ini tidak bisa dibatalkan.`))
          return;
        start(async () => {
          await deleteSpesies(id);
          toast.success(`"${nama}" dihapus.`);
        });
      }}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
