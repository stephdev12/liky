import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--line-strong)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#D8FF64] text-[#171717] font-semibold shadow-xs hover:bg-[#cbf54a] active:scale-[0.98] [&_*]:text-[#171717]",
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-red-600 active:scale-[0.98]",
        outline:
          "border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] shadow-xs hover:bg-[var(--mn)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] active:scale-[0.98]",
        secondary:
          "bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)] shadow-xs hover:bg-[var(--hover)] active:scale-[0.98]",
        ghost:
          "hover:bg-[var(--mn)] text-[var(--ink)] hover:text-[var(--ink)]",
        link:
          "text-[var(--ink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-10 rounded-[14px] px-6 text-[15px]",
        icon: "h-9 w-9 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
