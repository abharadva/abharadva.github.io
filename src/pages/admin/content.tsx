import { AdminLayout } from "@/components/admin/AdminLayout";
import ContentManager from "@/components/admin/content-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminContentPage() {
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
      <ContentManager />
    </AdminLayout>
  );
}
