// src/components/admin/DashboardOverview.tsx
import React, { useMemo } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle,
  BrainCircuit,
  ListTodo,
  StickyNote,
  Timer,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Plus,
  AlertOctagon,
  Pin,
  Target,
  FileText,
  CalendarClock,
  Repeat,
  Eye,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../ui/button";
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
import { cn, getNextOccurrence } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { addDays, format, isAfter, isBefore, isSameDay } from "date-fns";

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

  const upcomingRecurring = useMemo(() => {
    const today = new Date();
    const next7Days = addDays(today, 7);
    const upcoming: {
      description: string;
      date: Date;
      amount: number;
      type: "earning" | "expense";
    }[] = [];
    recurring.forEach((rule) => {
      let cursor = rule.last_processed_date
        ? new Date(rule.last_processed_date)
        : new Date(rule.start_date);
      if (isBefore(cursor, new Date(rule.start_date)))
        cursor = new Date(rule.start_date);
      let nextOccurrence = new Date(cursor);
      if (isBefore(nextOccurrence, today)) {
        nextOccurrence = getNextOccurrence(cursor, rule);
      }
      if (
        (isAfter(nextOccurrence, today) || isSameDay(nextOccurrence, today)) &&
        isBefore(nextOccurrence, next7Days)
      ) {
        upcoming.push({
          description: rule.description,
          date: nextOccurrence,
          amount: rule.amount,
          type: rule.type,
        });
      }
    });
    return upcoming
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }, [recurring]);

  const goalProgress = primaryGoal
    ? (primaryGoal.current_amount / primaryGoal.target_amount) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <Zap className="text-primary" /> Action Center
              </CardTitle>
              <CardDescription>
                What needs your attention right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {overdueTasks.length === 0 &&
              tasksDueToday.length === 0 &&
              pinnedNotes.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8">
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
                      className="flex items-center gap-3 p-3 -mx-3 rounded-md hover:bg-destructive/10 cursor-pointer"
                      onClick={() => onNavigate("/admin/tasks")}
                    >
                      <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
                      <div>
                        <p className="font-semibold text-sm leading-tight text-destructive">
                          {task.title}
                        </p>
                        <p className="text-xs text-destructive/80">
                          Overdue Task
                        </p>
                      </div>
                    </div>
                  ))}
                  {tasksDueToday.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 -mx-3 rounded-md hover:bg-secondary cursor-pointer"
                      onClick={() => onNavigate("/admin/tasks")}
                    >
                      <ListTodo className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm leading-tight">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Task Due Today
                        </p>
                      </div>
                    </div>
                  ))}
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-3 p-3 -mx-3 rounded-md hover:bg-secondary cursor-pointer"
                      onClick={() => onNavigate("/admin/notes")}
                    >
                      <Pin className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-sm leading-tight">
                          {note.title || "Untitled Note"}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="truncate">
                      <Badge
                        variant={post.published ? "default" : "secondary"}
                        className="mr-2 h-5"
                      >
                        {post.published ? "Pub" : "Draft"}
                      </Badge>
                      <span className="font-medium truncate">{post.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
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
                  margin={{ top: 5, right: 0, left: 0, bottom: -10 }}
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
                    radius={2}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="hsl(var(--chart-5))"
                    radius={2}
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
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Upcoming Deadlines
                </h4>
                {tasksDueSoon.length > 0 ? (
                  tasksDueSoon.map((task) => (
                    <div
                      key={task.id}
                      className="text-sm flex justify-between items-center py-1"
                    >
                      <span>{task.title}</span>
                      <span className="font-mono text-xs">
                        {format(new Date(task.due_date!), "MMM d")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No tasks due soon.
                  </p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Recurring Transactions
                </h4>
                {upcomingRecurring.length > 0 ? (
                  upcomingRecurring.map((item, i) => (
                    <div
                      key={i}
                      className="text-sm flex justify-between items-center py-1"
                    >
                      <span className="truncate max-w-[140px]">
                        {item.description}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs",
                          item.type === "earning"
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {item.type === "earning" ? "+" : "-"}$
                        {item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No recurring payments soon.
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
