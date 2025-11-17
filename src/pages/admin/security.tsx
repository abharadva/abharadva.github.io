import { AdminLayout } from "@/components/admin/AdminLayout";
import SecuritySettings from "@/components/admin/security-settings";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminSecurityPage() {
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
      <SecuritySettings />
    </AdminLayout>
  );
}