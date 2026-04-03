import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusERP — Perencanaan Sumber Daya Perusahaan Berbasis AI",
  description: "Sistem ERP modern berbasis AI dengan otomasi cerdas, analitik waktu nyata, dan kecerdasan lintas modul untuk bisnis dari berbagai skala.",
  keywords: ["ERP", "AI", "kecerdasan bisnis", "otomasi", "analitik", "SDM", "keuangan", "inventaris"],
};

import AuthGuard from "@/components/auth/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-bg-primary text-text-primary antialiased" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
