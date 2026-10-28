import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studios IA · Cinéma, Vidéo, Ads, UGC & Influenceurs en Afrique",
  description:
    "Explorez tous les studios de création IA de likyAI : Cinéma 4K, Ad Builder, UGC Studio, Animation, Influenceurs IA et Motion Genjutsu. Rechargez vos crédits par Mobile Money.",
  alternates: {
    canonical: "/studios",
  },
};

export default function StudiosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
