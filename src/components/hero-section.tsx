"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export function HeroSection() {
	return (
		<section className="relative mx-auto w-full max-w-5xl px-4 overflow-hidden">
			{/* Subtle Minimal Background Ambiance (No heavy neon) */}
			<div
				aria-hidden="true"
				className="absolute inset-0 isolate hidden overflow-hidden pointer-events-none lg:block"
			>
				<div className="absolute inset-0 -top-24 isolate -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.04),transparent)]" />
			</div>

			{/* X Bold Faded Borders */}
			<div
				aria-hidden="true"
				className="absolute inset-0 mx-auto hidden min-h-screen w-full max-w-5xl lg:block pointer-events-none"
			>
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 left-0 z-10 h-full w-px bg-foreground/10" />
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 right-0 z-10 h-full w-px bg-foreground/10" />
			</div>

			{/* Main Content */}
			<div className="relative flex flex-col items-center justify-center gap-5 sm:gap-6 pt-20 pb-16 sm:pt-28 sm:pb-24 md:pt-32 md:pb-28">
				{/* X Content Faded Borders */}
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-1 size-full overflow-hidden pointer-events-none"
				>
					<div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-border to-border md:left-8" />
					<div className="absolute inset-y-0 right-4 w-px bg-gradient-to-b from-transparent via-border to-border md:right-8" />
					<div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-border/40 to-border/40 md:left-12" />
					<div className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-border/40 to-border/40 md:right-12" />
				</div>

				{/* Headline (Higgsfield-inspired minimal punchline) */}
				<motion.h1
					initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					className={cn(
						"font-heading text-balance text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
						"text-foreground leading-[1.12]"
					)}
				>
					Studio créatif IA <br />
					<span className="font-serif italic font-normal text-muted-foreground">pour la nouvelle génération</span>
				</motion.h1>

				{/* Description */}
				<motion.p
					initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
					className="mx-auto max-w-xl text-center text-sm sm:text-base md:text-lg text-muted-foreground tracking-normal leading-relaxed px-2"
				>
					Générez des images cinématiques, des vidéos ultra-réalistes, des musiques et des voix off. Connectez vos agents IA via MCP ou créez directement dans le Studio.
				</motion.p>

				{/* Actions */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
					className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2"
				>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
						<Button
							asChild
							className="w-full sm:w-auto h-11 px-7 rounded-full font-semibold text-sm bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] shadow-xs transition-all"
							size="lg"
						>
							<Link href="/studio" className="text-[#171717] flex items-center justify-center gap-1.5">
								<Sparkles className="size-4 shrink-0 text-[#171717]" />
								<span>Commencer à créer</span>
							</Link>
						</Button>
					</motion.div>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
						<Button
							asChild
							className="w-full sm:w-auto h-11 px-6 rounded-full font-medium text-sm border-border hover:bg-muted"
							size="lg"
							variant="outline"
						>
							<Link href="#gallery" className="flex items-center justify-center gap-1.5">
								<Wand2 className="size-4 shrink-0 text-muted-foreground" />
								<span>Explorer la galerie</span>
							</Link>
						</Button>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
