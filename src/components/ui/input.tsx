
/*
This file is heavily redesigned for the neo-brutalist style.
- The component now features `rounded-none`, `border-2`, and a hard `shadow-[4px_4px_0_#000]`.
- The `font-mono` class is applied to enforce the new typographic theme.
- The focus-visible state adds a thicker offset ring, enhancing the tactile feel.
- Placeholder text color is adjusted for better contrast within the new theme.
*/
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-[4px_4px_0_#000] focus-visible:shadow-[2px_2px_0_#000] transition-shadow",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };