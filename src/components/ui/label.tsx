
/*
This file is updated for the neo-brutalist design.
- The font is changed to `font-bold` to give labels more emphasis and a blockier feel.
- Base styling now includes `block` and `mb-1` for a standard top-aligned label layout.
- The color is changed to `text-black` to fit the high-contrast theme.
*/
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "mb-1 block text-sm font-bold leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };