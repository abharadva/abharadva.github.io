import { Habit } from "@/types";
import { subDays, format, differenceInCalendarDays, parseISO } from "date-fns";

export const calculateHabitStats = (habit: Habit) => {
  const logs = habit.habit_logs || [];
  if (logs.length === 0) return { streak: 0, completionRate: 0 };

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // --- 1. COMPLETION RATE (String Comparison) ---
  // Get the string for 13 days ago (making a 14-day window inclusive of today)
  const windowStartStr = format(subDays(today, 13), "yyyy-MM-dd");

  // Filter logs that are lexicographically between start and end
  // This works because "2024-01-02" > "2024-01-01"
  const logsInWindow = logs.filter(
    (l) => l.completed_date >= windowStartStr && l.completed_date <= todayStr,
  ).length;

  // Cap at 100% just in case of weird duplicate data
  const completionRate = Math.min(Math.round((logsInWindow / 14) * 100), 100);

  // --- 2. STREAK CALCULATION (Calendar Days) ---
  // Sort descending (Newest first)
  const sortedLogs = [...logs].sort((a, b) =>
    b.completed_date.localeCompare(a.completed_date),
  );

  let streak = 0;
  // Parse using parseISO which is safer for YYYY-MM-DD strings in date-fns
  // Or better, just use the strings and differenceInCalendarDays logic manually

  const lastLogDate = parseISO(sortedLogs[0].completed_date);
  const diffFromToday = differenceInCalendarDays(today, lastLogDate);

  // Streak is alive if last log was Today (0) or Yesterday (1)
  if (diffFromToday <= 1) {
    streak = 1;
    for (let i = 1; i < sortedLogs.length; i++) {
      const current = parseISO(sortedLogs[i - 1].completed_date);
      const prev = parseISO(sortedLogs[i].completed_date);

      const diff = differenceInCalendarDays(current, prev);

      if (diff === 1) {
        streak++; // Consecutive day
      } else if (diff === 0) {
        continue; // Handle potential duplicates gracefully
      } else {
        break; // Gap found
      }
    }
  }

  return { streak, completionRate };
};
