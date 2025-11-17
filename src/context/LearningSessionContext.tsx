import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/supabase/client';
import type { LearningSession } from '@/types';

const SESSION_KEY = 'activeLearningSession';

interface LearningSessionContextType {
  activeSession: LearningSession | null;
  elapsedTime: number | null; // Changed from number to number | null
  isLoading: boolean;
  startSession: (topicId: string) => Promise<void>;
  stopSession: (journalNotes: string) => Promise<void>;
  cancelSession: () => Promise<void>;
}

const LearningSessionContext = createContext<LearningSessionContextType | undefined>(undefined);

export const useLearningSession = () => {
  const context = useContext(LearningSessionContext);
  if (!context) {
    throw new Error('useLearningSession must be used within a LearningSessionProvider');
  }
  return context;
};

export const LearningSessionProvider = ({ children }: { children: ReactNode }) => {
  const [activeSession, setActiveSession] = useState<LearningSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null); // Initialize as null
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedSessionJSON = localStorage.getItem(SESSION_KEY);
      if (savedSessionJSON) {
        const savedSession = JSON.parse(savedSessionJSON) as LearningSession;
        if (savedSession?.start_time) {
          setActiveSession(savedSession);
        }
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (activeSession) {
      // Immediately calculate and set the time to prevent flicker
      const start = new Date(activeSession.start_time).getTime();
      setElapsedTime(Math.floor((new Date().getTime() - start) / 1000));

      interval = setInterval(() => {
        // Recalculate start time inside interval to avoid stale closure issues
        const currentStart = new Date(activeSession.start_time).getTime();
        setElapsedTime(Math.floor((new Date().getTime() - currentStart) / 1000));
      }, 1000);
    } else {
      setElapsedTime(null); // Reset to null when there's no session
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = async (topicId: string) => {
    if (activeSession) return;
    setIsLoading(true);
    const { data, error } = await supabase.from("learning_sessions").insert({ topic_id: topicId, start_time: new Date().toISOString() }).select().single();
    if (error) {
      console.error("Failed to start session:", error);
    } else if (data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setActiveSession(data);
    }
    setIsLoading(false);
  };

  const stopSession = async (journalNotes: string) => {
    if (!activeSession) return;
    setIsLoading(true);
    const endTime = new Date();
    const duration_minutes = Math.max(1, Math.round((endTime.getTime() - new Date(activeSession.start_time).getTime()) / 60000));
    const { error } = await supabase.from("learning_sessions").update({ end_time: endTime.toISOString(), duration_minutes, journal_notes: journalNotes || null }).eq("id", activeSession.id);
    if (error) console.error("Failed to stop session:", error);
    localStorage.removeItem(SESSION_KEY);
    setActiveSession(null);
    setElapsedTime(null); // Reset to null
    setIsLoading(false);
  };

  const cancelSession = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    const { error } = await supabase.from("learning_sessions").delete().eq("id", activeSession.id);
    if (error) console.error("Failed to cancel session:", error);
    localStorage.removeItem(SESSION_KEY);
    setActiveSession(null);
    setElapsedTime(null); // Reset to null
    setIsLoading(false);
  };

  return (
    <LearningSessionContext.Provider value={{ activeSession, elapsedTime, isLoading, startSession, stopSession, cancelSession }}>
      {children}
    </LearningSessionContext.Provider>
  );
};