// src/components/admin/tasks-manager.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import type { Task, SubTask } from "@/types";
import {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
} from "@/store/api/adminApi";
import { TaskManagerHeader } from "@/components/admin/tasks/TaskManagerHeader";
import { TaskTreeView } from "@/components/admin/tasks/TaskTreeView";
import { TaskKanbanBoard } from "@/components/admin/tasks/TaskKanbanBoard";
import TaskForm from "@/components/admin/tasks/TaskForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TaskManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"table" | "board">("table");
  const [searchTerm, setSearchTerm] = useState("");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [activeParentTaskId, setActiveParentTaskId] = useState<string | null>(
    null,
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Force table view on mobile
  useEffect(() => {
    if (isMobile) {
      setView("table");
    }
  }, [isMobile]);

  // API Hooks
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addSubTask] = useAddSubTaskMutation();
  const [updateSubTask] = useUpdateSubTaskMutation();
  const [deleteSubTask] = useDeleteSubTaskMutation();

  // --- FILTERING & STABLE SORTING ---
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // STABLE SORT FIX: Sort by Creation Date Descending (Newest first).
    return filtered.sort((a, b) => {
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [tasks, searchTerm]);

  // --- HANDLERS ---
  const handleCreateTask = (initialStatus: string = "todo") => {
    setEditingTask({ status: initialStatus as any } as Task);
    setIsSheetOpen(true);
  };
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };
  const handleDeleteTask = async (id: string) => {
    const ok = await confirm({
      title: "Delete Task?",
      description: "This will permanently remove the task and all subtasks.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted");
      if (editingTask?.id === id) setIsSheetOpen(false);
    } catch {
      toast.error("Failed to delete task");
    }
  };
  const openSubtaskDialog = (taskId: string) => {
    setActiveParentTaskId(taskId);
    setNewSubtaskTitle("");
    setIsSubtaskDialogOpen(true);
  };
  const handleCreateSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeParentTaskId || !newSubtaskTitle.trim()) return;
    try {
      await addSubTask({
        task_id: activeParentTaskId,
        title: newSubtaskTitle,
        is_completed: false,
      }).unwrap();
      toast.success("Subtask added");
      setIsSubtaskDialogOpen(false);
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <TaskManagerHeader
        view={view}
        setView={setView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewTask={() => handleCreateTask("todo")}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6 bg-secondary/5">
        <AnimatePresence mode="wait">
          {view === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TaskTreeView
                tasks={filteredTasks}
                onUpdateTask={(id, updates) => updateTask({ id, ...updates })}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddSubTask={openSubtaskDialog}
                onUpdateSubTask={(id, completed) =>
                  updateSubTask({ id, is_completed: completed })
                }
                onDeleteSubTask={(id) => deleteSubTask(id)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              <TaskKanbanBoard
                tasks={filteredTasks}
                onUpdateTask={(id, updates) => updateTask({ id, ...updates })}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onNewTask={handleCreateTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTask?.id ? "Edit Task" : "Create Task"}
            </SheetTitle>
            <SheetDescription>
              Manage task details and subtasks.
            </SheetDescription>
          </SheetHeader>
          <TaskForm
            key={editingTask?.id || "new"}
            task={editingTask}
            onSuccess={() => setIsSheetOpen(false)}
            onClose={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>Quickly add a sub-item.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubtask} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask-title">Title</Label>
              <Input
                id="subtask-title"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
