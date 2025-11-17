import { AdminLayout } from "@/components/admin/AdminLayout";
import LearningManager from "@/components/admin/learning-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminLearningPage() {
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
      <LearningManager />
    </AdminLayout>
  );
}