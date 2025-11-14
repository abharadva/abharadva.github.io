"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full px-3 py-2 border-2 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500  border-black";

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        content: note.content || "",
        tags: note.tags?.join(", ") || "",
      });
    } else {
      setFormData({ title: "", content: "", tags: "" });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    const noteDataToSave: Partial<Note> = {
      title: formData.title || null,
      content: formData.content || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    };
    await onSave(noteDataToSave);
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl "
    >
      <div className="rounded-none border-2 border-black bg-white">
        <div className="border-b-2 border-black bg-gray-100 px-4 py-4">
          <h2 className="text-xl font-bold text-black">
            {note?.id ? "Edit Note" : "Create New Note"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-bold text-black">Title (Optional)</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="A title for your note"
            />
          </div>
          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-bold text-black">Content</label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Jot down your thoughts..."
              rows={10}
            />
          </div>
          <div>
            <label htmlFor="tags" className="mb-1 block text-sm font-bold text-black">Tags (comma-separated)</label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="idea, to-do, reminder"
            />
          </div>
          <div className="flex justify-end gap-3 border-t-2 border-black pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Note"}</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}