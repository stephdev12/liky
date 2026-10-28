"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CoolIcon } from "@/components/icons/coolicon";
import { motion } from "motion/react";
import { CREDIT_PACKS, CreditPack } from "@/lib/billing/pricing-calculator";
import { TopupModal } from "@/components/topup-modal";
import { useRouter } from "next/navigation";

export function PricingSection() {
	const [activeTopupPack, setActiveTopupPack] = useState<string | null>(null);
	const router = useRouter();

	return (
		<section id="pricing" className="py-24 md:py-32 px-4 bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden">
			<div className="flex w-full flex-col items-center justify-center space-y-8">
				<motion.div
					initial={{ opacity: 0, y: 25 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.2 }}
					transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
					className="mx-auto max-w-xl space-y-3 text-center"
				>
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--field)] border border-[var(--line)] text-xs text-[var(--ink-2)] mx-auto">
						<span className="w-1.5 h-1.5 rounded-full bg-[#D8FF64]" />
						<span>Paiement IA via Mobile Money en Afrique</span>
					</div>
					<h2 className="font-heading font-semibold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
						Rechargez vos crédits IA en toute liberté
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
						Pas d&apos;abonnement récurrent forcé. Achetez vos crédits par Mobile Money (Orange Money, MTN, Wave, Moov) partout en Afrique et créez quand vous voulez.
					</p>
				</motion.div>

				<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-4">
					{CREDIT_PACKS.map((pack, idx) => (
						<PricingCard
							key={pack.id}
							pack={pack}
							index={idx}
							onSelect={() => setActiveTopupPack(pack.id)}
						/>
					))}
				</div>
			</div>

			<TopupModal
				isOpen={Boolean(activeTopupPack)}
				onClose={() => setActiveTopupPack(null)}
				initialPackId={activeTopupPack || "pack_createur"}
				onSuccess={() => {
					setActiveTopupPack(null);
					router.push("/studios");
				}}
			/>
		</section>
	);
}

function PricingCard({
	pack,
	index = 0,
	onSelect,
}: {
	pack: CreditPack;
	index?: number;
	onSelect: () => void;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 25 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.15 }}
			transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={cn(
				"relative flex w-full flex-col overflow-hidden rounded-[22px] border transition-all duration-300",
				pack.highlighted
					? "border-foreground bg-[var(--surf)] shadow-md ring-1 ring-foreground/20"
					: "border-[var(--line)] bg-[var(--surf)]/80 hover:border-[var(--line-strong)] hover:shadow-card"
			)}
		>
			{pack.bonusPercent > 0 && (
				<div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
					+{pack.bonusPercent}% bonus
				</div>
			)}

			<div className="p-6 border-b border-[var(--line)]">
				<h3 className="font-semibold text-lg text-[var(--ink)]">{pack.name}</h3>
				<p className="font-normal text-muted-foreground text-xs mt-1 min-h-[32px] leading-relaxed">
					{pack.info}
				</p>
				
				<div className="mt-5 flex items-baseline gap-1.5">
					<span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
						{pack.credits}
					</span>
					<span className="text-sm font-semibold text-[var(--mute)]">crédits</span>
				</div>
				<div className="mt-1 text-[13px] font-semibold text-foreground dark:text-emerald-400">
					{pack.priceFcfa.toLocaleString("fr-FR")} FCFA <span className="text-[11px] text-[var(--mute)] font-normal">via Mobile Money</span>
				</div>
			</div>

			<div className="space-y-3 p-6 text-muted-foreground text-[12.5px] flex-1">
				{pack.features.map((feature) => (
					<div className="flex items-start gap-2.5" key={feature}>
						<CoolIcon name="circle-check" size={15} duotone={false} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
						<p className="leading-tight text-[var(--ink)]/90">{feature}</p>
					</div>
				))}
			</div>

			<div className="p-5 border-t border-[var(--line)] bg-[var(--mn)]/30 mt-auto">
				<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
					<Button
						type="button"
						onClick={onSelect}
						className={cn(
							"w-full h-10 rounded-[12px] font-semibold text-[13px] transition-all cursor-pointer",
							pack.highlighted
								? "bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] shadow-xs [&_*]:text-[#171717]"
								: "bg-[var(--surf)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--mn)]"
						)}
					>
						Choisir {pack.credits} crédits
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}
