import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { BRAND_NAME } from "@/lib/contact";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Assistant Commercial`,
  description:
    `Interface commerciale ${BRAND_NAME} pour qualifier les besoins clients et soumettre la demande sur WhatsApp.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>{children}</body>
    </html>
  );
}
