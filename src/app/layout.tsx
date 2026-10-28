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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://likyai.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "likyAI · Studio IA en Afrique | Paiement via Mobile Money",
    template: "%s | likyAI",
  },
  description:
    "likyAI est le 1er studio d'intelligence artificielle en Afrique. Générez vidéos cinématiques, images, musiques et voix off avec paiement instantané par Mobile Money (Orange Money, MTN, Wave, Moov) sans carte bancaire.",
  applicationName: "likyAI",
  authors: [{ name: "likyAI", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "likyai",
    "studio ia en afrique",
    "paiement ia via mobile money",
    "studio ia afrique",
    "intelligence artificielle afrique",
    "generateur video ia afrique",
    "generateur image ia afrique",
    "mobile money ia",
    "orange money ia",
    "mtn mobile money ia",
    "wave ia",
    "moov money ia",
    "creation contenu ia afrique",
    "ai influencer afrique",
    "ugc studio afrique",
    "cinema studio ia",
    "genjutsu motion ia",
    "ia sans carte bancaire",
    "softpay mobile money",
  ],
  creator: "likyAI",
  publisher: "likyAI",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    title: "likyAI · Studio IA en Afrique | Paiement via Mobile Money",
    description:
      "Le 1er studio d'intelligence artificielle en Afrique. Créez des vidéos cinématiques, images, musiques et voix off avec recharge instantanée par Mobile Money (Orange Money, MTN, Wave, Moov).",
    siteName: "likyAI",
    images: [
      {
        url: "/assets/organic/organic-1.webp",
        width: 1200,
        height: 630,
        alt: "likyAI - Studio IA en Afrique avec paiement Mobile Money",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "likyAI · Studio IA en Afrique | Paiement via Mobile Money",
    description:
      "Générez vidéos, images, musiques et voix off avec l'IA en Afrique. Paiement direct par Mobile Money sans carte bancaire.",
    images: ["/assets/organic/organic-1.webp"],
    creator: "@likyai",
  },
  icons: {
    icon: [
      { url: "/assets/logo-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/assets/logo-white.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/assets/logo-black.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "likyAI",
      url: siteUrl,
      logo: `${siteUrl}/assets/logo-black.png`,
      description:
        "Premier studio de création assistée par intelligence artificielle en Afrique avec paiement natif par Mobile Money.",
      sameAs: ["https://twitter.com/likyai"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "likyAI",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "fr-FR",
      description:
        "Studio IA en Afrique : génération de vidéos, images, musiques et voix off payables par Mobile Money.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "likyAI Studio IA",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web, iOS, Android, macOS, Windows",
      description:
        "Plateforme de génération créative par IA (Vidéo, Image, Musique, Voix off, Influenceur IA) avec paiement instantané par Mobile Money (Orange Money, MTN, Wave, Moov).",
      offers: {
        "@type": "Offer",
        price: "1000",
        priceCurrency: "XOF",
        description: "Recharge de crédits IA via Mobile Money sans carte bancaire",
      },
      creator: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Qu'est-ce que likyAI ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "likyAI est le premier studio créatif tout-en-un d'intelligence artificielle en Afrique. Il permet de générer des vidéos cinématiques, des images haute résolution, des musiques originales et des voix off professionnelles.",
          },
        },
        {
          "@type": "Question",
          name: "Comment payer sur likyAI en Afrique sans carte bancaire ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "likyAI intègre nativement le paiement par Mobile Money (Orange Money, MTN Mobile Money, Wave, Moov Money). Les créateurs peuvent acheter des crédits instantanément avec leur compte mobile sans avoir besoin d'une carte Visa ou Mastercard internationale.",
          },
        },
        {
          "@type": "Question",
          name: "Quels studios IA sont disponibles sur likyAI ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "likyAI propose plusieurs studios spécialisés : Cinema Studio (vidéos cinématiques 4K), Ad Builder (publicités de marques), UGC Studio (créateurs virtuels spontanés), Animation Studio, AI Influencer Builder (création d'influenceurs virtuels cohérents) et Genjutsu (transfert de mouvement vidéo).",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('likyai-theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
