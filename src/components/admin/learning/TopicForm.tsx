// src/components/admin/learning/TopicForm.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import type { LearningTopic, LearningSubject } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TopicFormProps {
  topic: Partial<LearningTopic> | null;
  subjects: LearningSubject[];
  defaultSubjectId?: string;
  onSuccess: () => void;
}

export default function TopicForm({ topic, subjects, defaultSubjectId, onSuccess }: TopicFormProps) {
  const [formData, setFormData] = useState({ title: "", subject_id: defaultSubjectId || "" });

  useEffect(() => {
    if (topic) {
      setFormData({ title: topic.title || "", subject_id: topic.subject_id || "" });
    }
  }, [topic]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id) {
        toast.error("You must select a subject.");
        return;
    }
    
    const { error } = topic?.id
      ? await supabase.from("learning_topics").update(formData).eq("id", topic.id)
      : await supabase.from("learning_topics").insert(formData);

    if (error) {
      toast.error("Failed to save topic", { description: error.message });
    } else {
      toast.success(`Topic "${formData.title}" saved successfully.`);
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div><Label htmlFor="title">Topic Title *</Label><Input id="title" name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required autoFocus /></div>
      <div>
        <Label htmlFor="subject_id">Subject *</Label>
        <Select name="subject_id" value={formData.subject_id} onValueChange={(val) => setFormData({...formData, subject_id: val})} required>
            <SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger>
            <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end pt-4"><Button type="submit">{topic?.id ? "Save Changes" : "Create Topic"}</Button></div>
    </form>
  );
}