import type { LinkItemType } from "@/components/sheard";
import { CoolIcon } from "@/components/icons/coolicon";

export const productLinks: LinkItemType[] = [
	{
		label: "Génération d'images",
		href: "/studio",
		description: "Nano Banana 2, Z-Image & Seedream en 2K/4K",
		icon: <CoolIcon name="image-01" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Création Vidéo",
		href: "/studio",
		description: "Seedance 2.0, Kling 3.0 Turbo & Wan 2.7",
		icon: <CoolIcon name="monitor-play" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Musique & Sons",
		href: "/studio",
		description: "Suno v4, compositions originales & ambiances",
		icon: <CoolIcon name="headphones" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Voix off & Narration",
		href: "/studio",
		description: "Voix réalistes multilingues et expressives",
		icon: <CoolIcon name="user-voice" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Protocole MCP",
		href: "#integrations",
		description: "Générez depuis Claude Code, Cursor & ChatGPT",
		icon: <CoolIcon name="terminal" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Galerie & Showcase",
		href: "#gallery",
		description: "Explorez les projets récents de la communauté",
		icon: <CoolIcon name="swatches-palette" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
];

export const companyLinks: LinkItemType[] = [
	{
		label: "Tarifs & Crédits",
		href: "#pricing",
		description: "Paiement Mobile Money direct (sans abonnement)",
		icon: <CoolIcon name="credit-card-01" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Fonctionnalités",
		href: "#features",
		description: "Multi-modèles, canvas unifié et vitesse d'exécution",
		icon: <CoolIcon name="layers" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Espaces isolés",
		href: "/auth",
		description: "Vos données et créations strictement sécurisées",
		icon: <CoolIcon name="shield-check" size={19} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
];

export const companyLinks2: LinkItemType[] = [
	{
		label: "Documentation MCP",
		href: "#integrations",
		icon: <CoolIcon name="code" size={15} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Support WhatsApp / Email",
		href: "#",
		icon: <CoolIcon name="circle-help" size={15} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Conditions d'utilisation",
		href: "#",
		icon: <CoolIcon name="file-document" size={15} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
	{
		label: "Confidentialité des données",
		href: "#",
		icon: <CoolIcon name="lock" size={15} duotone secondaryColor="currentColor" secondaryOpacity={0.25} />,
	},
];
