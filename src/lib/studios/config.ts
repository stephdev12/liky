import { StudioConfig, StudioSlug, StudioTemplate } from "./types";

export const STUDIOS: StudioConfig[] = [
  {
    id: "ugc",
    name: "Pubs & UGC",
    shortDesc: "Vidéos publicitaires virales prêtes à publier",
    tagline: "Collez l'URL de votre produit ou vos photos pour générer des pubs vidéo TikTok, Reels et Shorts.",
    icon: "camera",
    startingCredits: 18,
    badge: "Viral",
    formats: [
      { label: "TikTok & Reels (9:16)", ratio: "9:16" },
      { label: "YouTube (16:9)", ratio: "16:9" },
      { label: "Carré / Feed (1:1)", ratio: "1:1" },
      { label: "Facebook (4:5)", ratio: "4:5" },
    ],
    defaultPlaceholder: "Collez l'URL de votre produit (Shopify, Amazon...) ou décrivez votre offre...",
    supportedModels: {
      draft: { id: "seedance-2-mini", name: "Seedance 2.0 Mini", credits: 4 },
      final: { id: "seedance-2-5", name: "Seedance 2.5 (Audio natif)", credits: 18 },
    },
    features: [
      "Extraction automatique de produit (images, USP, prix)",
      "9 formats viraux (Avis, Unboxing, Spot TV, Try-on)",
      "Voix off réaliste et synchronisation labiale",
      "Sous-titres dynamiques incrustés",
    ],
  },
  {
    id: "characters",
    name: "Personnages",
    shortDesc: "Influenceurs IA réutilisables & Motion Control",
    tagline: "Créez une identité visuelle stable et animez-la avec vos propres vidéos de mouvement.",
    icon: "user-01",
    startingCredits: 6,
    badge: "Cohérence",
    formats: [
      { label: "Portrait (9:16)", ratio: "9:16" },
      { label: "Carré (1:1)", ratio: "1:1" },
      { label: "Paysage (16:9)", ratio: "16:9" },
    ],
    defaultPlaceholder: "Décrivez l'action, le décor ou la pose de votre personnage...",
    supportedModels: {
      draft: { id: "seedream-5-flash", name: "Seedream 5 Flash", credits: 2 },
      final: { id: "nano-banana-2-1", name: "Nano Banana 2.1 (Multi-ref)", credits: 6 },
    },
    features: [
      "Création guidée sans prompt par 19 attributs",
      "Planche multi-vues (face, 3/4, profil, expressions)",
      "Motion Control : rejoue le mouvement d'une vidéo",
      "Avatar parlant synchronisé sur n'importe quel audio",
    ],
  },
  {
    id: "posters",
    name: "Affiches & Visuels",
    shortDesc: "Typographie nette, affiches et bannières",
    tagline: "Concevez des visuels marketing avec typographie exacte et contrôle qualité OCR automatique.",
    icon: "file-blank",
    startingCredits: 5,
    formats: [
      { label: "Story (9:16)", ratio: "9:16" },
      { label: "Portrait 4:5", ratio: "4:5" },
      { label: "A4 / A3 Impression", ratio: "3:4" },
      { label: "Bannière web (16:9)", ratio: "16:9" },
      { label: "Carré (1:1)", ratio: "1:1" },
    ],
    defaultPlaceholder: "Titre principal, date, lieu, tarif et ambiance souhaitée...",
    supportedModels: {
      draft: { id: "nano-banana-2-1", name: "Nano Banana 2.1", credits: 5 },
      final: { id: "gpt-image-2-5-flare", name: "GPT Image 2.5 Flare", credits: 10 },
    },
    features: [
      "Rendu parfait du texte et de la typographie",
      "Vérification OCR automatique de l'exactitude des textes",
      "Modèles universels (Festivals, SaaS, Restauration, Retail)",
      "Export haute définition imprimable 300 DPI",
    ],
  },
  {
    id: "saas",
    name: "Vidéo SaaS",
    shortDesc: "Démos d'applications et tutoriels logiciels",
    tagline: "Combinez vos vraies captures d'écran et l'ambiance IA pour une vidéo démo captivante.",
    icon: "monitor",
    startingCredits: 20,
    formats: [
      { label: "Paysage 16:9 (Site / YouTube)", ratio: "16:9" },
      { label: "Vertical 9:16 (TikTok / Reels)", ratio: "9:16" },
    ],
    defaultPlaceholder: "Décrivez le problème que résout votre logiciel et ses 3 fonctionnalités phares...",
    supportedModels: {
      draft: { id: "gabarit-fast", name: "Scènes UI + Z-Image", credits: 10 },
      final: { id: "hybrid-seedance", name: "Compositeur Hybride + Voix", credits: 24 },
    },
    features: [
      "Scènes d'interface nettes et fidèles à votre logiciel",
      "Curseurs et zooms programmatiques fluides",
      "Plans d'ambiance et transitions cinématiques par IA",
      "Voix off explicative et musique d'ambiance synchronisée",
    ],
  },
  {
    id: "assets",
    name: "Assets Web & App",
    shortDesc: "Packs d'icônes, backgrounds 4K et illustrations",
    tagline: "Générez des bibliothèques complètes d'éléments graphiques cohérents pour vos sites et apps.",
    icon: "image-01",
    startingCredits: 8,
    formats: [
      { label: "Pack 12 Icônes (Grille)", ratio: "1:1" },
      { label: "Fond Hero (16:9)", ratio: "16:9" },
      { label: "Icône d'App (1:1)", ratio: "1:1" },
      { label: "Image OG (1200×630)", ratio: "1.91:1" },
    ],
    defaultPlaceholder: "Secteur d'activité, style graphique (Glassmorphism, 3D Clay, Minimalist Outline)...",
    supportedModels: {
      draft: { id: "z-image", name: "Z-Image Turbo", credits: 3 },
      final: { id: "nano-banana-2-1", name: "Nano Banana 2.1 + Detourage", credits: 8 },
    },
    features: [
      "Découpe automatique de planches d'icônes",
      "Détourage transparent automatique (Remove BG)",
      "Cohérence stricte de style sur tout le pack",
      "Export direct prêt pour Figma, React ou Tailwind",
    ],
  },
  {
    id: "motion",
    name: "Motion Design",
    shortDesc: "Révélations de logos et typographie cinétique",
    tagline: "Donnez vie à vos logos, annonces et écrans de veille avec des animations fluides.",
    icon: "play",
    startingCredits: 12,
    formats: [
      { label: "Format Story (9:16)", ratio: "9:16" },
      { label: "Paysage (16:9)", ratio: "16:9" },
      { label: "Carré (1:1)", ratio: "1:1" },
    ],
    defaultPlaceholder: "Téléversez votre logo ou saisissez le texte de l'animation...",
    supportedModels: {
      draft: { id: "motion-fast", name: "Gabarit Rapide", credits: 5 },
      final: { id: "motion-seedance", name: "Seedance Motion FX", credits: 14 },
    },
    features: [
      "Révélation de logo 2D et 3D spectaculaire",
      "Typographie cinétique rythmée",
      "Boucles d'arrière-plan sans coupure visible",
      "Design sonore et bruitages SFX adaptés",
    ],
  },
];

export const TEMPLATES: StudioTemplate[] = [
  // UGC & Pubs
  {
    id: "ugc-review",
    studioSlug: "ugc",
    title: "Avis Client / Témoignage",
    description: "Un créateur face caméra présente le produit et partage son retour d'expérience enthousiaste.",
    category: "E-commerce",
    badge: "Bestseller",
    format: "9:16",
    costEstimateCredits: 18,
    promptTemplate: "Créateur face caméra présentant un produit, ton authentique et naturel, lumière du jour, retour d'expérience concret.",
  },
  {
    id: "ugc-unboxing",
    studioSlug: "ugc",
    title: "Unboxing Immersif",
    description: "Déballage soigné du produit avec focus sur les textures, packaging et accessoires.",
    category: "Produit",
    format: "9:16",
    costEstimateCredits: 20,
    promptTemplate: "Mains déballant un colis soigné, plan serré sur l'ouverture du packaging, mise en valeur du produit neuf.",
  },
  {
    id: "click-to-ad",
    studioSlug: "ugc",
    title: "Spot Publicitaire Dynamique",
    description: "Montage rythmé en 3 temps : accroche choc, problème résolu, offre promotionnelle et CTA.",
    category: "Marketing",
    badge: "Haute Conversion",
    format: "9:16",
    costEstimateCredits: 22,
    promptTemplate: "Vidéo publicitaire percutante, rythme soutenu, transitions dynamiques, mise en avant des fonctionnalités clés.",
  },

  // Personnages
  {
    id: "char-create",
    studioSlug: "characters",
    title: "Influenceur Digital Polyvalent",
    description: "Créez une personnalité numérique complète avec planche de références multi-angles.",
    category: "Identité",
    badge: "Multi-vues",
    format: "9:16",
    costEstimateCredits: 8,
    promptTemplate: "Portrait studio professionnel, éclairage doux, regard direct, expression chaleureuse et confiante.",
  },
  {
    id: "char-motion",
    studioSlug: "characters",
    title: "Animation par Mouvement (Motion Control)",
    description: "Transférez la gestuelle ou la chorégraphie d'une vidéo témoin sur votre personnage.",
    category: "Cinématique",
    badge: "Kling 3.0",
    format: "9:16",
    costEstimateCredits: 22,
    promptTemplate: "Transfert cinématique de mouvement, respect des proportions, dynamique corporelle fluide.",
  },

  // Affiches & Visuels
  {
    id: "poster-event",
    studioSlug: "posters",
    title: "Affiche Événement / Festival",
    description: "Visuel percutant avec composition typographique équilibrée pour concerts ou conférences.",
    category: "Événement",
    format: "9:16",
    costEstimateCredits: 10,
    promptTemplate: "Affiche événementielle moderne, typographie claire et lisible, date, lieu et intervenants bien hiérarchisés.",
  },
  {
    id: "poster-tech",
    studioSlug: "posters",
    title: "Lancement de Produit Tech",
    description: "Design minimaliste et futuriste mettant en valeur une nouveauté matérielle ou logicielle.",
    category: "Tech & SaaS",
    badge: "Typo Nette",
    format: "1:1",
    costEstimateCredits: 10,
    promptTemplate: "Design promotionnel tech haut de gamme, fond épuré, contraste typographique fort, détails soignés.",
  },

  // Vidéo SaaS
  {
    id: "saas-overview",
    studioSlug: "saas",
    title: "Vidéo Démo Produit (30s)",
    description: "Présentez l'essentiel de votre logiciel en 3 fonctionnalités clés avec voix off fluide.",
    category: "Logiciel",
    badge: "Hybride",
    format: "16:9",
    costEstimateCredits: 24,
    promptTemplate: "Walkthrough logiciel captivant, zoom sur le tableau de bord, transitions soignées entre les fonctionnalités.",
  },

  // Assets Web & App
  {
    id: "asset-iconpack",
    studioSlug: "assets",
    title: "Pack de 12 Icônes Coordonnées",
    description: "Une bibliothèque cohérente de 12 pictogrammes découpés et détourés sur fond transparent.",
    category: "UI Design",
    badge: "Détourage Auto",
    format: "1:1",
    costEstimateCredits: 8,
    promptTemplate: "Planche de 12 icônes design system, style harmonieux, formes géométriques pures, fond blanc pur.",
  },

  // Motion Design
  {
    id: "motion-logo-reveal",
    studioSlug: "motion",
    title: "Révélation de Logo Cinématique",
    description: "Intro spectaculaire de 5 secondes animant votre logo avec effets de particules et lumière.",
    category: "Branding",
    format: "16:9",
    costEstimateCredits: 14,
    promptTemplate: "Animation de révélation de logo fluide et prestigieuse, reflets de lumière, particules subtiles.",
  },
];

export function getStudioBySlug(slug: string): StudioConfig | undefined {
  return STUDIOS.find((s) => s.id === slug);
}

export function getTemplatesByStudio(slug: string): StudioTemplate[] {
  return TEMPLATES.filter((t) => t.studioSlug === slug);
}
