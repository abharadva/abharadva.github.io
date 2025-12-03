// src/pages/admin/analytics.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminAnalyticsPage() {
  const { isLoading } = useAuthGuard();

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AnalyticsDashboard />
    </AdminLayout>
  );
}
