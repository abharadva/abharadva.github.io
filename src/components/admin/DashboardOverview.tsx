// src/components/admin/DashboardOverview.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CheckCircle, BrainCircuit, ListTodo, StickyNote, Timer, ExternalLink } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "../ui/button";
import type { DashboardData } from "@/pages/admin";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon?: JSX.Element;
  className?: string;
}> = ({ title, value, icon, className }) => (
  <Card className={(className ?? "") + " bg-card/50 transition-all duration-300 hover:border-primary/50"}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="font-mono text-sm font-medium uppercase text-muted-foreground">
        {title}
      </CardTitle>
      {icon && <div className="text-muted-foreground">{icon}</div>}
    </CardHeader>
    <CardContent>
      <div className="font-mono text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

interface DashboardOverviewProps {
  dashboardData: DashboardData;
}

export default function DashboardOverview({ dashboardData }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xl font-bold text-foreground">This Month's Summary</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!dashboardData.stats ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          ) : (
            <>
              <StatCard
                title="Monthly Earnings"
                value={dashboardData.stats.monthlyEarnings.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
                icon={<TrendingUp className="size-4" />}
              />

              <StatCard
                title="Monthly Expenses"
                value={dashboardData.stats.monthlyExpenses.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
                icon={<TrendingDown className="size-4" />}
              />

              <StatCard
                title="Monthly Net"
                value={dashboardData.stats.monthlyNet.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
                icon={<Banknote className="size-4" />}
              />
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-foreground">At a Glance</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {!dashboardData.stats ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          ) : (
            <>
              <StatCard title="Pending Tasks" value={dashboardData.stats.pendingTasks} icon={<ListTodo className="size-4" />} />
              <StatCard title="Tasks Done (Week)" value={dashboardData.stats.tasksCompletedThisWeek} icon={<CheckCircle className="size-4" />} />
              <StatCard title="Total Notes" value={dashboardData.stats.totalNotes} icon={<StickyNote className="size-4" />} />
              <StatCard title="Topics In Progress" value={dashboardData.stats.topicsInProgress} icon={<BrainCircuit className="size-4" />} />

              <StatCard
                title="Learning (Month)"
                value={`${dashboardData.stats.learningHoursThisMonth} hrs`}
                icon={<Timer className="size-4" />}
              />
            </>
          )}
        </div>
      </div>

      {dashboardData.pinnedNotes.length > 0 && (
        <div>
          <h3 className="mb-3 text-xl font-bold text-foreground">Pinned Notes</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardData.pinnedNotes.map((note) => (
              <Card key={note.id} className="bg-card/50">
                <CardHeader>
                  <CardTitle className="truncate text-base">
                    {note.title || "Untitled Note"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{note.content}</p>

                  <Button size="sm" variant="secondary" className="mt-4 text-xs" asChild>
                    <Link href="/admin/notes">Go to Note</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {dashboardData.recentPosts.length > 0 && (
        <div>
          <h3 className="mb-3 text-xl font-bold text-foreground">Recently Updated Blog Posts</h3>

          <Card className="bg-card/50">
            <CardContent className="p-4 space-y-3">
              {dashboardData.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col items-start gap-2 rounded-lg p-3 hover:bg-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href="/admin/blog"
                      className="font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(post.updated_at || "").toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex w-full shrink-0 space-x-2 sm:w-auto">
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link
                        href={`/blog/view?slug=${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View post: ${post.title}`}
                      >
                        <ExternalLink className="mr-1 size-3.5" /> View
                      </Link>
                    </Button>

                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href="/admin/blog">Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}