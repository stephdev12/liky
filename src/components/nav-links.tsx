import type { LinkItemType } from "@/components/sheard";
import {
	ImageIcon,
	VideoIcon,
	MusicIcon,
	MicIcon,
	BotIcon,
	SparklesIcon,
	CreditCardIcon,
	LayersIcon,
	ShieldCheckIcon,
	CodeIcon,
	HelpCircleIcon,
	FileTextIcon,
	LockIcon,
} from "lucide-react";

export const productLinks: LinkItemType[] = [
	{
		label: "Génération d'images",
		href: "/studio",
		description: "Nano Banana 2, Z-Image & Seedream en 2K/4K",
		icon: <ImageIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
	{
		label: "Création Vidéo",
		href: "/studio",
		description: "Seedance 2.0, Kling 3.0 Turbo & Wan 2.7",
		icon: <VideoIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
	{
		label: "Musique & Sons",
		href: "/studio",
		description: "Suno v4, compositions originales & ambiances",
		icon: <MusicIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
	{
		label: "Voix off & Narration",
		href: "/studio",
		description: "Voix réalistes multilingues et expressives",
		icon: <MicIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
	{
		label: "Protocole MCP",
		href: "#integrations",
		description: "Générez depuis Claude Code, Cursor & ChatGPT",
		icon: <BotIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
	{
		label: "Galerie & Showcase",
		href: "#gallery",
		description: "Explorez les projets récents de la communauté",
		icon: <SparklesIcon className="size-4 text-emerald-600 dark:text-[var(--lime)]" />,
	},
];

export const companyLinks: LinkItemType[] = [
	{
		label: "Tarifs & Crédits",
		href: "#pricing",
		description: "Paiement Mobile Money direct (sans abonnement)",
		icon: <CreditCardIcon className="size-4" />,
	},
	{
		label: "Fonctionnalités",
		href: "#features",
		description: "Multi-modèles, canvas unifié et vitesse d'exécution",
		icon: <LayersIcon className="size-4" />,
	},
	{
		label: "Espaces isolés",
		href: "/auth",
		description: "Vos données et créations strictement sécurisées",
		icon: <ShieldCheckIcon className="size-4" />,
	},
];

export const companyLinks2: LinkItemType[] = [
	{
		label: "Documentation MCP",
		href: "#integrations",
		icon: <CodeIcon className="size-3.5 text-muted-foreground" />,
	},
	{
		label: "Support WhatsApp / Email",
		href: "#",
		icon: <HelpCircleIcon className="size-3.5 text-muted-foreground" />,
	},
	{
		label: "Conditions d'utilisation",
		href: "#",
		icon: <FileTextIcon className="size-3.5 text-muted-foreground" />,
	},
	{
		label: "Confidentialité des données",
		href: "#",
		icon: <LockIcon className="size-3.5 text-muted-foreground" />,
	},
];
