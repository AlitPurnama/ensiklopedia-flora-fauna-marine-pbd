// Map dot color + legend use a coarser "kelas" bucket than kelompok — 33
// kelompok is too many distinct colors/legend rows to read on a map. Kelompok
// itself (filters, badges, detail page) is untouched; this is map-display only.
const KELOMPOK_TO_KELAS: Record<string, string> = {
  cendrawasih: "Burung",
  "kakatua-nuri": "Burung",
  "burung-pemangsa": "Burung",
  rangkong: "Burung",
  kasuari: "Burung",
  "merpati-pergam": "Burung",
  "burung-penyanyi": "Burung",
  "maleo-gosong": "Burung",
  "raja-udang": "Burung",

  "kanguru-kuskus": "Mamalia",
  nokdiak: "Mamalia",
  kelelawar: "Mamalia",
  "mamalia-laut": "Mamalia",
  tikus: "Mamalia",

  "penyu-kura-kura": "Reptil & Amfibi",
  buaya: "Reptil & Amfibi",
  ular: "Reptil & Amfibi",
  biawak: "Reptil & Amfibi",
  katak: "Reptil & Amfibi",

  hiu: "Ikan",
  pari: "Ikan",
  "ikan-karang-hias": "Ikan",

  "kepiting-udang": "Invertebrata",
  "kerang-moluska": "Invertebrata",
  "serangga-unik": "Invertebrata",

  karang: "Karang",

  anggrek: "Tumbuhan",
  "kantong-semar": "Tumbuhan",
  "paku-pakuan": "Tumbuhan",
  "konifer-cemara": "Tumbuhan",
  palem: "Tumbuhan",
  mangrove: "Tumbuhan",
  "pohon-berkayu-berbunga": "Tumbuhan",
};

const KELAS_WARNA: Record<string, string> = {
  Burung: "#c6662e",
  Mamalia: "#6b4423",
  "Reptil & Amfibi": "#4a5d4e",
  Ikan: "#3a6ea5",
  Invertebrata: "#8b5fbf",
  Karang: "#e07856",
  Tumbuhan: "#2d6a4f",
};

export const KELAS_FALLBACK = "#424843"; // ungrouped

export function kelasDariKelompok(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return KELOMPOK_TO_KELAS[slug] ?? null;
}

export function warnaKelas(kelas: string | null | undefined): string {
  if (!kelas) return KELAS_FALLBACK;
  return KELAS_WARNA[kelas] ?? KELAS_FALLBACK;
}
