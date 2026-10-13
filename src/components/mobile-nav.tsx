import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/portal";
import { companyLinks, companyLinks2, productLinks } from "@/components/nav-links";
import { LinkItem } from "@/components/sheard";
import { CoolIcon } from "@/components/icons/coolicon";
import Link from "next/link";

export function MobileNav() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden size-9 rounded-full border-border/80"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				<div
					className={cn(
						"transition-all",
						open ? "scale-100 opacity-100" : "scale-0 opacity-0"
					)}
				>
					<CoolIcon name="close-md" size={17} duotone={false} />
				</div>
				<div
					className={cn(
						"absolute transition-all",
						open ? "scale-0 opacity-0" : "scale-100 opacity-100"
					)}
				>
					<CoolIcon name="hamburger-md" size={17} duotone={false} />
				</div>
			</Button>
			{open && (
				<Portal className="top-14">
					<PortalBackdrop onClick={() => setOpen(false)} />
					<div
						className={cn(
							"size-full overflow-y-auto p-5 bg-[var(--surface)] border-b border-[var(--line)] shadow-2xl",
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="flex w-full flex-col gap-y-2">
							<span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider px-2 pt-2">
								Outils de création IA
							</span>
							{productLinks.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`product-${link.label}`}
									{...link}
								/>
							))}
							<span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider px-2 pt-3">
								Plateforme & Infos
							</span>
							{companyLinks.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`company-${link.label}`}
									{...link}
								/>
							))}
							{companyLinks2.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`company2-${link.label}`}
									{...link}
								/>
							))}
						</div>
						<div className="mt-6 flex flex-col gap-2.5 pb-6">
							<Button asChild className="w-full h-10 rounded-full font-semibold bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] shadow-xs [&_*]:text-[#171717]">
								<Link href="/studios" onClick={() => setOpen(false)} className="text-[#171717]">
									Lancer le Studio
								</Link>
							</Button>
							<Button asChild className="w-full h-10 rounded-full font-medium" variant="outline">
								<Link href="/auth" onClick={() => setOpen(false)}>
									Connexion
								</Link>
							</Button>
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
