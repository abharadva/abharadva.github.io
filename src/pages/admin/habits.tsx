"use client";
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useGetHabitsQuery,
  useDeleteHabitMutation,
  useToggleHabitLogMutation,
} from "@/store/api/adminApi";
import HabitGrid from "@/components/admin/habits/HabitGrid";
import HabitForm from "@/components/admin/habits/HabitForm";
import HabitStats from "@/components/admin/habits/HabitStats"; // Import
import HabitHeatmapModal from "@/components/admin/habits/HabitHeatmapModal"; // Import
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Habit } from "@/types";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider"; // Confirm
import { PerfectDayBadge } from "@/components/admin/habits/PerfectDayBadge";

export default function AdminHabitsPage() {
  const { isLoading: isAuthLoading } = useAuthGuard();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // New State for Heatmap
  const [selectedHabitForStats, setSelectedHabitForStats] =
    useState<Habit | null>(null);

  const { data: habits = [], isLoading: isDataLoading } = useGetHabitsQuery();
  const [toggleLog] = useToggleHabitLogMutation();
  const [deleteHabit] = useDeleteHabitMutation();
  const confirm = useConfirm();

  const handleToggle = async (habitId: string, date: string) => {
    try {
      await toggleLog({ habit_id: habitId, date }).unwrap();
    } catch {
      toast.error("Failed to update status", {
        action: {
          label: "Retry",
          onClick: () => handleToggle(habitId, date),
        },
      });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Habit?",
      description: "This will remove the habit and all history forever.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteHabit(id).unwrap();
      toast.success("Habit deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const openCreate = () => {
    setEditingHabit(null);
    setIsSheetOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsSheetOpen(true);
  };

  if (isAuthLoading)
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );

  return (
    <AdminLayout title="Habit Tracker">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="size-6 text-primary" /> Habit Tracker
            </h2>
            <p className="text-muted-foreground">
              Level up your life, one day at a time.
            </p>
          </div>
          <Button onClick={openCreate} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 size-4" /> New Habit
          </Button>
        </div>

        {/* 1. Gamified Stats */}
        {!isDataLoading && habits.length > 0 && <HabitStats habits={habits} />}

        <PerfectDayBadge habits={habits} />

        {/* 2. Main Grid */}
        {isDataLoading ? (
          <LoadingSpinner />
        ) : (
          <HabitGrid
            habits={habits}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={openEdit}
            onViewStats={setSelectedHabitForStats} // Pass the handler
          />
        )}

        {/* Forms & Modals */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingHabit ? "Edit Habit" : "Create New Habit"}
              </SheetTitle>
            </SheetHeader>
            <HabitForm
              habit={editingHabit}
              onSuccess={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <HabitHeatmapModal
          habit={selectedHabitForStats}
          isOpen={!!selectedHabitForStats}
          onClose={() => setSelectedHabitForStats(null)}
        />
      </div>
    </AdminLayout>
  );
}
