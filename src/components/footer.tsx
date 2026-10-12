"use client";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type FooterLink = {
	title: string;
	href: string;
	icon?: ReactNode;
};

type FooterSection = {
	label: string;
	links: FooterLink[];
};

const footerLinks: FooterSection[] = [
	{
		label: "Produit",
		links: [
			{ title: "Génération d'images", href: "/studio" },
			{ title: "Création vidéo", href: "/studio" },
			{ title: "Musique & Audio", href: "/studio" },
			{ title: "Protocole MCP", href: "#integrations" },
		],
	},
	{
		label: "Plateforme",
		links: [
			{ title: "Tarifs & Crédits", href: "#pricing" },
			{ title: "Paiement Mobile Money", href: "#pricing" },
			{ title: "Galerie & Showcase", href: "#gallery" },
			{ title: "API KIE & Modèles", href: "#" },
		],
	},
	{
		label: "Légal & Studio",
		links: [
			{ title: "Conditions d'utilisation", href: "#" },
			{ title: "Confidentialité", href: "#" },
			{ title: "Support créateurs", href: "#" },
			{ title: "Accès Studio", href: "/studio" },
		],
	},
];

export function Footer() {
	return (
		<footer
			className={cn(
				"relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-t-4xl border-t border-[var(--line)] px-6 md:rounded-t-6xl md:px-8",
				"dark:bg-[radial-gradient(35%_128px_at_50%_0%,rgba(216,255,100,0.06),transparent)]"
			)}
		>
			<div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--lime)]/30 blur" />

			<div className="grid w-full gap-8 py-6 md:py-8 lg:grid-cols-3 lg:gap-8">
				<AnimatedContainer className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-[8px] bg-[var(--lime)] flex items-center justify-center text-[#171717]">
							<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
								<path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
							</svg>
						</div>
						<span className="font-serif text-[22px] font-medium tracking-tight text-[var(--ink)]">
							likyAI
						</span>
					</div>
					<p className="mt-6 text-muted-foreground text-sm md:mt-0 max-w-xs">
						Studio créatif IA unifié. Donnez vie à vos images, vidéos, musiques et voix off avec vos modèles et agents préférés.
					</p>
				</AnimatedContainer>

				<div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-2 lg:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer delay={0.1 + index * 0.1} key={section.label}>
							<div className="mb-8 md:mb-0">
								<h3 className="font-medium text-xs text-[var(--ink)] tracking-wider uppercase mb-3">{section.label}</h3>
								<ul className="space-y-2 text-muted-foreground text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												className="inline-flex items-center duration-200 hover:text-foreground text-[13px]"
												href={link.href}
												key={`${section.label}-${link.title}`}
											>
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>
			<div className="h-px w-full bg-[var(--line)]" />
			<div className="flex w-full items-center justify-between py-5 text-xs text-muted-foreground flex-col sm:flex-row gap-2">
				<p>
					&copy; 2026 likyAI. Tous droits réservés.
				</p>
				<p className="text-[11px] font-mono text-[var(--mute)]">
					Paiement Mobile Money · Protocole MCP natif
				</p>
			</div>
		</footer>
	);
}

function AnimatedContainer({
	className,
	delay = 0.1,
	children,
}: {
	delay?: number;
	className?: string;
	children: ReactNode;
}) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			className={className}
			initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
			transition={{ delay, duration: 0.8 }}
			viewport={{ once: true }}
			whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
		>
			{children}
		</motion.div>
	);
}
