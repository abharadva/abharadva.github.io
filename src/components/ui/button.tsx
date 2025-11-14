/*
This file is heavily redesigned to implement the neo-brutalist aesthetic.
- A `border-2`, `rounded-none`, and a hard `shadow` are added to the base styles.
- Interactive hover and active states are created with `transform` and `box-shadow` changes for a tactile, "pressable" feel.
- Variants are updated to use the new high-contrast color palette (e.g., solid colors, no gradients or soft effects).
- `ghost` and `link` variants are styled to be simple but fit within the raw aesthetic.
*/
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none border-2 border-black text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#000]",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-neutral-800",
        destructive:
          "bg-destructive text-white hover:bg-red-700 shadow-[4px_4px_0_theme(colors.destructive)] hover:shadow-[6px_6px_0_theme(colors.destructive)] active:shadow-[2px_2px_0_theme(colors.destructive)]",
        outline:
          "bg-transparent text-black hover:bg-neutral-100",
        secondary:
          "bg-neutral-200 text-black hover:bg-neutral-300",
        ghost: "shadow-none border-0 hover:bg-neutral-200 active:shadow-none active:transform-none",
        link: "text-black underline-offset-4 hover:underline shadow-none border-0 active:shadow-none active:transform-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };