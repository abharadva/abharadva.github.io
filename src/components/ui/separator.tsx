
/*
This file is updated for the new neo-brutalist design system.
- The subtle `bg-border` is replaced with the high-contrast `bg-foreground`.
- The thickness is increased to `h-[2px]` or `w-[2px]` for a more substantial, visible line, fitting the raw aesthetic.
*/
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
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-foreground",
        orientation === "horizontal" ? "h-[2px] w-full" : "h-full w-[2px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };