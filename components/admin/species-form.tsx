"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeatureCollection } from "geojson";
import { Loader2, Upload, X, Check } from "lucide-react";
import { toast } from "sonner";
import { DrawMap } from "@/components/admin/draw-map";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SpeciesState } from "@/app/actions/species";
import type { Spesies, Kategori } from "@/lib/db";

type Action = (prev: SpeciesState, fd: FormData) => Promise<SpeciesState>;

const STEPS = ["Data Teks", "Media", "Sebaran Spasial"];

export function SpeciesForm({
  action,
  categories,
  initial,
}: {
  action: Action;
  categories: {
    famili: Kategori[];
    ordo: Kategori[];
    status: Kategori[];
    wilayah: Kategori[];
  };
  initial?: Spesies;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SpeciesState, FormData>(
    action,
    {},
  );
  const [step, setStep] = useState(0);
  const [foto, setFoto] = useState<string[]>(initial?.foto ?? []);
  const [distribusi, setDistribusi] = useState<FeatureCollection | null>(
    initial?.distribusi ?? null,
  );
  const [uploading, setUploading] = useState(false);

  // Server validation errors live in step 1 — jump back so they're visible.
  useEffect(() => {
    if (state.error) {
      setStep(0);
      toast.error(state.error);
    }
  }, [state.error]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Gagal mengunggah.");
          continue;
        }
        setFoto((prev) => [...prev, json.url]);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <Stepper step={step} />

      {/* Hidden carriers for complex fields. */}
      <input type="hidden" name="foto" value={JSON.stringify(foto)} />
      <input
        type="hidden"
        name="distribusi"
        value={distribusi ? JSON.stringify(distribusi) : ""}
      />

      {/* Step 1 — text */}
      <fieldset hidden={step !== 0} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Ilmiah">
            <Input
              name="namaIlmiah"
              defaultValue={initial?.namaIlmiah}
              placeholder="Paradisaea rubra"
            />
          </Field>
          <Field label="Nama Lokal">
            <Input
              name="namaLokal"
              defaultValue={initial?.namaLokal}
              placeholder="Cendrawasih Merah"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kerajaan">
            <NativeSelect name="kerajaan" defaultValue={initial?.kerajaan ?? "fauna"}>
              <option value="fauna">Fauna</option>
              <option value="flora">Flora</option>
            </NativeSelect>
          </Field>
          <Field label="Famili">
            <CategorySelect name="familiId" options={categories.famili} value={initial?.familiId} />
          </Field>
          <Field label="Ordo">
            <CategorySelect name="ordoId" options={categories.ordo} value={initial?.ordoId} />
          </Field>
          <Field label="Status Konservasi">
            <CategorySelect name="statusId" options={categories.status} value={initial?.statusId} />
          </Field>
          <Field label="Wilayah">
            <CategorySelect name="wilayahId" options={categories.wilayah} value={initial?.wilayahId} />
          </Field>
        </div>

        <Field label="Alasan Status Konservasi">
          <Textarea
            name="statusAlasan"
            defaultValue={initial?.statusAlasan ?? ""}
            rows={2}
            placeholder="mis. perburuan liar dan hilangnya habitat (opsional)"
          />
        </Field>

        <Field label="Habitat">
          <Input name="habitat" defaultValue={initial?.habitat} placeholder="Hutan hujan dataran rendah" />
        </Field>
        <Field label="Deskripsi">
          <Textarea name="deskripsi" defaultValue={initial?.deskripsi} rows={5} />
        </Field>
      </fieldset>

      {/* Step 2 — media */}
      <fieldset hidden={step !== 1} className="space-y-4">
        <Label className="flex w-max cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Unggah foto
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Label>
        {foto.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada foto (opsional).</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {foto.map((src) => (
              <div key={src} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-28 w-full rounded-md border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto((p) => p.filter((f) => f !== src))}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-muted-foreground shadow hover:text-destructive"
                  aria-label="Hapus foto"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* Step 3 — spatial */}
      <fieldset hidden={step !== 2}>
        <DrawMap value={distribusi} onChange={setDistribusi} />
      </fieldset>

      {/* Nav */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step === 0 ? router.push("/admin/spesies") : setStep((s) => s - 1))}
        >
          {step === 0 ? "Batal" : "Kembali"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Lanjut
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan…
              </>
            ) : (
              <>
                <Check className="size-4" /> Simpan Spesies
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-medium",
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
          <span className={cn(i === step ? "font-medium" : "text-muted-foreground")}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="mx-1 text-border">—</span>}
        </li>
      ))}
    </ol>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function CategorySelect({
  name,
  options,
  value,
}: {
  name: string;
  options: Kategori[];
  value?: number | null;
}) {
  return (
    <NativeSelect name={name} defaultValue={value ?? ""}>
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nama}
        </option>
      ))}
    </NativeSelect>
  );
}
