/*
This file is updated to remove the neo-brutalist aesthetic.
- The `border-2`, `rounded-none`, and `shadow-[...]` styles are replaced with a modern progress bar style.
- The root component (`ProgressPrimitive.Root`) now uses `rounded-full` for a softer look.
- The background color is set to `secondary` for a subtle track.
- The indicator (`ProgressPrimitive.Indicator`) color is now tied to the theme's `primary` color for consistency.
*/
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };