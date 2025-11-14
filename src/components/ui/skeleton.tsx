
/*
This file is updated for the new neo-brutalist design system.
- The subtle `rounded-md` is replaced with `rounded-none`.
- A `border-2 border-foreground` is added for a distinct, blocky placeholder effect.
- The background color remains `muted` for contrast.
*/
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-none border-2 border-foreground bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };