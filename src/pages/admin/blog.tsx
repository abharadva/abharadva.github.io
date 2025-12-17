// src/pages/admin/blog.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import BlogManager from "@/components/admin/blog-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminBlogPage() {
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
      <BlogManager />
    </AdminLayout>
  );
}
