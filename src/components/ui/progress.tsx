
/*
This file is updated to adopt a neo-brutalist aesthetic.
- The modern, rounded progress bar is replaced with a blocky design featuring a `border-2`, `rounded-none`, and a hard shadow.
- The track (`ProgressPrimitive.Root`) has a neutral background color.
- The indicator (`ProgressPrimitive.Indicator`) uses a high-contrast yellow to clearly show progress.
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
      "relative h-4 w-full overflow-hidden rounded-none border-2 border-black bg-neutral-200 shadow-[2px_2px_0_#000]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-yellow-300 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };