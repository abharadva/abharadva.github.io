// src/components/admin/learning-manager.tsx
"use client";

import { useState } from "react";
import type { LearningSubject, LearningTopic } from "@/types";
import { Plus, BrainCircuit, Loader2, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectTopicTree from "./learning/SubjectTopicTree";
import TopicEditor from "./learning/TopicEditor";
import LearningDashboard from "./learning/LearningDashboard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import SubjectForm from "./learning/SubjectForm";
import TopicForm from "./learning/TopicForm";
import { toast } from "sonner";
import {
  useGetLearningDataQuery,
  useDeleteSubjectMutation,
  useDeleteTopicMutation,
} from "@/store/api/adminApi";
import { useAppSelector } from "@/store/hooks";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type SheetState =
  | { type: "create-subject" }
  | { type: "edit-subject"; data: LearningSubject }
  | { type: "create-topic"; subjectId: string }
  | { type: "edit-topic"; data: LearningTopic }
  | null;

export default function LearningManager() {
  const [activeTopic, setActiveTopic] = useState<LearningTopic | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>(null);

  const { data, isLoading } = useGetLearningDataQuery();
  const { activeSession } = useAppSelector((state) => state.learningSession);

  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const subjects = data?.subjects || [];
  const topics = data?.topics || [];
  const sessions = data?.sessions || [];

  const handleSelectTopic = (topic: LearningTopic) => setActiveTopic(topic);
  const handleDeselectTopic = () => setActiveTopic(null);
  const handleSaveSuccess = () => setSheetState(null);

  const handleDelete = async (type: "subject" | "topic", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;
    if (type === "topic" && activeTopic?.id === id) setActiveTopic(null);
    
    try {
      const mutation = type === "subject" ? deleteSubject : deleteTopic;
      await mutation(id).unwrap();
      toast.success(`${type === 'subject' ? 'Module' : 'Topic'} deleted`);
    } catch (error: any) {
      toast.error("Delete failed", { description: error.message });
    }
  };

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground/30"/>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header - Hidden when editing a topic to give maximum focus space */}
        {!activeTopic && (
           <div className="flex items-center justify-between mb-4 shrink-0 px-2 py-1">
             <div>
               <h2 className="text-2xl font-bold flex items-center gap-2">
                 <GraduationCap className="size-7 text-primary" /> Learning Center
               </h2>
               <p className="text-muted-foreground text-sm">Manage your personal curriculum and knowledge base.</p>
             </div>
             <Button onClick={() => setSheetState({ type: "create-subject" })} className="shadow-sm">
               <Plus className="mr-2 size-4" /> New Module
             </Button>
           </div>
        )}

        <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden ring-1 ring-border/50">
          
          {/* SIDEBAR: Timeline Tree */}
          <ResizablePanel defaultSize={22} minSize={18} maxSize={35} className="bg-muted/5">
            <SubjectTopicTree
              subjects={subjects}
              topics={topics}
              activeTopicId={activeTopic?.id}
              activeSession={activeSession}
              onSelectTopic={handleSelectTopic}
              onCreateSubject={() => setSheetState({ type: "create-subject" })}
              onEditSubject={(subject) => setSheetState({ type: "edit-subject", data: subject })}
              onDeleteSubject={(id) => handleDelete("subject", id)}
              onCreateTopic={(subjectId) => setSheetState({ type: "create-topic", subjectId })}
              onEditTopic={(topic) => setSheetState({ type: "edit-topic", data: topic })}
              onDeleteTopic={(id) => handleDelete("topic", id)}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* MAIN: Dashboard OR Topic Editor */}
          <ResizablePanel defaultSize={78} className="bg-background">
            {activeTopic ? (
              <TopicEditor
                key={activeTopic.id}
                topic={activeTopic}
                onBack={handleDeselectTopic}
                onTopicUpdate={(updated) => {
                  if (activeTopic?.id === updated.id) setActiveTopic(updated);
                }}
              />
            ) : (
              <div className="h-full overflow-y-auto p-6 bg-secondary/5">
                <LearningDashboard sessions={sessions} topics={topics} subjects={subjects} />
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* MODALS */}
      <Sheet open={!!sheetState} onOpenChange={(open) => !open && setSheetState(null)}>
        <SheetContent className="sm:max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <SheetHeader>
              <SheetTitle>
                {sheetState?.type.includes("create") ? "Create" : "Edit"} {sheetState?.type.includes("subject") ? "Module" : "Topic"}
              </SheetTitle>
              <SheetDescription>Configure your learning path details.</SheetDescription>
            </SheetHeader>
            <SheetClose asChild><Button variant="ghost" size="icon"><X className="size-4"/></Button></SheetClose>
          </div>

          {(sheetState?.type === "create-subject" || sheetState?.type === "edit-subject") && (
            <SubjectForm subject={sheetState.type === "edit-subject" ? sheetState.data : null} onSuccess={handleSaveSuccess} />
          )}
          
          {(sheetState?.type === "create-topic" || sheetState?.type === "edit-topic") && (
            <TopicForm 
              topic={sheetState.type === "edit-topic" ? sheetState.data : null} 
              subjects={subjects} 
              defaultSubjectId={sheetState.type === "create-topic" ? sheetState.subjectId : undefined}
              onSuccess={handleSaveSuccess} 
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}