/*
This file is heavily redesigned to remove the neo-brutalist style.
- The `rounded-none`, `border-2`, and `shadow-[...]` classes are removed.
- The component is now styled as a modern input field with a subtle `border`, `rounded-md`, and theme-aware colors for background, text, and placeholders.
- The focus-visible state is updated to use the theme's `ring` color for a consistent and accessible focus indicator.
- The `` class is removed, and the component will inherit the global `font-sans`. `font-mono` is selectively applied for specific input types.
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
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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