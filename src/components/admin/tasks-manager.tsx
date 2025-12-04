// src/components/admin/tasks-manager.tsx
"use client";
import React, { useState, FormEvent, DragEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Edit,
  Plus,
  Loader2,
  MoreHorizontal,
  AlertOctagon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "../ui/separator";

// Constants (as they haven't been moved to a central file yet)
type Priority = "low" | "medium" | "high";
type Status = "todo" | "inprogress" | "done";

const KANBAN_COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];
const TASK_PRIORITIES: Priority[] = ["low", "medium", "high"];

const SubTaskList = ({ task }: { task: Task | null }) => {
  const [newSubTask, setNewSubTask] = useState("");
  const [addSubTask, { isLoading: isAdding }] = useAddSubTaskMutation();
  const [updateSubTask] = useUpdateSubTaskMutation();
  const [deleteSubTask] = useDeleteSubTaskMutation();
  if (!task) return null;

  const handleAddSubTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;
    try {
      await addSubTask({ task_id: task.id, title: newSubTask }).unwrap();
      setNewSubTask("");
    } catch (err) {
      toast.error("Failed to add sub-task.");
    }
  };

  const handleToggleSubTask = async (subTask: SubTask) => {
    try {
      await updateSubTask({
        id: subTask.id,
        is_completed: !subTask.is_completed,
      }).unwrap();
    } catch (err) {
      toast.error("Failed to update sub-task.");
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    try {
      await deleteSubTask(subTaskId).unwrap();
    } catch (err) {
      toast.error("Failed to delete sub-task.");
    }
  };

  return (
    <div className="space-y-3">
      {task.sub_tasks?.map((subTask) => (
        <div
          key={subTask.id}
          className="group flex items-center gap-3 p-2 rounded-md hover:bg-muted"
        >
          <Checkbox
            id={`subtask-${subTask.id}`}
            checked={subTask.is_completed}
            onCheckedChange={() => handleToggleSubTask(subTask)}
          />
          <label
            htmlFor={`subtask-${subTask.id}`}
            className={`flex-grow text-sm ${subTask.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {subTask.title}
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteSubTask(subTask.id)}
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <form onSubmit={handleAddSubTask} className="flex items-center gap-2">
        <Input
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          placeholder="Add a new sub-task..."
          className="h-9 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newSubTask.trim() || isAdding}
        >
          {isAdding ? <Loader2 className="size-4 animate-spin" /> : "Add"}
        </Button>
      </form>
    </div>
  );
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onDragStart,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
}) => {
  const priorityClasses: Record<Priority, string> = {
    low: "border-primary/80",
    medium: "border-yellow-500/80",
    high: "border-destructive/80",
  };
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "done";
  const subtaskProgress = {
    total: task.sub_tasks?.length || 0,
    completed: task.sub_tasks?.filter((st) => st.is_completed).length || 0,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        draggable="true"
        onDragStart={onDragStart}
        className={cn(
          "group cursor-grab active:cursor-grabbing hover:bg-secondary/50 transition-colors relative border-l-4",
          priorityClasses[task.priority || "medium"],
        )}
      >
        <CardContent className="p-3 cursor-pointer" onClick={onEdit}>
          <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-foreground break-words pr-8">
              {task.title}
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {subtaskProgress.total > 0 && (
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    (subtaskProgress.completed / subtaskProgress.total) * 100
                  }
                  className="h-1"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {subtaskProgress.completed}/{subtaskProgress.total}
                </span>
              </div>
            )}
            {task.due_date && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isOverdue
                    ? "text-destructive font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {isOverdue && <AlertOctagon className="size-3.5" />}
                <span>
                  {new Date(task.due_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 size-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </motion.div>
  );
};

const QuickAddTask = ({
  status,
  onAddTask,
}: {
  status: Status;
  onAddTask: (title: string, status: Status) => void;
}) => {
  const [title, setTitle] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title, status);
    setTitle("");
  };
  return (
    <form onSubmit={handleSubmit} className="p-1 mt-auto">
      <div className="relative">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="+ Add a task..."
          className="h-9 pr-10 text-sm bg-card/50"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          disabled={!title.trim()}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </form>
  );
};

export default function TaskManager() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const isMobile = useIsMobile();

  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [addTask, { isLoading: isAdding }] = useAddTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const isMutating = isAdding || isUpdating;

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setEditingTask(null);
  };

  const handleOpenSheet = (task: Task | null = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDueDate(task.due_date || "");
      setPriority(task.priority || "medium");
    } else {
      resetForm();
    }
    setIsSheetOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted.");
    } catch (err: any) {
      toast.error("Failed to delete task", { description: err.message });
    }
  };

  const handleQuickAdd = async (title: string, status: Status) => {
    try {
      await addTask({ title, status, priority: "medium" }).unwrap();
    } catch (err: any) {
      toast.error("Failed to add task", { description: err.message });
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const taskData: Partial<Task> = {
      title,
      due_date: dueDate || null,
      priority,
      status: editingTask?.status || "todo",
    };
    try {
      if (editingTask) {
        await updateTask({ ...taskData, id: editingTask.id }).unwrap();
      } else {
        await addTask(taskData).unwrap();
      }
      toast.success(editingTask ? "Task updated." : "Task created.");
      setIsSheetOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error("Failed to save task", { description: err.message });
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) =>
    setDraggedTaskId(taskId);
  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = async (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (
      !draggedTaskId ||
      tasks.find((t) => t.id === draggedTaskId)?.status === status
    ) {
      setDragOverColumn(null);
      return;
    }
    try {
      await updateTask({ id: draggedTaskId, status }).unwrap();
    } catch (err: any) {
      toast.error("Failed to move task", { description: err.message });
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Board</h2>
          <p className="text-muted-foreground">
            Organize your projects with a drag-and-drop Kanban board.
          </p>
        </div>
        <Button onClick={() => handleOpenSheet()}>
          {" "}
          <Plus className="mr-2 size-4" /> Add Task{" "}
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isMobile && !isLoading ? (
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {KANBAN_COLUMNS.map((col) => (
              <TabsTrigger key={col.id} value={col.id}>
                {col.title} ({tasks.filter((t) => t.status === col.id).length})
              </TabsTrigger>
            ))}
          </TabsList>
          {KANBAN_COLUMNS.map((column) => (
            <TabsContent key={column.id} value={column.id} className="mt-0">
              <div className="space-y-3 min-h-[300px] rounded-lg border bg-secondary/20 p-3">
                <AnimatePresence>
                  {tasks
                    .filter((t) => t.status === column.id)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={() => {}}
                        onEdit={() => handleOpenSheet(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}
                </AnimatePresence>
                {tasks.filter((t) => t.status === column.id).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No tasks here.
                  </div>
                )}
                <QuickAddTask status={column.id} onAddTask={handleQuickAdd} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KANBAN_COLUMNS.map((column) => (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={cn(
                  "rounded-lg bg-secondary/30 flex flex-col transition-colors",
                  dragOverColumn === column.id && "bg-primary/10",
                )}
              >
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">
                    {column.title}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {tasks.filter((t) => t.status === column.id).length}
                    </span>
                  </h3>
                </div>
                <div className="flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto">
                  <AnimatePresence>
                    {tasks
                      .filter((t) => t.status === column.id)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onEdit={() => handleOpenSheet(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                  </AnimatePresence>
                </div>
                <QuickAddTask status={column.id} onAddTask={handleQuickAdd} />
              </div>
            ))}
          </div>
        )
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>
                {editingTask ? "Edit Task" : "Add New Task"}
              </SheetTitle>
              <SheetDescription>
                Fill in the details for your task. Sub-tasks can be added below.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
            <div>
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v: Priority) => setPriority(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div>
              <Label>Sub-tasks</Label>
              <div className="mt-2 p-3 rounded-md border bg-muted/50">
                <SubTaskList task={editingTask} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? (
                  <Loader2 className="animate-spin" />
                ) : editingTask ? (
                  "Save Changes"
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
