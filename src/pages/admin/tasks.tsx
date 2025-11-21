// src/pages/admin/tasks.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import TaskManager from "@/components/admin/tasks-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminTasksPage() {
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
      <TaskManager />
    </AdminLayout>
  );
}
