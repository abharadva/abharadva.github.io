
/*
This file is updated for the neo-brutalist design.
- The component container has a `border-2 border-black` and `rounded-none`.
- All sub-elements like days and navigation buttons are styled with sharp corners (`rounded-none`).
- Day selection colors are changed to use a solid, high-contrast color (yellow) for a bold look.
- The "today" highlight uses a simple border to stand out.
- Fonts are updated to match the new monospaced theme.
*/
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 border-2 border-black rounded-none bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-neutral-500 rounded-none w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-none"
        ),
        day_range_end: "",
        day_selected:
          "bg-yellow-300 text-black hover:bg-yellow-400 focus:bg-yellow-400 rounded-none",
        day_today: "bg-white text-black border-2 border-black rounded-none",
        day_outside:
          "text-neutral-400 opacity-50",
        day_disabled: "text-neutral-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-neutral-100 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };