// src/components/admin/tasks/TaskTreeView.tsx
"use client";

import React, { useState } from "react";
import { Task, SubTask } from "@/types";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Calendar,
  Edit,
  Trash2,
  Plus,
  CornerDownRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { TaskPriorityPill } from "./TaskPriorityPill";
import { TaskStatusPill } from "./TaskStatusPill";
import { useAppDispatch } from "@/store/hooks";
import { startFocus } from "@/store/slices/focusSlice";
import { toast } from "sonner";

interface TaskTreeViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddSubTask: (taskId: string) => void;
  onUpdateSubTask: (id: string, is_completed: boolean) => void;
  onDeleteSubTask: (id: string) => void;
}

export function TaskTreeView({
  tasks,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onAddSubTask,
  onUpdateSubTask,
  onDeleteSubTask,
}: TaskTreeViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleStartFocus = (task: Task) => {
    dispatch(
      startFocus({
        durationMinutes: 25,
        taskTitle: task.title,
        taskId: task.id,
      })
    );
    toast.success("Focus timer started for task");
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
        <CheckCircle2 className="size-10 mb-4 opacity-20" />
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-full md:w-[40%] pl-4">Title</TableHead>
            {/* Hide secondary columns on mobile */}
            <TableHead className="hidden md:table-cell w-[15%]">
              Status
            </TableHead>
            <TableHead className="hidden md:table-cell w-[15%]">
              Priority
            </TableHead>
            <TableHead className="hidden md:table-cell w-[15%]">
              Due Date
            </TableHead>
            <TableHead className="w-[15%] text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              {/* PARENT TASK ROW */}
              <TableRow className="group hover:bg-muted/30 transition-colors border-b-border/50">
                <TableCell className="py-3 pl-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 shrink-0 transition-transform",
                        (task.sub_tasks?.length || 0) === 0 &&
                          "opacity-0 pointer-events-none",
                      )}
                      onClick={() => toggleExpand(task.id)}
                    >
                      {expandedTasks.has(task.id) ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </Button>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium truncate max-w-[150px] sm:max-w-xs cursor-pointer hover:text-primary transition-colors",
                          task.status === "done" &&
                            "text-muted-foreground line-through decoration-border",
                        )}
                        onClick={() => onEditTask(task)}
                      >
                        {task.title}
                      </span>
                      {/* Mobile-only status/priority indicator */}
                      <div className="flex md:hidden gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{task.status}</span>
                        <span>•</span>
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    </div>
                    {task.sub_tasks && task.sub_tasks.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 ml-2 text-muted-foreground hidden sm:inline-flex"
                      >
                        {task.sub_tasks.filter((s) => s.is_completed).length}/
                        {task.sub_tasks.length}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell py-3">
                  <div className="w-[120px]">
                    <TaskStatusPill
                      status={task.status as any}
                      onChange={(s) => onUpdateTask(task.id, { status: s })}
                    />
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell py-3">
                  <TaskPriorityPill
                    priority={task.priority as any}
                    onChange={(p) => onUpdateTask(task.id, { priority: p })}
                  />
                </TableCell>

                <TableCell className="hidden md:table-cell py-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    {task.due_date ? (
                      <>
                        <Calendar className="mr-2 size-3.5" />
                        {format(parseLocalDate(task.due_date), "MMM d, yyyy")}
                      </>
                    ) : (
                      <span className="opacity-30 italic">No date</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onAddSubTask(task.id)}
                      title="Add Subtask"
                    >
                      <Plus className="size-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartFocus(task)}>
                          <Zap className="mr-2 size-3.5 text-yellow-500" /> Start Focus
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          <Edit className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>

              {/* SUBTASKS ROWS */}
              {expandedTasks.has(task.id) &&
                task.sub_tasks?.map((subTask: SubTask) => (
                  <TableRow
                    key={subTask.id}
                    className="bg-muted/10 hover:bg-muted/20 border-b-border/30"
                  >
                    <TableCell className="py-2 pl-12 relative">
                      <div className="absolute left-7 top-0 bottom-1/2 w-px bg-border/50" />
                      <div className="absolute left-7 bottom-1/2 w-4 h-px bg-border/50" />

                      <div className="flex items-center gap-3">
                        <CornerDownRight className="size-3.5 text-muted-foreground/40 shrink-0" />
                        <Checkbox
                          checked={subTask.is_completed}
                          onCheckedChange={(checked) =>
                            onUpdateSubTask(subTask.id, checked as boolean)
                          }
                          className="size-4 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span
                          className={cn(
                            "text-sm truncate",
                            subTask.is_completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
                          )}
                        >
                          {subTask.title}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 hidden md:table-cell">
                      {subTask.is_completed && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal border-green-500/20 text-green-600 bg-green-500/5"
                        >
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2 hidden md:table-cell"></TableCell>
                    <TableCell className="py-2 hidden md:table-cell"></TableCell>

                    <TableCell className="text-right pr-4 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteSubTask(subTask.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive/70" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}