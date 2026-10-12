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
					"flex aspect-square size-10 shrink-0 items-center justify-center rounded-xl transition-all shadow-2xs",
					"bg-emerald-500/10 border border-emerald-500/20",
					"text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/35",
					"[&_svg]:size-5"
				)}
			>
				{icon}
			</div>
			<div className="flex flex-col items-start justify-center min-w-0">
				<span className="font-medium text-[13px] text-foreground leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
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
