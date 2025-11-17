"use client";

import React, { useState } from "react";
import type { LearningTopic } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Timer, Play, Square, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLearningSession } from "@/context/LearningSessionContext";

interface SessionTrackerProps {
  topic: LearningTopic | null;
  onSessionEnd: () => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function SessionTracker({ topic, onSessionEnd }: SessionTrackerProps) {
  const [journalNotes, setJournalNotes] = useState("");
  const { activeSession, elapsedTime, isLoading, startSession, stopSession, cancelSession } = useLearningSession();

  const handleStart = async () => {
    if (!topic) return;
    if (activeSession) {
      toast.warning("Another session is already active.", { description: "Please stop the current session before starting a new one." });
      return;
    }
    await startSession(topic.id);
    toast.success(`Session started for "${topic.title}"`);
  };

  const handleStop = async () => {
    if (!activeSession) return;
    const duration_minutes = Math.max(1, Math.round((elapsedTime || 0) / 60));
    await stopSession(journalNotes);
    toast.success(`Session saved! Duration: ${duration_minutes} min.`);
    setJournalNotes("");
    onSessionEnd(); // Refresh session list
  };

  const handleCancel = async () => {
    if (!activeSession || !confirm("Are you sure you want to cancel this session? It will be permanently deleted.")) return;
    await cancelSession();
    toast.warning("Session cancelled and deleted.");
    setJournalNotes("");
    onSessionEnd();
  };

  if (!topic) return null;
  const isCurrentTopicSessionActive = activeSession?.topic_id === topic.id;

  return (
    <div className="rounded-lg border bg-secondary/30 p-4 space-y-4">
      <h4 className="flex items-center gap-2 font-semibold text-foreground"><Timer className="size-5 text-primary" /><span>Learning Session</span></h4>
      {isCurrentTopicSessionActive ? (
        <div className="flex items-center justify-between rounded-md bg-background p-3">
          <p className="font-mono text-2xl font-bold tracking-wider text-primary">{formatTime(elapsedTime || 0)}</p>
          <div className="flex gap-2">
            <Button onClick={handleCancel} disabled={isLoading} variant="ghost" size="sm">
              <X className="mr-2 size-4" /> Cancel
            </Button>
            <Button onClick={handleStop} disabled={isLoading} variant="destructive" size="sm">
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Square className="mr-2 size-4" />} Stop Session
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleStart} disabled={isLoading || !!activeSession} className="w-full">
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