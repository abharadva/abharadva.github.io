// src/components/admin/analytics-dashboard.tsx
"use client";
import React, { useMemo } from "react";
import {
  useGetAnalyticsDataQuery,
  useGetTasksQuery,
} from "@/store/api/adminApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import LoadingSpinner from "./LoadingSpinner";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  startOfDay,
  format,
  subDays,
  eachDayOfInterval,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";

const COLORS = {
  todo: "hsl(var(--muted-foreground))",
  inprogress: "hsl(var(--primary))",
  done: "hsl(var(--chart-2))",
};

const Heatmap = ({ data }: { data: { date: string; count: number }[] }) => {
  const { heatmapData, gridDays } = useMemo(() => {
    const today = startOfDay(new Date());
    // Show fewer days on mobile for better fit
    const daysToShow =
      typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 364;
    const gridStartDate = startOfWeek(subDays(today, daysToShow));
    const days = eachDayOfInterval({ start: gridStartDate, end: today });

    const dataMap = new Map(data.map((item) => [item.date, item.count]));

    return { heatmapData: dataMap, gridDays: days };
  }, [data]);

  const getColorClass = (count: number) => {
    if (count <= 0) return "bg-secondary";
    if (count < 2) return "bg-primary/20";
    if (count < 4) return "bg-primary/40";
    if (count < 6) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-fit">
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {gridDays.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const count = heatmapData.get(dayStr) || 0;
              return (
                <Tooltip key={dayStr}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4 rounded-[2px]",
                        getColorClass(count),
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">
                      {count > 0 ? `${count} tasks completed` : "No tasks"} on{" "}
                      {format(day, "MMM dd, yyyy")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

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

export default function AnalyticsDashboard() {
  const { data: analyticsData, isLoading: isLoadingAnalytics } =
    useGetAnalyticsDataQuery();
  const { data: tasksData, isLoading: isLoadingTasks } = useGetTasksQuery();

  const totalTasks = tasksData?.length ?? 0;
  const completedTasks =
    tasksData?.filter((t) => t.status === "done").length ?? 0;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (isLoadingAnalytics || isLoadingTasks) {
    return <LoadingSpinner />;
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto size-8 mb-4 text-destructive" />
          <h3 className="text-lg font-semibold">
            Could not load analytics data.
          </h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Data-driven insights from your modules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} icon={ListTodo} />
        <StatCard
          title="Task Completion"
          value={`${completionRate.toFixed(0)}%`}
          icon={CheckCircle}
        />
        <StatCard
          title="Top Learning Subject"
          value={analyticsData.learning_time_by_subject?.[0]?.name || "N/A"}
          icon={BookOpen}
        />
        <StatCard
          title="Most Viewed Post"
          value={analyticsData.top_blog_posts?.[0]?.title || "N/A"}
          subValue={`${(analyticsData.top_blog_posts?.[0]?.views || 0).toLocaleString()} views`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analyticsData.task_status_distribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {(analyticsData.task_status_distribution || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[entry.name as keyof typeof COLORS] ||
                            COLORS.todo
                          }
                        />
                      ),
                    )}
                  </Pie>
                  <RechartsTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={analyticsData.tasks_completed_weekly || []}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" /> Productivity
            Heatmap
          </CardTitle>
          <CardDescription>
            Visualizing when you complete the most tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap data={analyticsData.productivity_heatmap || []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Blog Posts by Views</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Title</TableHead>
                  <TableHead className="text-right pr-4">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.top_blog_posts?.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium truncate max-w-[200px] pl-4">
                      {post.title}
                    </TableCell>
                    <TableCell className="text-right font-mono pr-4">
                      {post.views.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!analyticsData.top_blog_posts ||
                  analyticsData.top_blog_posts.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground h-24"
                    >
                      No posts yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Learning Time by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.learning_time_by_subject || []}
                  layout="vertical"
                  margin={{ left: 0, right: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                    width={100}
                  />
                  <RechartsTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    layout="vertical"
                  >
                    {(analyticsData.learning_time_by_subject || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[entry.name as keyof typeof COLORS] ||
                            COLORS.done
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
