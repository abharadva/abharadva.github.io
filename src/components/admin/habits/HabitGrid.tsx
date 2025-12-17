"use client";
import React, { useMemo } from "react";
import { format, subDays, isSameDay } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import HabitRow from "./HabitRow";

interface HabitGridProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onViewStats: (habit: Habit) => void;
}

export default function HabitGrid({
  habits,
  onToggle,
  onEdit,
  onDelete,
  onViewStats,
}: HabitGridProps) {
  // Memoize dates array so it doesn't change reference on every render
  // This allows React.memo in HabitRow to work effectively
  const dates = useMemo(() => {
    // 14 days gives a nice 2-week view
    return Array.from({ length: 14 }).map((_, i) =>
      subDays(new Date(), 13 - i),
    );
  }, []);

  return (
    <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        {" "}
        {/* Added padding bottom for potential scrollbar */}
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="hover:bg-transparent border-b-border/60">
              <TableHead className="w-[200px] min-w-[200px] pl-4 h-14">
                Habit
              </TableHead>
              {dates.map((date) => (
                <TableHead
                  key={date.toString()}
                  className="p-0 h-16 w-11 min-w-[44px] text-center align-middle relative"
                >
                  {/* Subtle vertical line for separation */}
                  <div className="absolute right-0 top-3 bottom-3 w-px bg-border/40" />

                  <div className="flex flex-col items-center justify-center gap-1.5 z-10 relative">
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {format(date, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold h-7 w-7 flex items-center justify-center rounded-full transition-all",
                        isSameDay(date, new Date())
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110 ring-2 ring-background"
                          : "text-foreground/70 bg-secondary/40",
                      )}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center w-[100px]">Streak</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                dates={dates}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewStats={onViewStats}
              />
            ))}

            {habits.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={dates.length + 3}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="size-12 rounded-full bg-secondary/50 flex items-center justify-center">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <p className="font-medium text-sm">No habits yet</p>
                    <p className="text-xs text-muted-foreground/60">
                      Create one to start your journey.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
