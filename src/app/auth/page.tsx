import { AuthPage } from "@/components/auth";

export const metadata = {
  title: "Connexion & Inscription · likyAI Studio",
  description: "Connectez-vous à votre studio likyAI pour générer vos créations par intelligence artificielle.",
};

export default function Page() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)]">
      <AuthPage />
    </main>
  );
}
