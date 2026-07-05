import { createSpesies } from "@/app/actions/species";
import { getKategoriByTipe } from "@/lib/queries";
import { SpeciesForm } from "@/components/admin/species-form";

export const dynamic = "force-dynamic";

export default async function TambahSpesiesPage() {
  const [famili, ordo, status, wilayah] = await Promise.all([
    getKategoriByTipe("famili"),
    getKategoriByTipe("ordo"),
    getKategoriByTipe("status_konservasi"),
    getKategoriByTipe("wilayah"),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold tracking-tight">
        Tambah Spesies
      </h1>
      <SpeciesForm
        action={createSpesies}
        categories={{ famili, ordo, status, wilayah }}
      />
    </div>
  );
}
