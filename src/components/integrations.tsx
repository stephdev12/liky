"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { CoolIcon } from "@/components/icons/coolicon";
import { McpModal } from "@/components/mcp-modal";

type TileData = {
	row: number;
	col: number;
	name?: string;
	icon?: React.ReactNode;
};

export function Integrations() {
	const [mcpModalOpen, setMcpModalOpen] = useState(false);

	return (
		<section id="integrations" className="py-24 md:py-32 px-4 bg-[var(--bg)] border-t border-[var(--line)] overflow-hidden">
			<McpModal isOpen={mcpModalOpen} onClose={() => setMcpModalOpen(false)} />
			<div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
				{/* Left Content */}
				<motion.div
					initial={{ opacity: 0, x: -30 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: false, amount: 0.2 }}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					className="max-w-xl space-y-6"
				>
					<h2 className="font-heading font-semibold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
						Connectez vos agents IA préférés
					</h2>
					<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
						Grâce au protocole MCP (Model Context Protocol), connectez directement LikyAI à Claude, ChatGPT, Gemini, Hermes ou Cursor. Générez des images, des vidéos et du son directement depuis vos conversations et éditeurs préférés.
					</p>
					<div className="flex flex-wrap items-center gap-3 pt-2">
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<button
								type="button"
								onClick={() => setMcpModalOpen(true)}
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D8FF64] text-[#171717] font-semibold text-[13.5px] hover:bg-[#cbf54a] transition-all shadow-xs cursor-pointer [&_*]:text-[#171717]"
							>
								<CoolIcon name="terminal" size={16} duotone secondaryColor="#171717" className="shrink-0 text-[#171717]" />
								<span className="text-[#171717]">Connecter un agent (MCP)</span>
								<CoolIcon name="arrow-right-sm" size={15} duotone={false} className="shrink-0 text-[#171717]" />
							</button>
						</motion.div>
						<span className="text-[12.5px] text-muted-foreground font-mono">
							Compatible Claude Code, Cursor & ChatGPT
						</span>
					</div>
				</motion.div>

				{/* Right Content - Visual */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: false, amount: 0.2 }}
					transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
					className="flex justify-center items-center md:justify-end w-full overflow-hidden py-4"
				>
					<div className="mask-[radial-gradient(ellipse_at_center,black,black,transparent)] relative size-90 scale-[0.82] sm:scale-100 origin-center shrink-0">
						{tiles.map((tile) => (
							<IntegrationCard key={`${tile.row}_${tile.col}`} {...tile} />
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}

function IntegrationCard({ row, col, icon, name }: TileData) {
	return (
		<motion.div
			whileHover={icon ? { scale: 1.12, zIndex: 30 } : undefined}
			transition={{ duration: 0.2 }}
			className={cn(
				"absolute flex size-18 items-center justify-center rounded-2xl border transition-colors cursor-pointer",
				icon
					? "bg-[var(--surf)] border-[var(--line)] shadow-card text-[var(--ink)] hover:border-[var(--lime)]"
					: "bg-[var(--surf)]/20 border-dashed border-[var(--line)]/40 pointer-events-none"
			)}
			style={{
				left: col * 72,
				top: row * 72,
			}}
			title={name}
		>
			{icon && (
				<div className="flex flex-col items-center justify-center gap-1">
					<div className="size-7 flex items-center justify-center">
						{icon}
					</div>
					{name && (
						<span className="text-[9px] font-mono text-[var(--mute)] leading-none select-none font-medium">
							{name}
						</span>
					)}
				</div>
			)}
		</motion.div>
	);
}

// Icons for Compatible AI Agents
const ClaudeIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#D97706]" aria-label="Claude">
		<path d="M13.727 3.376c-.47-.847-1.637-.847-2.107 0L8.033 9.87c-.47.848.113 1.9.993 1.9h2.39v7.854c0 .97 1.15 1.48 1.868.828l6.197-5.633c.75-.682.268-1.949-.74-1.949h-2.39V4.476a1.2 1.2 0 0 0-.624-1.1Z" />
	</svg>
);

const OpenAIIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[var(--ink)]" aria-label="ChatGPT">
		<path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073ZM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494ZM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.064l-4.83 2.79a4.5 4.5 0 0 1-6.15-1.647Zm-1.632-9.61a4.47 4.47 0 0 1 2.34-1.974v5.674a.796.796 0 0 0 .392.682l5.842 3.37-2.02 1.168a.071.071 0 0 1-.065 0l-4.83-2.79A4.504 4.504 0 0 1 1.968 8.694Zm14.864 3.923-5.843-3.37 2.02-1.168a.071.071 0 0 1 .065 0l4.83 2.79a4.494 4.494 0 0 1-.68 8.1v-5.673a.796.796 0 0 0-.392-.682Zm2.016-3.805-.141-.085-4.779-2.76a.776.776 0 0 0-.784 0L7.4 9.737V7.405a.08.08 0 0 1 .033-.064l4.83-2.79a4.5 4.5 0 0 1 6.689 4.674ZM8.843 14.07l-2.02-1.168a.08.08 0 0 1-.038-.063V7.256a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.782 2.761a.795.795 0 0 0-.393.681v6.745Zm1.085-2.045 2.57-1.485 2.57 1.485v2.97l-2.57 1.485-2.57-1.485v-2.97Z" />
	</svg>
);

const GeminiIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#3B82F6]" aria-label="Gemini">
		<path d="M12 2C12 7.52 7.52 12 2 12c5.52 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10Z" />
	</svg>
);

const CursorIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[var(--ink)]" aria-label="Cursor">
		<path d="M12 2L2 22l10-4 10 4L12 2z" />
	</svg>
);

const HermesIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#A855F7]" aria-label="Hermes">
		<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
		<path d="M8 12l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const CodeIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#10B981]" aria-label="OpenCode">
		<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const SupabaseIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#22C55E]" aria-label="Supabase">
		<path d="M12.923 1.054a1.2 1.2 0 0 0-1.846 0L1.75 12.87a1.2 1.2 0 0 0 .923 1.954h8.327l-2.077 8.122a1.2 1.2 0 0 0 1.846.993l9.327-11.815a1.2 1.2 0 0 0-.923-1.954h-8.327l2.077-9.116Z" />
	</svg>
);

const WindsurfIcon = () => (
	<svg viewBox="0 0 24 24" className="size-6 fill-current text-[#06B6D4]" aria-label="Windsurf">
		<path d="M4 18c4-4 8-4 12 0M2 12c6-5 12-5 18 0M6 6c3-3 6-3 9 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

// Coordinate mapping: 5x5 grid showcasing MCP agents
const tiles: TileData[] = [
	// Row 0
	{ row: 0, col: 1 },
	{
		row: 0,
		col: 3,
		icon: <WindsurfIcon />,
		name: "Windsurf",
	},
	// Row 1
	{
		row: 1,
		col: 0,
		icon: <ClaudeIcon />,
		name: "Claude",
	},
	{
		row: 1,
		col: 2,
		icon: <CursorIcon />,
		name: "Cursor",
	},
	{ row: 1, col: 4 },
	// Row 2
	{
		row: 2,
		col: 1,
		icon: <OpenAIIcon />,
		name: "ChatGPT",
	},
	{
		row: 2,
		col: 3,
		icon: <GeminiIcon />,
		name: "Gemini",
	},
	// Row 3
	{ row: 3, col: 0 },
	{
		row: 3,
		col: 2,
		icon: <HermesIcon />,
		name: "Hermes",
	},
	{
		row: 3,
		col: 4,
		icon: <CodeIcon />,
		name: "OpenCode",
	},
	// Row 4
	{
		row: 4,
		col: 1,
		icon: <SupabaseIcon />,
		name: "Supabase",
	},
	{ row: 4, col: 3 },
];
