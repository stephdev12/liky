import { cn } from "@/lib/utils";
import type React from "react";

export type LinkItemType = {
	label: string;
	href: string;
	icon: React.ReactNode;
	description?: string;
};

export function LinkItem({
	label,
	description,
	icon,
	className,
	href,
	...props
}: React.ComponentProps<"a"> & LinkItemType) {
	return (
		<a
			className={cn(
				"flex items-center gap-x-3 p-2.5 rounded-xl transition-all duration-150 hover:bg-[var(--hover)] group",
				className
			)}
			href={href}
			{...props}
		>
			<div
				className={cn(
					"flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--field)] text-sm shadow-2xs group-hover:border-[var(--line-strong)] transition-colors",
					"[&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='text-'])]:text-foreground"
				)}
			>
				{icon}
			</div>
			<div className="flex flex-col items-start justify-center min-w-0">
				<span className="font-medium text-[13px] text-foreground leading-tight group-hover:text-[var(--ink)]">
					{label}
				</span>
				{description && (
					<span className="line-clamp-1 text-muted-foreground text-[11.5px] mt-0.5">
						{description}
					</span>
				)}
			</div>
		</a>
	);
}
