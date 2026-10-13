import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "likyAI — Tes idées prennent vie.",
  description: "Plateforme créative tout-en-un : Image, Vidéo, Musique, Voix off payables en crédits mobile money.",
  icons: {
    icon: [
      { url: "/assets/logo-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/assets/logo-white.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/assets/logo-black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      data-theme="light"
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
