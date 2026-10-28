import type { Metadata } from "next";
import Link from "next/link";
import { CoolIcon } from "@/components/icons/coolicon";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Politique de Confidentialité · likyAI Studio IA",
  description:
    "Découvrez comment likyAI protège vos données personnelles, vos prompts, vos médias générés et la sécurité de vos paiements Mobile Money.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--lime)] selection:text-black">
      {/* ── HEADER NAVIGATION ÉPURÉ ── */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <CoolIcon name="arrow-left-sm" size={14} duotone={false} />
              <span>Accueil</span>
            </Link>
            <div className="h-4 w-px bg-[var(--line)] hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/studios"
              className="h-8 sm:h-9 px-3.5 rounded-full bg-[#D8FF64] hover:bg-[#cbf54a] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>Accéder aux Studios</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── CONTENU POLITIQUE DE CONFIDENTIALITÉ ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-10">
        {/* Titre & Introduction */}
        <div className="space-y-4 border-b border-[var(--line)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--field)] border border-[var(--line)] text-xs text-[var(--ink-2)]">
            <CoolIcon name="shield-check" size={13} duotone secondaryColor="#D8FF64" className="text-emerald-500 dark:text-[#D8FF64]" />
            <span>Protection des données & Sécurité</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
            Politique de Confidentialité
          </h1>
          <p className="text-sm sm:text-base text-[var(--mute)] leading-relaxed">
            Dernière mise à jour : 28 octobre 2026. Chez <strong className="text-[var(--ink)]">likyAI</strong>, nous nous engageons à protéger votre vie privée et à garantir une transparence absolue concernant le traitement de vos données personnelles, vos créations artistiques et la sécurité de vos paiements par Mobile Money.
          </p>
        </div>

        {/* Section 1 : Responsable de traitement */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">1</span>
            Responsable du Traitement
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            La plateforme <strong>likyAI</strong> (accessible via <code>https://likyai.com</code> et ses sous-domaines) est éditée par likyAI Studio. Pour toute question relative à cette politique ou pour exercer vos droits sur vos données, vous pouvez contacter notre délégué à la protection des données à l&apos;adresse suivante :{" "}
            <a href="mailto:support@likyai.com" className="text-emerald-600 dark:text-[#D8FF64] underline underline-offset-4 font-medium">
              support@likyai.com
            </a>.
          </p>
        </section>

        {/* Section 2 : Données collectées */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">2</span>
            Données Personnelles Collectées
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Dans le cadre de votre utilisation de nos studios et services, nous collectons les catégories de données suivantes :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#D8FF64] block">Compte & Profil</span>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                Adresse e-mail, identifiant de compte chiffré, historique de solde de crédits et préférences d&apos;affichage.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#D8FF64] block">Prompts & Médias</span>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                Descriptions textuelles (prompts), images et vidéos de référence téléversées, et fichiers générés par nos modèles d&apos;IA.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#D8FF64] block">Transactions Mobile Money</span>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                Numéro de téléphone de transaction (utilisé uniquement pour router la demande vers l&apos;opérateur), montant en FCFA / monnaie locale, horodatage et référence de transaction.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#D8FF64] block">Données Techniques</span>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                Adresse IP, type de navigateur, langue, logs de requêtes et préférence de thème enregistrée localement (<code>likyai-theme</code>).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 : Paiement Mobile Money et Sécurité Financière */}
        <section className="space-y-3 p-5 rounded-3xl bg-[var(--field)] border border-[var(--line)]">
          <div className="flex items-center gap-2">
            <CoolIcon name="lock" size={16} duotone secondaryColor="#D8FF64" className="text-emerald-500 dark:text-[#D8FF64]" />
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--ink)]">
              Sécurité des Paiements Mobile Money (Afrique)
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            La force majeure de likyAI est de démocratiser l&apos;intelligence artificielle en Afrique via le paiement natif par <strong>Orange Money</strong>, <strong>MTN Mobile Money</strong>, <strong>Wave</strong> et <strong>Moov Money</strong>.
          </p>
          <ul className="text-xs sm:text-sm text-[var(--ink-2)] space-y-2 list-disc list-inside leading-relaxed pt-1">
            <li>
              <strong>Aucun code secret / PIN Mobile Money</strong> n&apos;est jamais demandé, saisi ou stocké sur les serveurs de likyAI. La validation s&apos;effectue soit sur votre téléphone par validation USSD sécurisée, soit par code OTP éphémère.
            </li>
            <li>
              Les paiements sont traités par des passerelles de paiement agréées et certifiées conformes aux normes internationales de sécurité bancaire et télécom.
            </li>
            <li>
              Vos crédits sont alloués automatiquement et instantanément dès confirmation du paiement par votre opérateur mobile.
            </li>
          </ul>
        </section>

        {/* Section 4 : Propriété intellectuelle des créations */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">3</span>
            Propriété de Vos Créations & Prompts
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Vous conservez l&apos;entière propriété de tous les prompts que vous saisissez et de toutes les images, vidéos, musiques et voix off générées sur votre compte likyAI. likyAI ne revendique aucun droit d&apos;auteur sur vos créations et ne revend pas vos œuvres à des tiers.
          </p>
        </section>

        {/* Section 5 : Modèles IA & Fournisseurs */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">4</span>
            Traitement par les Modèles d&apos;Intelligence Artificielle
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Pour exécuter vos requêtes créatives (synthèse vidéo, génération d&apos;image, composition musicale, doublage vocal), vos instructions sont transmises de manière chiffrée et sécurisée à nos moteurs partenaires d&apos;inférence IA (notamment KIE et les clusters de calcul associés). Vos données ne sont pas utilisées pour réentraîner des modèles publics sans votre consentement exprès.
          </p>
        </section>

        {/* Section 6 : Conservation et hébergement */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">5</span>
            Conservation et Sécurité du Stockage
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Vos médias générés sont conservés de manière pérenne et sécurisée sur l&apos;infrastructure de stockage cloud Supabase (bucket <code>creations</code>) avec un chiffrement au repos et en transit via HTTPS / TLS 1.3. Vous pouvez télécharger ou supprimer vos créations à tout moment depuis votre bibliothèque personnelle.
          </p>
        </section>

        {/* Section 7 : Vos droits */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">6</span>
            Vos Droits
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Conformément aux réglementations relatives à la protection des données personnelles (notamment le RGPD et les lois sur la protection des données personnelles en vigueur dans les pays de l&apos;Union Africaine et de l&apos;UEMOA), vous disposez des droits suivants :
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--ink-2)] pt-1">
            <li className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <strong>Droit d&apos;accès :</strong> Obtenir la confirmation que vos données sont traitées et en recevoir une copie.
            </li>
            <li className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <strong>Droit de rectification :</strong> Corriger vos informations personnelles si elles sont inexactes.
            </li>
            <li className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <strong>Droit à l&apos;effacement :</strong> Demander la suppression totale de votre compte et de vos données.
            </li>
            <li className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              <strong>Droit à la portabilité :</strong> Télécharger vos fichiers et historiques dans un format standard.
            </li>
          </ul>
        </section>

        {/* Section 8 : Cookies & Préférences */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--field)] text-xs font-mono font-bold text-[var(--ink)]">7</span>
            Cookies & Stockage Local
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            likyAI n&apos;utilise aucun cookie publicitaire invasif ni traceur de revente de données. Nous utilisons uniquement le stockage local strict nécessaire au fonctionnement du service : le maintien de votre session d&apos;authentification et la conservation de votre préférence de thème (<code>likyai-theme</code> : clair ou sombre).
          </p>
        </section>

        {/* Section 9 : Contact */}
        <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--ink)]">
            Contact & Assistance
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            Pour toute question, demande de suppression de compte ou réclamation, vous pouvez joindre l&apos;équipe likyAI par e-mail :
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="mailto:support@likyai.com"
              className="px-4 py-2 rounded-full bg-[var(--field)] hover:bg-[var(--hover)] border border-[var(--line)] text-xs font-medium text-[var(--ink)] transition-colors inline-flex items-center gap-2"
            >
              <span>support@likyai.com</span>
            </a>
            <span className="text-xs text-[var(--mute)]">Réponse sous 24 à 48 heures ouvrées</span>
          </div>
        </section>
      </main>

      {/* ── FOOTER SIMPLE ── */}
      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--mute)]">
        <p>&copy; 2026 likyAI. Tous droits réservés. Studio IA en Afrique.</p>
      </footer>
    </div>
  );
}
