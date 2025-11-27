"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

const SeparatorWithText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center gap-0.5 select-none",
        className,
      )}
      {...props}
    >
      <span className="separator-auto-mask flex-1 h-px bg-border" />
      <span className="px-2 text-xs uppercase text-muted-foreground whitespace-nowrap">
        {children}
      </span>
      <span className="separator-auto-mask flex-1 h-px bg-border" />
    </div>
  );
});

SeparatorWithText.displayName = "SeparatorWithText";

export { Separator, SeparatorWithText };
