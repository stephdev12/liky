import React from "react";
import { cn } from "@/lib/utils";

export const LogoIcon = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		className={cn(
			"w-7 h-7 rounded-[8px] bg-[var(--lime)] flex items-center justify-center text-[#171717] shrink-0",
			className
		)}
		{...props}
	>
		<svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
			<path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" />
		</svg>
	</div>
);

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div className={cn("inline-flex items-center gap-2", className)} {...props}>
		<LogoIcon />
		<span className="font-serif text-[20px] font-semibold tracking-tight text-foreground">
			likyAI
		</span>
	</div>
);
