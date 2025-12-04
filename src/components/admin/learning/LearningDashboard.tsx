// src/components/admin/learning/LearningDashboard.tsx
"use client";

import React, { useMemo } from "react";
import type { LearningSession, LearningTopic } from "@/types";
import {
  subDays,
  startOfWeek,
  format,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarDays,
  BookOpen,
  Flame,
  Trophy,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Heatmap = ({
  data,
  days,
}: {
  data: Record<string, number>;
  days: Date[];
}) => {
  const getColorClass = (minutes: number) => {
    if (minutes <= 0) return "bg-secondary/50";
    if (minutes < 30) return "bg-primary/30";
    if (minutes < 60) return "bg-primary/50";
    if (minutes < 120) return "bg-primary/80";
    return "bg-primary";
  };

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex flex-col gap-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {days.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const minutes = data[dayStr] || 0;
            return (
              <Tooltip key={dayStr}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-[2px] w-3 h-3 sm:w-4 sm:h-4 transition-all hover:ring-2 hover:ring-ring hover:z-10",
                      getColorClass(minutes),
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  <p className="font-bold">
                    {minutes > 0 ? `${minutes} mins` : "No study"}
                  </p>
                  <p className="text-muted-foreground">
                    {format(day, "MMM do, yyyy")}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex text-[10px] text-muted-foreground justify-end gap-2 items-center px-1 mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-secondary/50 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-primary/30 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-primary/50 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-primary/80 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-primary rounded-[2px]"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default function LearningDashboard({
  sessions,
  topics,
}: {
  sessions: LearningSession[];
  topics: LearningTopic[];
}) {
  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce(
      (acc, s) => acc + (s.duration_minutes || 0),
      0,
    );
    const totalHours = Math.floor(totalMinutes / 60);

    return { totalHours, totalMinutes };
  }, [sessions]);

  const { heatmapData, gridDays } = useMemo(() => {
    const today = new Date();
    // Show roughly 52 weeks
    const dataStartDate = subDays(today, 364);
    const gridStartDate = startOfWeek(dataStartDate);
    const gridDays = eachDayOfInterval({ start: gridStartDate, end: today });

    const heatmapData = sessions.reduce(
      (acc: Record<string, number>, session) => {
        if (session.duration_minutes && session.duration_minutes > 0) {
          const dayStr = format(
            startOfDay(new Date(session.start_time)),
            "yyyy-MM-dd",
          );
          acc[dayStr] = (acc[dayStr] || 0) + session.duration_minutes;
        }
        return acc;
      },
      {},
    );

    return { heatmapData, gridDays };
  }, [sessions]);

  const recentSessions = sessions.slice(0, 6);
  const topicsMap = topics.reduce(
    (acc, t) => ({ ...acc, [t.id]: t.title }),
    {} as Record<string, string>,
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Learning Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your consistency and knowledge growth.
          </p>
        </div>
      </div>

      {/* 1. Full Width Heatmap */}
      <Card className="overflow-hidden border-primary/10 shadow-sm">
        <CardHeader className="pb-4 border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-primary" /> Consistency Graph
          </CardTitle>
          <CardDescription>
            Your daily learning volume over the last year.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-6 overflow-x-auto">
          <div className="min-w-[800px]">
            <Heatmap data={heatmapData} days={gridDays} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Split Section: Stats & Recent Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stats Grid (2/3 width on large screens) */}
        <div className="xl:col-span-2 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="size-4 text-primary" /> All-Time Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tighter text-foreground">
                  {stats.totalHours}
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    hrs
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total tracked time
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flame className="size-4 text-orange-500" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tighter">
                  {
                    sessions.filter(
                      (s) => new Date(s.start_time) > subDays(new Date(), 7),
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Sessions this week
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-green-500" /> Total Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tighter">
                  {topics.length}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Active learning paths
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for future charts or more stats if needed to fill space */}
          <Card className="flex-1 bg-secondary/5 border-dashed flex items-center justify-center min-h-[150px]">
            <div className="text-center text-muted-foreground">
              <BookOpen className="size-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">
                Select a topic from the sidebar to view details.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Sessions (1/3 width) */}
        <div className="xl:col-span-1 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" /> Recent Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-[300px]">
              <ScrollArea className="h-[350px]">
                <div className="p-5 space-y-6">
                  {recentSessions.map((session, i) => (
                    <div
                      key={session.id}
                      className="relative pl-4 border-l border-border pb-1 last:pb-0 group"
                    >
                      <span
                        className={cn(
                          "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background transition-colors",
                          i === 0
                            ? "bg-primary"
                            : "bg-muted-foreground group-hover:bg-primary/70",
                        )}
                      />
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                              {format(
                                new Date(session.start_time),
                                "MMM d • h:mm a",
                              )}
                            </span>
                            <p className="font-semibold text-sm mt-0.5 line-clamp-1 text-foreground">
                              {topicsMap[session.topic_id] || "Unknown Topic"}
                            </p>
                          </div>
                          <div className="bg-secondary px-2 py-0.5 rounded text-xs font-mono font-medium whitespace-nowrap">
                            {session.duration_minutes} min
                          </div>
                        </div>
                        {session.journal_notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">
                            "{session.journal_notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {recentSessions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm italic">No history available.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
