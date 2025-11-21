// src/pages/admin/settings.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

export default function AdminSettingsPage() {
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
      <SiteSettingsManager />
    </AdminLayout>
  );
}
