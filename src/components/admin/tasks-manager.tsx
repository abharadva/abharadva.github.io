
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
import { Trash2, Edit, Plus, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "inprogress" | "done";

const KANBAN_COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

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
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="mt-3 space-y-2 pt-2 border-t">
      {totalCount > 0 && <Progress value={progress} className="h-1.5" />}
      {task.sub_tasks?.map(subTask => (
        <div key={subTask.id} className="group flex items-center gap-2">
          <Checkbox id={`subtask-${subTask.id}`} checked={subTask.is_completed} onCheckedChange={() => handleToggleSubTask(subTask)} />
          <label htmlFor={`subtask-${subTask.id}`} className={`flex-grow text-sm ${subTask.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{subTask.title}</label>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteSubTask(subTask.id)} className="h-6 w-6 opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></Button>
        </div>
      ))}
      <form onSubmit={handleAddSubTask} className="flex items-center gap-2">
        <Input value={newSubTask} onChange={e => setNewSubTask(e.target.value)} placeholder="Add a sub-task..." className="h-8 text-sm" />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0"><Plus className="size-4" /></Button>
      </form>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onDragStart, onUpdate }: { task: Task, onEdit: () => void, onDelete: () => void, onDragStart: (e: DragEvent<HTMLDivElement>) => void, onUpdate: () => void }) => {
  const priorityClasses: Record<Priority, string> = { low: "bg-blue-500/20 text-blue-400", medium: "bg-yellow-500/20 text-yellow-400", high: "bg-red-500/20 text-red-400" };
  const hasSubtasks = task.sub_tasks && task.sub_tasks.length > 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
      <Card draggable="true" onDragStart={onDragStart} className="group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-foreground break-words pr-2">{task.title}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}><Edit className="size-3.5" /></Button>
              <Button variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
            </div>
          </div>
          {(hasSubtasks || (!hasSubtasks && <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><SubTaskList task={task} onUpdate={onUpdate} /></div>))}
          {hasSubtasks && <SubTaskList task={task} onUpdate={onUpdate} />}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {task.due_date && <span className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</span>}
              <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold rounded-md", priorityClasses[task.priority || 'medium'])}>{task.priority}</span>
            </div>
          </div>
        </CardContent>
      </Card>
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

  const resetForm = () => { setTitle(""); setDueDate(""); setPriority("medium"); setEditingTask(null); };

  const handleOpenDialog = (task: Task | null = null) => {
    if (task) { setEditingTask(task); setTitle(task.title); setDueDate(task.due_date || ""); setPriority(task.priority || "medium"); } 
    else { resetForm(); }
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
    const { error: dbError } = editingTask ? await supabase.from("tasks").update(taskData).eq("id", editingTask.id) : await supabase.from("tasks").insert(taskData);
    if (dbError) setError(dbError.message);
    else { setIsDialogOpen(false); resetForm(); await loadTasks(); }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => { setDraggedTaskId(taskId); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: Status) => { e.preventDefault(); setDragOverColumn(status); };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = async (e: DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (!draggedTaskId || tasks.find(t => t.id === draggedTaskId)?.status === status) { setDragOverColumn(null); return; }
    setTasks(prevTasks => prevTasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));
    const { error: updateError } = await supabase.from("tasks").update({ status }).eq("id", draggedTaskId);
    if (updateError) { setError(updateError.message); loadTasks(); }
    setDraggedTaskId(null); setDragOverColumn(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold">Task Board</h2><p className="text-muted-foreground">Drag and drop tasks to change their status.</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}><Plus className="mr-2 size-4"/>Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div><Label htmlFor="task-title">Title *</Label><Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="task-due-date">Due Date</Label><Input id="task-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                <div><Label htmlFor="task-priority">Priority</Label><Select value={priority} onValueChange={(v: Priority) => setPriority(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></DialogClose>
                <Button type="submit">{editingTask ? "Save Changes" : "Create Task"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
      {error && <p className="font-semibold text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map(column => (
          <div key={column.id} onDragOver={(e) => handleDragOver(e, column.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, column.id)} className={cn("rounded-lg border-2 border-dashed bg-secondary/20 p-3 transition-colors", dragOverColumn === column.id && "border-primary bg-primary/10")}>
            <h3 className="mb-4 border-b pb-2 text-lg font-bold">{column.title} ({tasks.filter(t => t.status === column.id).length})</h3>
            <div className="space-y-3 min-h-[200px]"><AnimatePresence>{tasks.filter(t => t.status === column.id).map(task => (<TaskCard key={task.id} task={task} onDragStart={(e) => handleDragStart(e, task.id)} onEdit={() => handleOpenDialog(task)} onDelete={() => handleDeleteTask(task.id)} onUpdate={loadTasks} />))}</AnimatePresence></div>
          </div>
        ))}
      </div>
    </div>
  );
}