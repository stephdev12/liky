"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function Header() {
	const scrolled = useScroll(10);

	return (
		<header
			className={cn("sticky top-0 z-50 w-full border-transparent border-b transition-colors duration-200", {
				"border-border bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70":
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
				<div className="flex items-center gap-5">
					<Link
						className="rounded-lg py-1.5 hover:opacity-85 transition-opacity"
						href="/"
					>
						<Logo className="h-5" />
					</Link>
					<DesktopNav />
				</div>
				<div className="hidden items-center gap-2.5 md:flex">
					<ThemeToggle />
					<Button asChild variant="outline" size="sm" className="h-8 rounded-full text-xs font-medium border-border/80">
						<Link href="/auth">Connexion</Link>
					</Button>
					<Button asChild size="sm" className="h-8 rounded-full text-xs font-semibold bg-[#D8FF64] text-[#171717] hover:bg-[#cbf54a] transition-all shadow-xs [&_*]:text-[#171717]">
						<Link href="/studio" className="text-[#171717]">Lancer le Studio</Link>
					</Button>
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<MobileNav />
				</div>
			</nav>
		</header>
	);
}
