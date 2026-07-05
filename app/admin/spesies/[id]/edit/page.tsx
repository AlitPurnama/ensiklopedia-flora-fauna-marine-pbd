import { notFound } from "next/navigation";
import { updateSpesies } from "@/app/actions/species";
import { getKategoriByTipe, getSpesiesForEdit } from "@/lib/queries";
import { SpeciesForm } from "@/components/admin/species-form";

export const dynamic = "force-dynamic";

export default async function EditSpesiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spesiesId = Number(id);
  const [initial, famili, ordo, status, wilayah] = await Promise.all([
    getSpesiesForEdit(spesiesId),
    getKategoriByTipe("famili"),
    getKategoriByTipe("ordo"),
    getKategoriByTipe("status_konservasi"),
    getKategoriByTipe("wilayah"),
  ]);
  if (!initial) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold tracking-tight">
        Edit Spesies
      </h1>
      <SpeciesForm
        action={updateSpesies.bind(null, spesiesId)}
        categories={{ famili, ordo, status, wilayah }}
        initial={initial}
      />
    </div>
  );
}
