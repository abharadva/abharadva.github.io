"use client";
import React, { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Flame, MoreVertical, Edit2, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateHabitStats } from "@/lib/habit-utils";
import confetti from "canvas-confetti";
import HabitCell from "./HabitCell"; // Import the optimized cell
import { CircularProgress } from "@/components/ui/circular-progress";

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onViewStats: (habit: Habit) => void;
}

// Helper for Micro-Sparkline
const SparkLine = ({ logs, color }: { logs: string[]; color: string }) => {
  // Map last 7 days. 1 = done, 0 = missed.
  const points = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, "yyyy-MM-dd");
    return logs.includes(dateStr) ? 1 : 0;
  });

  // Create SVG path
  const width = 40;
  const height = 16;
  const step = width / 6;
  const path = points
    .map((val, i) => {
      const x = i * step;
      const y = val === 1 ? 2 : height - 2; // High or Low
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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

    // Create a Set for O(1) lookup during render loop
    const completedDatesSet = useMemo(
      () => new Set(habit.habit_logs?.map((l) => l.completed_date) || []),
      [habit.habit_logs],
    );

    const handleCheck = (dateStr: string) => {
      const isAlreadyDone = completedDatesSet.has(dateStr);

      // Optimistic confetti check
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
        <TableCell
          className="font-medium w-[200px] cursor-pointer"
          onClick={() => onViewStats(habit)}
        >
          <div className="flex flex-col gap-1.5">
            <span
              className="truncate max-w-[120px] font-semibold text-foreground/90 group-hover:text-primary transition-colors"
              title={habit.title}
            >
              {habit.title}
            </span>

            <div className="flex items-center gap-3">
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
          </div>
        </TableCell>

        {dates.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          return (
            <TableCell
              key={dateStr}
              className="p-0 text-center relative h-full"
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

        <TableCell className="text-center">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border transition-colors",
              streak > 2
                ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                : "bg-secondary/50 text-muted-foreground border-transparent",
            )}
          >
            {streak}{" "}
            <Flame
              className={cn(
                "size-3.5",
                streak > 2 && "fill-orange-500 text-orange-600",
              )}
            />
          </div>
        </TableCell>

        <TableCell className="text-right">
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
