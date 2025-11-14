// src/components/admin/learning/SessionTracker.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/supabase/client";
import type { LearningSession, LearningTopic } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Timer, Play, Square, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface SessionTrackerProps {
  topic: LearningTopic | null;
  activeSession: LearningSession | null;
  elapsedTime: number; 
  onStart: (session: LearningSession) => void;
  onStop: () => void;
  onSessionEnd: () => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function SessionTracker({ topic, activeSession, elapsedTime, onStart, onStop, onSessionEnd }: SessionTrackerProps) {
  const [journalNotes, setJournalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    if (!topic) return;
    if (activeSession) {
      toast.warning("Another session is already active.", { description: "Please stop the current session before starting a new one." });
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.from("learning_sessions").insert({ topic_id: topic.id, start_time: new Date().toISOString() }).select().single();
    if (error) toast.error("Failed to start session", { description: error.message });
    else { onStart(data); toast.success(`Session started for "${topic.title}"`); }
    setIsLoading(false);
  };

  const handleStopSession = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    const startTime = new Date(activeSession.start_time);
    const endTime = new Date();
    const duration_minutes = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))); // Ensure at least 1 min
    const { error } = await supabase.from("learning_sessions").update({ end_time: endTime.toISOString(), duration_minutes, journal_notes: journalNotes || null }).eq("id", activeSession.id);
    if (error) toast.error("Failed to stop session", { description: error.message });
    else {
      toast.success(`Session saved! Duration: ${duration_minutes} min.`);
      onStop();
      setJournalNotes("");
      onSessionEnd();
    }
    setIsLoading(false);
  };

  const handleCancelSession = async () => {
    if (!activeSession || !confirm("Are you sure you want to cancel this session? It will be permanently deleted.")) return;
    setIsLoading(true);
    const { error } = await supabase.from("learning_sessions").delete().eq("id", activeSession.id);
    if (error) { toast.error("Failed to cancel session", { description: error.message }); }
    else {
      toast.warning("Session cancelled and deleted.");
      onStop(); // Same state update as stopping
      setJournalNotes("");
      onSessionEnd();
    }
    setIsLoading(false);
  };

  if (!topic) return null;
  const isCurrentTopicSessionActive = activeSession?.topic_id === topic.id;

  return (
    <div className="rounded-lg border bg-secondary/30 p-4 space-y-4">
      <h4 className="flex items-center gap-2 font-semibold text-foreground"><Timer className="size-5 text-primary" /><span>Learning Session</span></h4>
      {isCurrentTopicSessionActive ? (
        <div className="flex items-center justify-between rounded-md bg-background p-3">
          <p className="font-mono text-2xl font-bold tracking-wider text-primary">{formatTime(elapsedTime)}</p>
          <div className="flex gap-2">
            <Button onClick={handleCancelSession} disabled={isLoading} variant="ghost" size="sm">
              <X className="mr-2 size-4" /> Cancel
            </Button>
            <Button onClick={handleStopSession} disabled={isLoading} variant="destructive" size="sm">
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Square className="mr-2 size-4" />} Stop Session
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleStartSession} disabled={isLoading || !!activeSession} className="w-full">
          {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />} Start New Session
        </Button>
      )}
      {isCurrentTopicSessionActive && (
        <div className="space-y-2">
          <Label htmlFor="journal-notes">Session Journal</Label>
          <Textarea id="journal-notes" value={journalNotes} onChange={(e) => setJournalNotes(e.target.value)} placeholder="What did you learn or struggle with?" rows={4} />
        </div>
      )}
    </div>
  );
}