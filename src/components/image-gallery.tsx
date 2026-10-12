"use client";

import { LazyImage } from "@/components/lazy-image";
import { motion } from "motion/react";

const GALLERY_ITEMS = [
	{ title: "Cyber Samurai", model: "Seedance 2.0", type: "Vidéo 4K", seed: "cyber", portrait: true },
	{ title: "African Royalty", model: "Nano Banana 2", type: "Image 4K", seed: "african", portrait: false },
	{ title: "Neon Tokyo", model: "Kling 3.0", type: "Vidéo Ciné", seed: "neon", portrait: true },
	{ title: "Deep Sea Creature", model: "Z-Image Turbo", type: "Image 2K", seed: "sea", portrait: false },
	{ title: "Afrobeat Groove", model: "Suno v4", type: "Audio Studio", seed: "music", portrait: false },
	{ title: "Vintage Fashion 1970", model: "Nano Banana 2", type: "Image 2K", seed: "fashion", portrait: true },
	{ title: "Hyperdrive Transit", model: "Wan 2.7", type: "Vidéo Sci-Fi", seed: "hyper", portrait: false },
	{ title: "Architectural Noir", model: "Seedream 5", type: "Image 4K", seed: "arch", portrait: true },
	{ title: "Solarpunk Citadel", model: "Seedream 5", type: "Image 4K", seed: "solarpunk", portrait: true },
	{ title: "Dakar Golden Hour", model: "Kling 3.0", type: "Vidéo 4K", seed: "dakar", portrait: false },
	{ title: "Cosmic Odyssey", model: "Z-Image Turbo", type: "Image 4K", seed: "cosmic", portrait: true },
	{ title: "Abstract Flow", model: "Wan 2.7", type: "Vidéo Abstract", seed: "flow", portrait: false },
];

export function ImageGallery() {
	return (
		<section id="gallery" className="relative w-full px-4 py-24 border-t border-border">
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: false, amount: 0.2 }}
				transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
				className="mx-auto max-w-5xl space-y-4 text-center mb-14"
			>
				<h2 className="font-heading font-semibold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
					Rendu cinématique & précision créative
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
					Découvrez les créations générées par notre communauté avec les modèles vidéo, image et musique les plus puissants du marché.
				</p>
			</motion.div>

			<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
				{Array.from({ length: 4 }).map((_, col) => {
					const itemsForCol = GALLERY_ITEMS.filter((_, idx) => idx % 4 === col);
					return (
						<div className="grid gap-4" key={col}>
							{itemsForCol.map((item, index) => {
								const width = item.portrait ? 1080 : 1920;
								const height = item.portrait ? 1920 : 1080;
								const ratio = item.portrait ? 9 / 16 : 16 / 9;

								return (
									<motion.div
										key={`${col}-${index}`}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false, amount: 0.1 }}
										transition={{
											duration: 0.6,
											delay: (index % 3) * 0.08,
											ease: [0.16, 1, 0.3, 1],
										}}
										whileHover={{ y: -5, transition: { duration: 0.2 } }}
										className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:border-[var(--lime)]/60 hover:shadow-card cursor-pointer"
									>
										<LazyImage
											alt={item.title}
											containerClassName="w-full transition-transform duration-500 group-hover:scale-105"
											fallback={`https://placehold.co/${width}x${height}/171717/ffffff?text=${encodeURIComponent(item.title)}`}
											inView={true}
											ratio={ratio}
											src={`https://picsum.photos/seed/${item.seed}/${width}/${height}`}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
											<span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wide">
												{item.model} · {item.type}
											</span>
											<span className="text-sm font-semibold text-white drop-shadow-xs">
												{item.title}
											</span>
										</div>
									</motion.div>
								);
							})}
						</div>
					);
				})}
			</div>
		</section>
	);
}
