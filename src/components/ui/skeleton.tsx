/*
This file is updated for the new kinetic typography design system.
- The neo-brutalist `border-2 border-black` and `rounded-none` are removed.
- The skeleton now uses `rounded-md` for consistency with other components.
- The background color is updated to use the theme's `muted` color for a subtle, modern placeholder effect that works in both light and dark themes.
*/
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };