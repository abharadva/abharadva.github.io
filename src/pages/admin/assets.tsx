// src/pages/admin/assets.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import AssetManager from "@/components/admin/AssetManager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminAssetsPage() {
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
      <AssetManager />
    </AdminLayout>
  );
}