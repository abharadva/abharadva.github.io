// src/pages/admin/finance.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import FinanceManager from "@/components/admin/finance-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminFinancePage() {
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
      <FinanceManager />
    </AdminLayout>
  );
}
