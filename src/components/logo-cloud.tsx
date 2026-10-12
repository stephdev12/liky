"use client";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import React from "react";

export function LogoCloud() {
	return (
		<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] overflow-hidden py-4">
			<InfiniteSlider gap={48} reverse speed={60} speedOnHover={20}>
				{logos.map((logo) => (
					<div
						key={`logo-${logo.alt}`}
						className="flex items-center gap-2 px-3 py-1.5 opacity-60 hover:opacity-100 transition-opacity"
					>
						<span className="font-mono text-sm tracking-wide text-foreground/80 font-medium">
							{logo.name}
						</span>
					</div>
				))}
			</InfiniteSlider>
		</div>
	);
}

const logos = [
	{ name: "Claude 3.7", alt: "Anthropic Claude" },
	{ name: "OpenAI · GPT-4o", alt: "OpenAI" },
	{ name: "Gemini 2.5 Flash", alt: "Google Gemini" },
	{ name: "Kling 3.0 Turbo", alt: "Kling AI" },
	{ name: "Seedance 2.0", alt: "Seedance" },
	{ name: "Wan 2.7 Video", alt: "Wan" },
	{ name: "Suno v4 Music", alt: "Suno AI" },
	{ name: "Nano Banana 2", alt: "Nano Banana" },
	{ name: "Z-Image Turbo", alt: "Z-Image" },
	{ name: "MCP Protocol", alt: "Model Context Protocol" },
];
