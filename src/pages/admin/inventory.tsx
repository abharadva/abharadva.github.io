// src/pages/admin/inventory.tsx
"use client";
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import InventoryManager from "@/components/admin/inventory-manager";

export default function AdminInventoryPage() {
  const { isLoading } = useAuthGuard();

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Inventory">
      <InventoryManager />
    </AdminLayout>
  );
}
