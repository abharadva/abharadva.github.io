/*
This file is updated for the new kinetic typography design system.
- The `font-bold` class is changed to `font-medium` for a cleaner, less heavy look.
- The `mb-1` and `block` classes are removed from the base styles, making the component more flexible for use in different layouts (e.g., alongside a checkbox). These can be added via `className` where needed.
- The `text-black` color is replaced with the theme's default text color, which is inherited.
*/
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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