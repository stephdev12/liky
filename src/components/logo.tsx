import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const LogoIcon = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "relative size-7 rounded-[8px] overflow-hidden flex items-center justify-center shrink-0 select-none",
      className
    )}
    {...props}
  >
    {/* Version sur fond blanc / thème clair (Logo noir avec feuille lime) -> scale x2.5 */}
    <div className="relative size-full flex items-center justify-center dark:hidden">
      <Image
        src="/assets/logo-black.png"
        alt="likyAI"
        width={36}
        height={36}
        priority
        className="size-full object-contain scale-[2.5]"
      />
    </div>

    {/* Version sur fond noir / thème sombre (Logo blanc avec feuille lime) -> scale x2.0 */}
    <div className="relative size-full hidden dark:flex items-center justify-center">
      <Image
        src="/assets/logo-white.png"
        alt="likyAI"
        width={36}
        height={36}
        priority
        className="size-full object-contain scale-[2.0]"
      />
    </div>
  </div>
);

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("inline-flex items-center gap-2.5", className)} {...props}>
    <LogoIcon />
    <span className="font-heading text-[21px] font-normal tracking-tight text-foreground">
      likyAI
    </span>
  </div>
);
