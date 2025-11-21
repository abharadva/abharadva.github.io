// src/components/admin/learning-manager.tsx
"use client";

import { useState } from "react";
import type { LearningSubject, LearningTopic } from "@/types";
import { Plus, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectTopicTree from "./learning/SubjectTopicTree";
import TopicEditor from "./learning/TopicEditor";
import LearningDashboard from "./learning/LearningDashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubjectForm from "./learning/SubjectForm";
import TopicForm from "./learning/TopicForm";
import { toast } from "sonner";
import {
  useGetLearningDataQuery,
  useDeleteSubjectMutation,
  useDeleteTopicMutation,
} from "@/store/api/adminApi";
import { useAppSelector } from "@/store/hooks";

type DialogState =
  | { type: "create-subject" }
  | { type: "edit-subject"; data: LearningSubject }
  | { type: "create-topic"; subjectId: string }
  | { type: "edit-topic"; data: LearningTopic }
  | null;

export default function LearningManager() {
  const [activeTopic, setActiveTopic] = useState<LearningTopic | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const { data, isLoading } = useGetLearningDataQuery();
  const { activeSession } = useAppSelector((state) => state.learningSession);

  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const subjects = data?.subjects || [];
  const topics = data?.topics || [];
  const sessions = data?.sessions || [];

  const handleSelectTopic = (topic: LearningTopic) => {
    setActiveTopic(topic);
  };
  const handleDeselectTopic = () => {
    setActiveTopic(null);
  };
  const handleSaveSuccess = () => {
    setDialogState(null);
  };

  const handleDelete = async (type: "subject" | "topic", id: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this ${type}? This will also delete all nested items.`,
      )
    )
      return;

    if (type === "topic" && activeTopic?.id === id) {
      setActiveTopic(null);
    }

    const mutation = type === "subject" ? deleteSubject : deleteTopic;
    try {
      await mutation(id).unwrap();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
    } catch (error: any) {
      toast.error(`Failed to delete ${type}`, { description: error.message });
    }
  };

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="size-6 text-primary" />
              Knowledge Hub
            </h2>
            <p className="text-muted-foreground">
              Track subjects, topics, and learning sessions.
            </p>
          </div>
          <Button onClick={() => setDialogState({ type: "create-subject" })}>
            <Plus className="mr-2 size-4" />
            New Subject
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="p-4 rounded-lg border bg-card/50 sticky top-28">
              <SubjectTopicTree
                subjects={subjects}
                topics={topics}
                activeTopicId={activeTopic?.id}
                activeSession={activeSession}
                onSelectTopic={handleSelectTopic}
                onCreateSubject={() =>
                  setDialogState({ type: "create-subject" })
                }
                onEditSubject={(subject) =>
                  setDialogState({ type: "edit-subject", data: subject })
                }
                onDeleteSubject={(id) => handleDelete("subject", id)}
                onCreateTopic={(subjectId) =>
                  setDialogState({ type: "create-topic", subjectId })
                }
                onEditTopic={(topic) =>
                  setDialogState({ type: "edit-topic", data: topic })
                }
                onDeleteTopic={(id) => handleDelete("topic", id)}
              />
            </div>
          </aside>
          <main className="lg:col-span-3">
            {activeTopic ? (
              <TopicEditor
                key={activeTopic.id}
                topic={activeTopic}
                onBack={handleDeselectTopic}
                onTopicUpdate={(updatedTopic) => {
                  if (activeTopic?.id === updatedTopic.id) {
                    setActiveTopic(updatedTopic);
                  }
                }}
              />
            ) : (
              <LearningDashboard sessions={sessions} topics={topics} />
            )}
          </main>
        </div>
      </div>
      <Dialog
        open={!!dialogState}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent>
          {dialogState?.type === "create-subject" && (
            <>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
              </DialogHeader>
              <SubjectForm subject={null} onSuccess={handleSaveSuccess} />
            </>
          )}
          {dialogState?.type === "edit-subject" && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
              </DialogHeader>
              <SubjectForm
                subject={dialogState.data}
                onSuccess={handleSaveSuccess}
              />
            </>
          )}
          {dialogState?.type === "create-topic" && (
            <>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <TopicForm
                topic={null}
                subjects={subjects}
                defaultSubjectId={dialogState.subjectId}
                onSuccess={handleSaveSuccess}
              />
            </>
          )}
          {dialogState?.type === "edit-topic" && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Topic</DialogTitle>
              </DialogHeader>
              <TopicForm
                topic={dialogState.data}
                subjects={subjects}
                onSuccess={handleSaveSuccess}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
