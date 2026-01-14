// src/components/admin/habits/HabitRow.tsx
"use client";
import React, { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Flame, MoreVertical, Edit2, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateHabitStats } from "@/lib/habit-utils";
import confetti from "canvas-confetti";
import HabitCell from "./HabitCell";
import { CircularProgress } from "@/components/ui/circular-progress";

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onViewStats: (habit: Habit) => void;
}

const HabitRow = React.memo(
  ({
    habit,
    dates,
    onToggle,
    onEdit,
    onDelete,
    onViewStats,
  }: HabitRowProps) => {
    const { streak, completionRate } = useMemo(
      () => calculateHabitStats(habit),
      [habit.habit_logs],
    );

    const completedDatesSet = useMemo(
      () => new Set(habit.habit_logs?.map((l) => l.completed_date) || []),
      [habit.habit_logs],
    );

    const handleCheck = (dateStr: string) => {
      const isAlreadyDone = completedDatesSet.has(dateStr);
      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (!isAlreadyDone && dateStr === todayStr) {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: [habit.color, "#ffffff"],
          disableForReducedMotion: true,
        });
      }
      onToggle(habit.id, dateStr);
    };

    return (
      <TableRow className="group hover:bg-muted/30 transition-colors">
        {/* STICKY FIRST COLUMN for Habit Name */}
        <TableCell
          className="font-medium w-[120px] sm:w-[180px] min-w-[120px] sm:min-w-[180px] cursor-pointer sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border/50 group-hover:bg-muted/30 transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] p-3 sm:p-4"
          onClick={() => onViewStats(habit)}
        >
          <div className="flex flex-col justify-center h-full gap-1.5">
            <span
              className="truncate font-semibold text-foreground/90 group-hover:text-primary transition-colors text-sm"
              title={habit.title}
            >
              {habit.title}
            </span>

            {/* Hide stats on mobile to save space */}
            <div className="hidden sm:flex items-center gap-3">
              <CircularProgress
                value={completionRate}
                size={32}
                color={completionRate > 80 ? "#22c55e" : habit.color}
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  Target: {habit.target_per_week}/wk
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {completionRate}% consistency
                </span>
              </div>
            </div>

            {/* Mobile-only condensed stats */}
            <div className="sm:hidden text-[10px] text-muted-foreground flex gap-1">
              <span>{habit.target_per_week}/wk</span>
              <span>•</span>
              <span>{completionRate}%</span>
            </div>
          </div>
        </TableCell>

        {dates.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          return (
            <TableCell
              key={dateStr}
              className="p-0 text-center relative h-full w-10 sm:w-11 min-w-[40px] sm:min-w-[44px]"
            >
              <HabitCell
                dateStr={dateStr}
                isCompleted={completedDatesSet.has(dateStr)}
                color={habit.color}
                onToggle={() => handleCheck(dateStr)}
                isToday={isSameDay(date, new Date())}
              />
            </TableCell>
          );
        })}

        <TableCell className="text-center w-[60px] sm:w-[80px]">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border transition-colors",
              streak > 2
                ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                : "bg-secondary/50 text-muted-foreground border-transparent",
            )}
          >
            {streak}{" "}
            <Flame
              className={cn(
                "size-3 sm:size-3.5",
                streak > 2 && "fill-orange-500 text-orange-600",
              )}
            />
          </div>
        </TableCell>

        <TableCell className="text-right w-[40px] sm:w-[50px] pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewStats(habit)}>
                <BarChart2 className="mr-2 size-3.5" /> Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit2 className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(habit.id)}
              >
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  },
);

HabitRow.displayName = "HabitRow";
export default HabitRow;
