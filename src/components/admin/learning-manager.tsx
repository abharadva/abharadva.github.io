"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase/client";
import type { LearningSubject, LearningTopic, LearningSession } from "@/types";
import { Plus, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectTopicTree from "./learning/SubjectTopicTree";
import TopicEditor from "./learning/TopicEditor";
import LearningDashboard from "./learning/LearningDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SubjectForm from "./learning/SubjectForm";
import TopicForm from "./learning/TopicForm";
import { toast } from "sonner";
import { useLearningSession } from "@/context/LearningSessionContext"; // Import the context hook

type DialogState = 
  | { type: 'create-subject' }
  | { type: 'edit-subject', data: LearningSubject }
  | { type: 'create-topic', subjectId: string }
  | { type: 'edit-topic', data: LearningTopic }
  | null;

export default function LearningManager() {
  const [subjects, setSubjects] = useState<LearningSubject[]>([]);
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [activeTopic, setActiveTopic] = useState<LearningTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  
  // Get session state from the context instead of props
  const { activeSession, elapsedTime, startSession, stopSession, cancelSession } = useLearningSession();

  const refreshAllStructuralData = useCallback(async () => {
    const [subjectsRes, topicsRes] = await Promise.all([
      supabase.from("learning_subjects").select("*").order("name"),
      supabase.from("learning_topics").select("*").order("title"),
    ]);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (topicsRes.data) setTopics(topicsRes.data);
  }, []);

  const refreshSessions = useCallback(async () => {
    const { data } = await supabase.from("learning_sessions").select("*").order("start_time", { ascending: false }).limit(100);
    if (data) setSessions(data);
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await Promise.all([refreshAllStructuralData(), refreshSessions()]);
      setIsLoading(false);
    };
    initialFetch();
  }, [refreshAllStructuralData, refreshSessions]);

  const handleOptimisticTopicUpdate = (updatedTopic: LearningTopic) => {
    setTopics(prevTopics => prevTopics.map(t => t.id === updatedTopic.id ? updatedTopic : t));
    if (activeTopic?.id === updatedTopic.id) {
        setActiveTopic(updatedTopic);
    }
  };

  const handleSelectTopic = (topic: LearningTopic) => { setActiveTopic(topic); };
  const handleDeselectTopic = () => { setActiveTopic(null); };
  const handleSaveSuccess = () => { setDialogState(null); refreshAllStructuralData(); };

  const handleDelete = async (type: 'subject' | 'topic', id: string) => {
    const tableName = type === 'subject' ? 'learning_subjects' : 'learning_topics';
    if (!confirm(`Are you sure you want to delete this ${type}? This will also delete all nested items.`)) return;
    
    if (type === 'topic' && activeTopic?.id === id) {
        setActiveTopic(null);
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) { toast.error(`Failed to delete ${type}`, { description: error.message }); }
    else {
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
      refreshAllStructuralData();
    }
  };
  
  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="size-6 text-primary"/>Knowledge Hub</h2><p className="text-muted-foreground">Track subjects, topics, and learning sessions.</p></div>
          <Button onClick={() => setDialogState({ type: 'create-subject' })}><Plus className="mr-2 size-4" />New Subject</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="p-4 rounded-lg border bg-card/50 sticky top-28">
              <SubjectTopicTree subjects={subjects} topics={topics} activeTopicId={activeTopic?.id} activeSession={activeSession} onSelectTopic={handleSelectTopic} onCreateSubject={() => setDialogState({ type: 'create-subject' })} onEditSubject={(subject) => setDialogState({ type: 'edit-subject', data: subject })} onDeleteSubject={(id) => handleDelete('subject', id)} onCreateTopic={(subjectId) => setDialogState({ type: 'create-topic', subjectId })} onEditTopic={(topic) => setDialogState({ type: 'edit-topic', data: topic })} onDeleteTopic={(id) => handleDelete('topic', id)} />
            </div>
          </aside>
          <main className="lg:col-span-3">
            {activeTopic ? (
              <TopicEditor
                key={activeTopic.id}
                topic={activeTopic} 
                onBack={handleDeselectTopic} 
                onTopicUpdate={handleOptimisticTopicUpdate} 
                onSessionEnd={refreshSessions} 
              />
            ) : (
              <LearningDashboard sessions={sessions} topics={topics} />
            )}
          </main>
        </div>
      </div>
      <Dialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent>
          {dialogState?.type === 'create-subject' && (<><DialogHeader><DialogTitle>Create New Subject</DialogTitle></DialogHeader><SubjectForm subject={null} onSuccess={handleSaveSuccess} /></>)}
          {dialogState?.type === 'edit-subject' && (<><DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader><SubjectForm subject={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
          {dialogState?.type === 'create-topic' && (<><DialogHeader><DialogTitle>Create New Topic</DialogTitle></DialogHeader><TopicForm topic={null} subjects={subjects} defaultSubjectId={dialogState.subjectId} onSuccess={handleSaveSuccess} /></>)}
          {dialogState?.type === 'edit-topic' && (<><DialogHeader><DialogTitle>Edit Topic</DialogTitle></DialogHeader><TopicForm topic={dialogState.data} subjects={subjects} onSuccess={handleSaveSuccess} /></>)}
        </DialogContent>
      </Dialog>
    </>
  );
}