import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { companyLinks, companyLinks2, productLinks } from "@/components/nav-links";
import { LinkItem } from "@/components/sheard";
import Link from "next/link";

export function DesktopNav() {
	return (
		<NavigationMenu className="hidden md:flex">
			<NavigationMenuList>
				<NavigationMenuItem className="bg-transparent">
					<NavigationMenuTrigger className="bg-transparent text-sm">
						Outils IA
					</NavigationMenuTrigger>
					<NavigationMenuContent className="p-2 bg-[var(--surface)] border-0">
						<div className="rounded-xl grid w-lg grid-cols-2 gap-2 bg-[var(--surface)]">
							{productLinks.map((item, i) => (
								<NavigationMenuLink asChild key={`item-${item.label}-${i}`}>
									<LinkItem {...item} />
								</NavigationMenuLink>
							))}
						</div>
						<div className="p-3 flex items-center justify-between border-t border-[var(--line)] mt-2 bg-[var(--field)]/60 rounded-lg">
							<p className="text-muted-foreground text-xs">
								Tous les modèles accessibles avec vos crédits LikyAI
							</p>
							<Link
								className="font-medium text-xs text-[var(--ink)] hover:underline flex items-center gap-1 font-mono"
								href="/studio"
							>
								Ouvrir le Studio &rarr;
							</Link>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger className="bg-transparent text-sm">
						Plateforme
					</NavigationMenuTrigger>
					<NavigationMenuContent className="p-2 bg-[var(--surface)] border-0">
						<div className="grid w-lg grid-cols-2 gap-2">
							<div className="rounded-xl space-y-1 bg-[var(--surface)]">
								{companyLinks.map((item, i) => (
									<NavigationMenuLink asChild key={`item-${item.label}-${i}`}>
										<LinkItem {...item} />
									</NavigationMenuLink>
								))}
							</div>
							<div className="space-y-1.5 p-3 rounded-xl bg-[var(--field)]/60 flex flex-col justify-center">
								{companyLinks2.map((item, i) => (
									<NavigationMenuLink
										href={item.href}
										key={`item-${item.label}-${i}`}
										className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--hover)] text-xs text-muted-foreground hover:text-foreground transition-colors"
									>
										{item.icon}
										<span>{item.label}</span>
									</NavigationMenuLink>
								))}
							</div>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild className="px-3">
						<a className="rounded-md p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium" href="#pricing">
							Tarifs
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild className="px-3">
						<a className="rounded-md p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium" href="#integrations">
							MCP
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
