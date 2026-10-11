"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CoolIcon } from "@/components/icons/coolicon";
import { cn } from "@/lib/utils";

export const Select = BaseSelect.Root;

export const SelectGroup = BaseSelect.Group;

export function SelectTrigger({
  className,
  children,
  label,
  ...props
}: React.ComponentProps<typeof BaseSelect.Trigger> & { label?: string }) {
  return (
    <BaseSelect.Trigger
      className={cn(
        "relative inline-flex items-center h-8 gap-1.5 px-2.5 rounded-[12px] text-[12.5px] font-medium select-none transition-all outline-none cursor-pointer",
        "bg-[var(--mn)] text-[var(--ink)] border border-[var(--line)]",
        "hover:border-[var(--line-strong)] hover:bg-[var(--hover)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--lime)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surf)]",
        "data-[popup-open]:border-[var(--ink)] data-[popup-open]:ring-2 data-[popup-open]:ring-[var(--lime)]",
        className
      )}
      {...props}
    >
      {label && <span className="text-[var(--mute)] font-normal text-[12px]">{label}</span>}
      {children}
      <BaseSelect.Icon className="ml-0.5 shrink-0 text-[var(--mute)] transition-transform duration-150 in-[[data-popup-open]]:rotate-180">
        <CoolIcon name="chevron-down" size={13} strokeWidth={2.2} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectValue({
  placeholder,
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Value>) {
  return (
    <BaseSelect.Value
      placeholder={placeholder}
      className={cn("truncate font-medium text-[var(--ink)]", className)}
      {...props}
    />
  );
}

export function SelectPopup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner sideOffset={6} align="start" className="z-50">
        <BaseSelect.Popup
          className={cn(
            "min-w-[140px] max-w-[260px] max-h-72 p-1 overflow-y-auto rounded-[14px]",
            "bg-[var(--surf)] border border-[var(--line)] shadow-raised",
            "outline-none text-[12.5px] select-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          style={{ animationDuration: "140ms" }}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      className={cn(
        "relative flex items-center justify-between gap-3 w-full py-1.5 px-2.5 rounded-[9px]",
        "font-medium text-[12.5px] text-[var(--ink)] cursor-pointer outline-none transition-colors",
        "data-[highlighted]:bg-[var(--mn)]",
        "data-[selected]:text-[var(--ink)]",
        className
      )}
      {...props}
    >
      <BaseSelect.ItemText className="truncate">{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="shrink-0 text-[var(--ink)]">
        <CoolIcon name="check" size={13} strokeWidth={2.4} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export function SelectLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Label>) {
  return (
    <BaseSelect.Label
      className={cn("px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--mute)]", className)}
      {...props}
    >
      {children}
    </BaseSelect.Label>
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Separator>) {
  return (
    <BaseSelect.Separator
      className={cn("h-px bg-[var(--line)] my-1 -mx-1", className)}
      {...props}
    />
  );
}
