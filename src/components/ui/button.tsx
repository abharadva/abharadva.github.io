
/*
This file is heavily redesigned to implement the neo-brutalist aesthetic.
- A `border-2`, `rounded-none`, and hard `shadow-[...]` are added to the base styles.
- A `transition-all` is added to support hover and active effects.
- An active state `active:translate-x-[2px] active:translate-y-[2px]` moves the button into its shadow for a physical feel.
- The `variant` styles are updated for a high-contrast color palette.
- The `ghost` and `link` variants are simplified to remove the border and shadow for specific use cases.
*/
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none border-2 border-foreground text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-[2px_2px_0px_#000] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] dark:shadow-[2px_2px_0px_#FFF]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive-foreground",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border-0 shadow-none hover:bg-accent hover:text-accent-foreground active:translate-x-0 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline border-0 shadow-none active:translate-x-0 active:translate-y-0",
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