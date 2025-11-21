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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CalendarDays, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const Heatmap = ({
  data,
  days,
}: {
  data: Record<string, number>;
  days: Date[];
}) => {
  const getColorClass = (minutes: number) => {
    if (minutes <= 0) return "bg-secondary";
    if (minutes < 30) return "bg-primary/20";
    if (minutes < 60) return "bg-primary/40";
    if (minutes < 120) return "bg-primary/70";
    return "bg-primary";
  };

  if (!days || days.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const minutes = data[dayStr] || 0;
          return (
            <Tooltip key={dayStr}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "aspect-square rounded-[2px]",
                    getColorClass(minutes),
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">
                  {minutes > 0 ? `${minutes} minutes` : "No activity"} on{" "}
                  {format(day, "MMM dd, yyyy")}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

const SessionTimeline = ({
  sessions,
  topics,
}: {
  sessions: LearningSession[];
  topics: Record<string, string>;
}) => (
  <ScrollArea className="h-[400px]">
    <div className="space-y-6 pr-4">
      {sessions.map((session) => (
        <div key={session.id} className="relative pl-8">
          <div className="absolute left-0 top-1 flex size-3.5 items-center justify-center rounded-full bg-secondary">
            <div className="size-2 rounded-full bg-primary" />
          </div>
          <div className="absolute left-[6px] top-5 h-full w-px bg-border" />
          <p className="text-xs text-muted-foreground">
            {format(new Date(session.start_time), "MMM dd, yyyy - hh:mm a")}
          </p>
          <p className="font-semibold">
            {topics[session.topic_id] || "Unknown Topic"}
          </p>
          <p className="text-sm font-mono text-primary">
            {session.duration_minutes || 0} min
          </p>
          {session.journal_notes && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              "{session.journal_notes}"
            </p>
          )}
        </div>
      ))}
    </div>
  </ScrollArea>
);

interface LearningDashboardProps {
  sessions: LearningSession[];
  topics: LearningTopic[];
}

export default function LearningDashboard({
  sessions,
  topics,
}: LearningDashboardProps) {
  const topicsMap = (topics || []).reduce(
    (acc, topic) => {
      acc[topic.id] = topic.title;
      return acc;
    },
    {} as Record<string, string>,
  );

  const { heatmapData, gridDays } = useMemo(() => {
    const today = new Date();
    const dataStartDate = subDays(today, 365);
    const gridStartDate = startOfWeek(dataStartDate);
    const gridDays = eachDayOfInterval({ start: gridStartDate, end: today });

    const heatmapData = (sessions || []).reduce(
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" /> Learning Activity
            Heatmap (Last Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap data={heatmapData} days={gridDays} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" /> Recent Session Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(sessions || []).length > 0 ? (
            <SessionTimeline sessions={sessions} topics={topicsMap} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No learning sessions recorded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
