"use client";
import { useState, useEffect, FormEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, SubTask } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "inprogress" | "done";

const KANBAN_COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// SubTask Component
const SubTaskList = ({ task, onUpdate }: { task: Task, onUpdate: () => void }) => {
  const [newSubTask, setNewSubTask] = useState("");

  const handleAddSubTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;
    await supabase.from("sub_tasks").insert({ task_id: task.id, title: newSubTask });
    setNewSubTask("");
    onUpdate();
  };

  const handleToggleSubTask = async (subTask: SubTask) => {
    await supabase.from("sub_tasks").update({ is_completed: !subTask.is_completed }).eq("id", subTask.id);
    onUpdate();
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    await supabase.from("sub_tasks").delete().eq("id", subTaskId);
    onUpdate();
  };

  const completedCount = task.sub_tasks?.filter(st => st.is_completed).length || 0;
  const totalCount = task.sub_tasks?.length || 0;

  return (
    <div className="mt-3 space-y-2 pt-2 border-t border-gray-200">
      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-full bg-gray-200 h-1.5 rounded-none border border-black">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${(completedCount / totalCount) * 100}%` }}></div>
          </div>
          <span>{completedCount}/{totalCount}</span>
        </div>
      )}
      {task.sub_tasks?.map(subTask => (
        <div key={subTask.id} className="group flex items-center gap-2">
          <Checkbox id={`subtask-${subTask.id}`} checked={subTask.is_completed} onCheckedChange={() => handleToggleSubTask(subTask)} className="size-4" />
          <label htmlFor={`subtask-${subTask.id}`} className={`flex-grow text-sm ${subTask.is_completed ? 'line-through text-gray-500' : 'text-black'}`}>{subTask.title}</label>
          <button onClick={() => handleDeleteSubTask(subTask.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600"><Trash2 className="size-3" /></button>
        </div>
      ))}
      <form onSubmit={handleAddSubTask} className="flex items-center gap-2">
        <Input value={newSubTask} onChange={e => setNewSubTask(e.target.value)} placeholder="Add a sub-task..." className="h-8 text-sm" />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0"><Plus className="size-4" /></Button>
      </form>
    </div>
  );
};


// Main Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onDragStart, onUpdate }: { task: Task, onEdit: () => void, onDelete: () => void, onDragStart: (e: DragEvent<HTMLDivElement>) => void, onUpdate: () => void }) => {
  const priorityClasses: Record<Priority, string> = {
    low: "bg-blue-200 border-blue-400",
    medium: "bg-yellow-200 border-yellow-400",
    high: "bg-red-200 border-red-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      draggable="true"
      onDragStart={(e: any) => onDragStart(e as unknown as DragEvent<HTMLDivElement>)} // 👈 type cast
      className="group cursor-grab active:cursor-grabbing rounded-none border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#4f46e5]"
    >
      <p className="font-bold text-black break-words">{task.title}</p>
      {(task.sub_tasks && task.sub_tasks.length > 0) ? <SubTaskList task={task} onUpdate={onUpdate} /> : null}
      {(!task.sub_tasks || task.sub_tasks.length === 0) &&
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <SubTaskList task={task} onUpdate={onUpdate} />
        </div>
      }
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.due_date && <span className="text-xs text-gray-500">{new Date(task.due_date).toLocaleDateString()}</span>}
          <span className={`px-1.5 py-0.5 border text-[10px] font-bold rounded-none ${priorityClasses[task.priority || 'medium']}`}>{task.priority}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}><Edit className="size-3.5" /></Button>
          <Button variant="ghost" size="icon" className="size-7 hover:bg-red-100 hover:text-red-600" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
        </div>
      </div>
    </motion.div>
  );
};


export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const loadTasks = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("tasks").select("*, sub_tasks(*)").order("created_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setTasks(data || []);
    setIsLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const resetForm = () => {
    setTitle(""); setDueDate(""); setPriority("medium"); setEditingTask(null);
  };

  const handleOpenDialog = (task: Task | null = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDueDate(task.due_date || "");
      setPriority(task.priority || "medium");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);
    if (deleteError) setError(deleteError.message);
    else await loadTasks();
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Partial<Task> = { title, due_date: dueDate || null, priority, status: editingTask?.status || 'todo' };

    const { error: dbError } = editingTask
      ? await supabase.from("tasks").update(taskData).eq("id", editingTask.id)
      : await supabase.from("tasks").insert(taskData);

    if (dbError) setError(dbError.message);
    else { setIsDialogOpen(false); resetForm(); await loadTasks(); }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = async (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (!draggedTaskId || tasks.find(t => t.id === draggedTaskId)?.status === status) {
      setDragOverColumn(null);
      return;
    }

    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));

    const { error: updateError } = await supabase.from("tasks").update({ status }).eq("id", draggedTaskId);
    if (updateError) {
      setError(updateError.message);
      loadTasks(); // Revert on error
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };


  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Task Board</h2>
          <p className="text-gray-700">Drag and drop tasks to change their status.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}>+ Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="task-title">Title *</Label>
                <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input id="task-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></DialogClose>
                <Button type="submit">{editingTask ? "Save Changes" : "Create Task"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="font-semibold">Loading tasks...</p>}
      {error && <p className="font-semibold text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map(column => (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={cn("rounded-none border-2 border-black bg-gray-100 p-3 transition-colors", dragOverColumn === column.id && "bg-yellow-200")}
          >
            <h3 className="mb-4 border-b-2 border-black pb-2 text-lg font-bold text-black">{column.title} ({tasks.filter(t => t.status === column.id).length})</h3>
            <div className="space-y-3 min-h-[200px]">
              <AnimatePresence>
                {tasks.filter(t => t.status === column.id).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onEdit={() => handleOpenDialog(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onUpdate={loadTasks}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}