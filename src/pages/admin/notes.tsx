// src/pages/admin/notes.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import NotesManager from "@/components/admin/notes-manager";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminNotesPage() {
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
      <NotesManager />
    </AdminLayout>
  );
}
