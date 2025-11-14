// src/components/admin/learning/SubjectForm.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import type { LearningSubject } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SubjectFormProps {
  subject: Partial<LearningSubject> | null;
  onSuccess: () => void;
}

export default function SubjectForm({ subject, onSuccess }: SubjectFormProps) {
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (subject) {
      setFormData({ name: subject.name || "", description: subject.description || "" });
    }
  }, [subject]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = subject?.id
      ? await supabase.from("learning_subjects").update(formData).eq("id", subject.id)
      : await supabase.from("learning_subjects").insert(formData);

    if (error) {
      toast.error("Failed to save subject", { description: error.message });
    } else {
      toast.success(`Subject "${formData.name}" saved successfully.`);
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div><Label htmlFor="name">Subject Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus /></div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} /></div>
      <div className="flex justify-end pt-4"><Button type="submit">{subject?.id ? "Save Changes" : "Create Subject"}</Button></div>
    </form>
  );
}