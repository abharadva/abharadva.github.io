import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/supabase/client";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { BlogPost, Note } from "@/types";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

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
  pinnedNotes: Pick<Note, 'id' | 'title' | 'content'>[];
}

export default function AdminIndexPage() {
  const { isLoading: isAuthLoading, session } = useAuthGuard();
  const [dashboardData, setDashboardData] = useState<DashboardData>({ stats: null, recentPosts: [], pinnedNotes: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (session) {
      const fetchDashboardData = async () => {
        try {
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

          const [
            { count: totalPosts, error: tpError },
            { count: portfolioSections, error: psError },
            { count: portfolioItems, error: piError },
            { data: recentPostsData, error: rpError },
            { count: pendingTasksCount, error: ptError },
            { count: totalNotesCount, error: tnError },
            { data: pinnedNotesData, error: pnError },
            { data: monthlyTransactionsData, error: mtError },
            { data: totalViewsRes, error: tvError },
            { count: tasksCompletedCount, error: tcError },
            { data: learningSessionsData, error: lsError },
            { count: topicsInProgressCount, error: tipError },
          ] = await Promise.all([
            supabase.from("blog_posts").select("*", { count: "exact", head: true }),
            supabase.from("portfolio_sections").select("*", { count: "exact", head: true }),
            supabase.from("portfolio_items").select("*", { count: "exact", head: true }),
            supabase.from("blog_posts").select("id, title, updated_at, slug").order("updated_at", { ascending: false }).limit(3),
            supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
            supabase.from("notes").select("*", { count: "exact", head: true }),
            supabase.from("notes").select("id, title, content").eq("is_pinned", true).limit(3),
            supabase.from("transactions").select("type, amount").gte('date', firstDayOfMonth),
            supabase.rpc('get_total_blog_views'),
            supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done").gte("updated_at", startOfWeek),
            supabase.from("learning_sessions").select("duration_minutes").gte('start_time', firstDayOfMonth),
            supabase.from("learning_topics").select("*", { count: "exact", head: true }).in('status', ['Learning', 'Practicing']),
          ]);

          const errors = [tpError, psError, piError, rpError, ptError, tnError, pnError, mtError, tvError, tcError, lsError, tipError].filter(Boolean);
          if (errors.length > 0) throw new Error("Failed to fetch some dashboard data.");

          let monthlyEarnings = 0;
          let monthlyExpenses = 0;
          if (monthlyTransactionsData) {
            for (const t of monthlyTransactionsData) {
              if (t.type === 'earning') monthlyEarnings += t.amount;
              else if (t.type === 'expense') monthlyExpenses += t.amount;
            }
          }
          
          const totalMinutes = learningSessionsData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
          const learningHoursThisMonth = parseFloat((totalMinutes / 60).toFixed(1));

          setDashboardData({
            stats: {
              totalPosts: totalPosts || 0, portfolioSections: portfolioSections || 0, portfolioItems: portfolioItems || 0,
              pendingTasks: pendingTasksCount || 0, totalNotes: totalNotesCount || 0, monthlyEarnings, monthlyExpenses,
              monthlyNet: monthlyEarnings - monthlyExpenses, totalBlogViews: totalViewsRes?.data || 0,
              tasksCompletedThisWeek: tasksCompletedCount || 0, learningHoursThisMonth, topicsInProgress: topicsInProgressCount || 0,
            },
            recentPosts: recentPostsData || [],
            pinnedNotes: pinnedNotesData || [],
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [session]);

  if (isAuthLoading || !session) {
    return (<div className="flex min-h-screen items-center justify-center bg-secondary/30"><LoadingSpinner /></div>);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>
        {isDataLoading ? <LoadingSpinner/> : <DashboardOverview dashboardData={dashboardData} />}
      </div>
    </AdminLayout>
  );
}