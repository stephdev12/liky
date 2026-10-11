import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center w-full rounded-[14px] border border-[var(--line)] bg-[var(--surf)] focus-within:border-[var(--line-strong)] focus-within:ring-1 focus-within:ring-[var(--line-strong)] transition-all overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroup.displayName = "InputGroup";

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "inline-start" | "inline-end";
}

export const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center px-3 text-[var(--mute)] pointer-events-none select-none",
          align === "inline-start" ? "order-first" : "order-last",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroupAddon.displayName = "InputGroupAddon";

export interface InputGroupInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex-1 w-full h-10 px-3 py-2 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--mute)] outline-none border-0",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";
