"use client";

import { cn } from "@/lib/utils";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { CoolIcon } from "@/components/icons/coolicon";
import React from "react";
import { motion } from "motion/react";

type Testimonial = {
	quote: string;
	name: string;
	role: string;
	company: string;
	image: string;
};

const testimonials: Testimonial[] = [
	{
		quote:
			"LikyAI a divisé par dix notre temps de production de contenu vidéo pour TikTok et Reels. La fluidité de Seedance 2.0 et Kling 3.0 dans une seule interface est bluffante.",
		image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		name: "Sarah K.",
		role: "Directrice Artistique",
		company: "Studio Kô",
	},
	{
		quote:
			"Pouvoir recharger ses crédits en FCFA par MTN Mobile Money ou Wave sans carte bancaire internationale change tout. La qualité d'image 4K avec Nano Banana est incroyable.",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
		name: "Jean-Marc D.",
		role: "Créateur de Contenu & Motion Designer",
		company: "Abidjan Creative",
	},
	{
		quote:
			"L'intégration native du protocole MCP avec Claude et Cursor me permet de générer des assets visuels et audio directement pendant le code de nos applications.",
		image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
		name: "Christian M.",
		role: "Développeur Fullstack & Lead Tech",
		company: "Nova AI Labs",
	},
];

export function TestimonialsSection() {
	return (
		<section id="testimonials" className="py-24 md:py-32 px-4 border-t border-border overflow-hidden">
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: false, amount: 0.2 }}
				transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
				className="mx-auto max-w-5xl space-y-3 text-center mb-14"
			>
				<h2 className="font-heading font-semibold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
					Adopté par les créateurs et studios
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
					Découvrez comment LikyAI accélère la production créative au quotidien.
				</p>
			</motion.div>

			<div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-3">
				{testimonials.map((testimonial, index) => (
					<TestimonialCard
						index={index}
						key={testimonial.name}
						testimonial={testimonial}
					/>
				))}
			</div>
		</section>
	);
}

function TestimonialCard({
	testimonial,
	index,
	className,
}: {
	testimonial: Testimonial;
	index: number;
	className?: string;
}) {
	const { quote, name, role, company, image } = testimonial;

	return (
		<motion.figure
			initial={{ opacity: 0, y: 25 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.15 }}
			transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
			whileHover={{ y: -6, transition: { duration: 0.2 } }}
			className={cn(
				"relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 p-6 shadow-xs backdrop-blur-sm transition-colors hover:border-[var(--lime)]/50 hover:shadow-card",
				className
			)}
		>
			<CoolIcon name="double-quotes-l" size={26} duotone secondaryColor="var(--lime)" className="text-[var(--lime)] opacity-90 mb-4" />
			<p className="text-sm text-foreground/90 leading-relaxed font-normal flex-1">
				&ldquo;{quote}&rdquo;
			</p>
			<div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
				<Avatar className="size-10 border border-border">
					<AvatarImage alt={name} src={image} />
					<AvatarFallback className="font-medium text-xs bg-muted">
						{name.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
				<div>
					<div className="font-medium text-sm text-foreground">{name}</div>
					<div className="text-xs text-muted-foreground">
						{role} · <span className="text-foreground/70">{company}</span>
					</div>
				</div>
			</div>
		</motion.figure>
	);
}
