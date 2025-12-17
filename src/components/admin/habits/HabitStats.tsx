"use client";
import React, { useMemo } from "react";
import { Habit } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Zap, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function HabitStats({ habits }: { habits: Habit[] }) {
  const stats = useMemo(() => {
    let totalLogs = 0;
    let totalHabits = habits.length;
    let currentTotalStreak = 0;

    // 1. Calculate XP (Total Logs * 10)
    habits.forEach((h) => {
      const logs = h.habit_logs?.length || 0;
      totalLogs += logs;

      // Simple streak calc for aggregation
      // (Real streak logic is complex, simplified here for the summary card)
      if (logs > 0) currentTotalStreak += 1;
    });

    const xp = totalLogs * 15;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const prevLevelXp = Math.pow(level - 1, 2) * 100;
    const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

    return { totalLogs, xp, level, progress, totalHabits };
  }, [habits]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Level Card */}
      <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="size-32" />
        </div>
        <CardContent className="p-6 flex items-center gap-6 relative z-10">
          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 shadow-inner">
            <span className="text-2xl font-black text-primary">
              {stats.level}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-lg">Consistency Level</h3>
                <p className="text-xs text-muted-foreground">
                  Keep tracking to level up!
                </p>
              </div>
              <span className="font-mono text-xs font-medium text-primary">
                {stats.xp} XP
              </span>
            </div>
            <Progress value={stats.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6 flex flex-col justify-center h-full gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="size-4" /> Active Habits
            </span>
            <span className="font-bold text-lg">{stats.totalHabits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="size-4" /> Total Check-ins
            </span>
            <span className="font-bold text-lg">{stats.totalLogs}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
