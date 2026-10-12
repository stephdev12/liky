import { LogoCloud } from "@/components/logo-cloud";

export function LogosSection() {
	return (
		<section className="relative space-y-4 border-t border-[var(--line)] pt-8 pb-12">
			<h2 className="font-heading text-center font-medium text-sm sm:text-base text-muted-foreground tracking-tight">
				Propulsé par les meilleurs modèles et protocoles mondiaux
			</h2>
			<div className="relative z-10 mx-auto max-w-4xl">
				<LogoCloud />
			</div>
		</section>
	);
}
