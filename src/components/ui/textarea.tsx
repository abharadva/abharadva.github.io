
/*
This file is redesigned for the neo-brutalist style.
- The component now features `rounded-none`, `border-2`, and a hard `shadow-[4px_4px_0_#000]`, similar to the Input component.
- The `font-mono` class is applied for typographic consistency.
- The focus state enhances the brutalist feel with a thicker ring and reduced shadow.
*/
import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-[4px_4px_0_#000] focus-visible:shadow-[2px_2px_0_#000] transition-shadow",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };