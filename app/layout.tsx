import type { Metadata } from "next";
import { Inter, Playfair_Display, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
// Reserved for Latin binomials only — the specimen-label voice.
const fraunces = Fraunces({ subsets: ["latin"], style: "italic", variable: "--font-binomial" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Ensiklopedia Flora & Fauna Papua Barat Daya",
  description:
    "Katalog dan peta sebaran keanekaragaman hayati Papua Barat Daya — spesies flora dan fauna beserta lokasi persebarannya.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        playfair.variable,
        fraunces.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
