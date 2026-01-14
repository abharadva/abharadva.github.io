"use client";

import React, { useMemo } from "react";
import {
  Banknote,
  CheckCircle,
  ListTodo,
  TrendingUp,
  Target,
  CalendarClock,
  Repeat,
  Eye,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  AlertOctagon,
  Pin,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardData } from "@/pages/admin";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn, getNextOccurrence, parseLocalDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addDays, format, isAfter, isBefore, startOfDay, isSameDay } from "date-fns";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  subValue?: string;
}> = ({ title, value, icon: Icon, subValue }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </CardContent>
  </Card>
);

interface DashboardOverviewProps {
  dashboardData: DashboardData;
  onNavigate: (path: string) => void;
}

export default function DashboardOverview({
  dashboardData,
  onNavigate,
}: DashboardOverviewProps) {
  const {
    stats,
    recentPosts,
    pinnedNotes,
    overdueTasks,
    tasksDueToday,
    tasksDueSoon,
    dailyExpenses,
    dailyEarnings,
    recurring,
    primaryGoal,
  } = dashboardData;

  const weeklyChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();
    return last7Days.map((day) => {
      const expense = dailyExpenses.find((e) => e.day === day);
      const earning = dailyEarnings.find((e) => e.day === day);
      return {
        day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        earnings: earning?.total || 0,
        expenses: expense?.total || 0,
      };
    });
  }, [dailyExpenses, dailyEarnings]);

  // --- RECURRING FORECAST LOGIC ---
  const upcomingRecurring = useMemo(() => {
    const today = startOfDay(new Date());
    const next7Days = addDays(today, 8); // Look 7 days ahead (inclusive)
    
    // Create a flat list of all occurrences within the window
    const occurrences: {
      id: string;
      description: string;
      date: Date;
      amount: number;
      type: "earning" | "expense";
    }[] = [];

    recurring.forEach((rule) => {
      // 1. Determine where to start calculating
      let cursor = rule.last_processed_date
        ? parseLocalDate(rule.last_processed_date)
        : parseLocalDate(rule.start_date);

      // 2. Fast-forward cursor to Today if it's in the past
      // (This prevents showing "overdue" items from 2 years ago, we only want the *next* projected ones)
      let safety = 0;
      while (isBefore(cursor, today) && safety < 1000) {
         cursor = getNextOccurrence(cursor, rule);
         safety++;
      }

      // 3. Project forward through the 7-day window
      // This loop ensures DAILY items appear 7 times, Weekly items appear once or twice, etc.
      safety = 0;
      while (isBefore(cursor, next7Days) && safety < 100) {
        const ruleEndDate = rule.end_date ? parseLocalDate(rule.end_date) : null;
        
        // Stop if we passed the rule's end date
        if (ruleEndDate && isAfter(cursor, ruleEndDate)) break;

        // If cursor matches or is after today, add to list
        if (isAfter(cursor, today) || isSameDay(cursor, today)) {
          occurrences.push({
            id: `${rule.id}-${cursor.getTime()}`, // Unique ID for key
            description: rule.description,
            date: new Date(cursor),
            amount: rule.amount,
            type: rule.type,
          });
        }

        // Move to next slot
        cursor = getNextOccurrence(cursor, rule);
        safety++;
      }
    });

    // Sort chronologically
    return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5); // Limit to top 5 for UI space
  }, [recurring]);

  const goalProgress = primaryGoal
    ? Math.min((primaryGoal.current_amount / primaryGoal.target_amount) * 100, 100)
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Blog Views"
          value={stats?.totalBlogViews.toLocaleString() || "0"}
          icon={Eye}
        />
        <StatCard
          title="This Month's Net"
          value={`$${stats?.monthlyNet.toFixed(2) || "0.00"}`}
          icon={Banknote}
        />
        <StatCard
          title="Pending Tasks"
          value={overdueTasks.length + tasksDueToday.length}
          icon={ListTodo}
        />
        <StatCard
          title="Primary Goal"
          value={`${goalProgress.toFixed(0)}%`}
          icon={Target}
          subValue={primaryGoal?.name || "No goal set"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Present / "What's going on now?" */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-primary size-5" /> Action Center
              </CardTitle>
              <CardDescription>
                What needs your attention right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {overdueTasks.length === 0 &&
              tasksDueToday.length === 0 &&
              pinnedNotes.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-muted/10">
                  <CheckCircle className="mx-auto size-12 mb-4 text-green-500 opacity-80" />
                  <p className="font-semibold">Inbox Zero</p>
                  <p className="text-sm">
                    All clear! No immediate actions required.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
                      onClick={() => onNavigate("/admin/tasks")}
                    >
                      <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight text-destructive truncate">
                          {task.title}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-destructive/80 mt-0.5">
                          Overdue Task
                        </p>
                      </div>
                    </div>
                  ))}
                  {tasksDueToday.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
                      onClick={() => onNavigate("/admin/tasks")}
                    >
                      <ListTodo className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">
                          {task.title}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                          Due Today
                        </p>
                      </div>
                    </div>
                  ))}
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-3 p-3 rounded-md bg-secondary border border-border cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => onNavigate("/admin/notes")}
                    >
                      <Pin className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">
                          {note.title || "Untitled Note"}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                          Pinned Note
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Past / "What happened?" */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-2 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Badge
                        variant={post.published ? "default" : "secondary"}
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {post.published ? "Pub" : "Draft"}
                      </Badge>
                      <span className="font-medium truncate">{post.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      asChild
                    >
                      <a
                        href={`/blog/view?slug=${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No recent blog posts.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>7-Day Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-40 w-full">
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelClassName="font-bold"
                        className="bg-popover/90 backdrop-blur-sm"
                      />
                    }
                  />
                  <Bar
                    dataKey="earnings"
                    fill="hsl(var(--chart-2))"
                    radius={[2, 2, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="hsl(var(--chart-5))"
                    radius={[2, 2, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Future / "What's going to happen?" */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>7-Day Outlook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <CalendarClock className="size-3" /> Upcoming Tasks
                </h4>
                {tasksDueSoon.length > 0 ? (
                  <div className="space-y-2">
                    {tasksDueSoon.map((task) => (
                      <div
                        key={task.id}
                        className="text-sm flex justify-between items-center p-2 rounded-md bg-secondary/30"
                      >
                        <span className="truncate mr-2 font-medium">
                          {task.title}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap bg-background px-1.5 py-0.5 rounded border">
                          {format(new Date(task.due_date!), "MMM d")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-2">
                    No tasks due in next 7 days.
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Repeat className="size-3" /> Projected Finance
                </h4>
                {upcomingRecurring.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingRecurring.map((item) => (
                      <div
                        key={item.id}
                        className="text-sm flex justify-between items-center p-2 rounded-md bg-secondary/30"
                      >
                        <div className="flex flex-col min-w-0 mr-2">
                          <span className="truncate font-medium">
                            {item.description}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(item.date, "MMM d")}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "font-mono text-xs font-bold whitespace-nowrap flex items-center gap-0.5",
                            item.type === "earning"
                              ? "text-emerald-500"
                              : "text-rose-500",
                          )}
                        >
                          {item.type === "earning" ? (
                            <ArrowUpRight className="size-3" />
                          ) : (
                             <ArrowDownLeft className="size-3" />
                          )}
                          ${item.amount.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-2">
                    No recurring payments scheduled.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}