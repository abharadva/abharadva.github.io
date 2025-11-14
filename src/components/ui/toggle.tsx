
/*
This file is updated for the neo-brutalist style.
- The `toggleVariants` cva is overhauled. Modern styles are replaced with `border-2`, `rounded-none`, and `shadow-[...]`.
- The pressed state (`data-[state=on]`) now uses a solid, high-contrast color (yellow) for clear feedback.
- The outline variant is updated to match the new bold design language.
- The font is made bold to fit the theme.
*/
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-none border-2 border-black text-sm font-bold ring-offset-background transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-yellow-300 data-[state=on]:text-black",
  {
    variants: {
      variant: {
        default: "bg-transparent text-black",
        outline:
          "bg-transparent hover:bg-neutral-100",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };