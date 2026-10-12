"use client";

import { LogoCloud } from "@/components/logo-cloud";
import { motion } from "motion/react";

export function LogosSection() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			className="relative space-y-4 border-t border-[var(--line)] pt-8 pb-12"
		>
			<h2 className="font-heading text-center font-medium text-sm sm:text-base text-muted-foreground tracking-tight">
				Propulsé par les meilleurs modèles et protocoles mondiaux
			</h2>
			<div className="relative z-10 mx-auto max-w-4xl">
				<LogoCloud />
			</div>
		</motion.section>
	);
}
