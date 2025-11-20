// src/pages/admin/index.tsx
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useGetDashboardDataQuery } from "@/store/api/adminApi";
import type { BlogPost, Note } from "@/types";

export interface DashboardData {
  stats: {
    totalPosts: number;
    portfolioSections: number;
    portfolioItems: number;
    pendingTasks: number;
    totalNotes: number;
    monthlyEarnings: number;
    monthlyExpenses: number;
    monthlyNet: number;
    totalBlogViews: number;
    tasksCompletedThisWeek: number;
    learningHoursThisMonth: number;
    topicsInProgress: number;
  } | null;
  recentPosts: Pick<BlogPost, "id" | "title" | "updated_at" | "slug">[];
  pinnedNotes: Pick<Note, "id" | "title" | "content">[];
}

export default function AdminIndexPage() {
  const { isLoading: isAuthLoading, session } = useAuthGuard();
  const { data: dashboardData, isLoading: isDataLoading } =
    useGetDashboardDataQuery(undefined, {
      skip: !session,
    });

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
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your portfolio overview.
          </p>
        </div>
        {isDataLoading || !dashboardData ? (
          <LoadingSpinner />
        ) : (
          <DashboardOverview dashboardData={dashboardData} />
        )}
      </div>
    </AdminLayout>
  );
}
