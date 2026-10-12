"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { CoolIcon } from "@/components/icons/coolicon";
import { motion } from "motion/react";

type CreditPack = {
	name: string;
	credits: number;
	priceFcfa: number;
	info: string;
	features: string[];
	btnText: string;
	highlighted?: boolean;
	badge?: string;
};

const creditPacks: CreditPack[] = [
	{
		name: "Découverte",
		credits: 60,
		priceFcfa: 1000,
		info: "Pour tester et créer vos premières maquettes",
		features: [
			"Jusqu'à 15 images 2K Nano Banana",
			"Jusqu'à 4 vidéos courtes HD Seedance",
			"Musiques et voix off incluses",
			"Accès direct au Studio",
			"Sans engagement ni expiration",
		],
		btnText: "Choisir 60 crédits",
	},
	{
		name: "Créateur",
		credits: 200,
		priceFcfa: 3000,
		info: "Recommandé pour les créateurs de contenu réguliers",
		features: [
			"Jusqu'à 50 images haute résolution 4K",
			"Vidéos UGC & cinématiques Seedance",
			"Morceaux complets avec Suno v4",
			"Voix off réalistes multilingues",
			"Accès complet au serveur MCP",
		],
		btnText: "Choisir 200 crédits",
		highlighted: true,
		badge: "Plus populaire",
	},
	{
		name: "Studio Pro",
		credits: 500,
		priceFcfa: 7000,
		info: "Pour les agences et créateurs exigeants",
		features: [
			"Génération Kling 3.0 Turbo & Wan 2.7",
			"Images Ultra-HD multi-ratios",
			"Priorité maximale de rendu",
			"Accès API & agents MCP illimité",
			"Support prioritaire WhatsApp & Email",
		],
		btnText: "Choisir 500 crédits",
	},
];

export function PricingSection() {
	return (
		<section id="pricing" className="py-24 md:py-32 px-4 bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden">
			<div className="flex w-full flex-col items-center justify-center space-y-8">
				<motion.div
					initial={{ opacity: 0, y: 25 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
					className="mx-auto max-w-xl space-y-3 text-center"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surf)] border border-[var(--line)] text-[12px] font-mono text-[var(--mute)] shadow-2xs">
						<CoolIcon name="credit-card-01" size={14} duotone secondaryColor="var(--lime)" className="text-[var(--lime)]" />
						<span>Paiement Mobile Money</span>
					</div>
					<h2 className="font-heading font-semibold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
						Rechargez vos crédits en toute liberté
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
						Pas d&apos;abonnement mensuel caché. Achetez vos crédits par MTN MoMo, Orange Money ou Wave et utilisez-les quand vous voulez.
					</p>
				</motion.div>

				<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 pt-4">
					{creditPacks.map((pack, idx) => (
						<PricingCard key={pack.name} pack={pack} index={idx} />
					))}
				</div>
			</div>
		</section>
	);
}

function PricingCard({ pack, index = 0 }: { pack: CreditPack; index?: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 25 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={cn(
				"relative flex w-full flex-col overflow-hidden rounded-[22px] border transition-all duration-300",
				pack.highlighted
					? "border-[var(--lime)] bg-[var(--surf)] shadow-sm ring-1 ring-[var(--lime)]/40"
					: "border-[var(--line)] bg-[var(--surf)]/80 hover:border-[var(--line-strong)] hover:shadow-card"
			)}
		>
			{pack.badge && (
				<div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 rounded-full border border-[var(--lime)]/50 bg-[var(--lime)]/15 px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink)]">
					<CoolIcon name="star" size={13} duotone secondaryColor="var(--lime)" className="text-[var(--lime)]" />
					<span>{pack.badge}</span>
				</div>
			)}

			<div className="p-6 border-b border-[var(--line)]">
				<h3 className="font-semibold text-lg text-[var(--ink)]">{pack.name}</h3>
				<p className="font-normal text-muted-foreground text-xs mt-1 min-h-[32px] leading-relaxed">{pack.info}</p>
				
				<div className="mt-5 flex items-baseline gap-1.5">
					<span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
						{pack.credits}
					</span>
					<span className="text-sm font-semibold text-[var(--mute)]">crédits</span>
				</div>
				<div className="mt-1 text-[13px] font-semibold text-foreground dark:text-[var(--lime)]">
					{pack.priceFcfa.toLocaleString("fr-FR")} FCFA <span className="text-[11px] text-[var(--mute)] font-normal">via Mobile Money</span>
				</div>
			</div>

			<div className="space-y-3 p-6 text-muted-foreground text-[13px] flex-1">
				{pack.features.map((feature) => (
					<div className="flex items-start gap-2.5" key={feature}>
						<CoolIcon name="circle-check" size={16} duotone secondaryColor="var(--lime)" className="shrink-0 text-emerald-600 dark:text-[var(--lime)] mt-0.5" />
						<p className="leading-tight text-[var(--ink)]/90">{feature}</p>
					</div>
				))}
			</div>

			<div className="p-5 border-t border-[var(--line)] bg-[var(--mn)]/30 mt-auto">
				<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
					<Button
						asChild
						className={cn(
							"w-full h-10 rounded-[12px] font-semibold text-[13px] transition-all",
							pack.highlighted
								? "bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] shadow-xs [&_*]:text-[#171717]"
								: "bg-[var(--surf)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--mn)]"
						)}
					>
						<Link
							href="/studio"
							className={cn(
								"flex items-center justify-center",
								pack.highlighted ? "text-[#171717]" : "text-[var(--ink)]"
							)}
						>
							{pack.btnText}
						</Link>
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}
