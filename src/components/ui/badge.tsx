
/*
This file is updated for the neo-brutalist design.
- Soft-cornered badges are replaced with sharp `rounded-none` styles.
- A `border-2 border-black` is added for a defined, blocky appearance.
- Variants are simplified, using solid, high-contrast background colors.
- Font is changed to `font-bold` for a punchier look.
- The default variant now has a vibrant yellow background.
*/
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-black px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-black",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-300 text-black",
        secondary:
          "bg-neutral-200 text-neutral-800",
        destructive:
          "border-destructive bg-destructive text-white",
        outline: "text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };