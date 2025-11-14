/*
This file is updated to remove the neo-brutalist styling.
- The `border-2`, `rounded-none`, and `shadow-[...]` styles are removed from the track and thumb.
- The `SliderPrimitive.Track` is now styled with `rounded-full` and uses the `secondary` background color.
- The `SliderPrimitive.Range` (the filled part of the track) uses the `primary` color.
- The `SliderPrimitive.Thumb` is restyled to be a clean, circular handle. It uses the theme's `ring` color for its focus state.
- The hover and active effects are simplified to be more subtle.
*/
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };