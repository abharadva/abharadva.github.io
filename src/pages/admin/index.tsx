// src/pages/admin/index.tsx
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useGetDashboardDataQuery } from "@/store/api/adminApi";
import type {
  BlogPost,
  Note,
  Task,
  FinancialGoal,
  RecurringTransaction,
} from "@/types";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface DashboardData {
  stats: {
    monthlyNet: number;
    totalBlogViews: number;
  } | null;
  recentPosts: Pick<
    BlogPost,
    "id" | "title" | "updated_at" | "slug" | "published"
  >[];
  pinnedNotes: Pick<Note, "id" | "title" | "content">[];
  overdueTasks: Pick<Task, "id" | "title">[];
  tasksDueToday: Pick<Task, "id" | "title">[];
  tasksDueSoon: Pick<Task, "id" | "title" | "due_date">[];
  dailyExpenses: { day: string; total: number }[];
  dailyEarnings: { day: string; total: number }[];
  recurring: RecurringTransaction[];
  primaryGoal: FinancialGoal | null;
}

export default function AdminIndexPage() {
  const { isLoading: isAuthLoading, session } = useAuthGuard();
  const router = useRouter();

  const { data: dashboardData, isLoading: isDataLoading } =
    useGetDashboardDataQuery(undefined, {
      skip: !session,
    });

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (isAuthLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your portfolio's command center.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/admin/blog")}>
                New Blog Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/tasks")}>
                New Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/notes")}>
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/finance")}>
                New Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isDataLoading || !dashboardData ? (
          <LoadingSpinner />
        ) : (
          <DashboardOverview
            dashboardData={dashboardData}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </AdminLayout>
  );
}
