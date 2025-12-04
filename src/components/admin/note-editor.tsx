// src/components/admin/note-editor.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Loader2, X } from "lucide-react";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

export default function NoteEditor({
  note,
  onSave,
  onCancel,
}: NoteEditorProps) {
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
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const noteDataToSave: Partial<Note> = {
      title: formData.title || null,
      content: formData.content || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    };
    await onSave(noteDataToSave);
    setIsSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="h-full">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              {note?.id ? "Edit Note" : "Create New Note"}
            </SheetTitle>
            <SheetDescription>
              Organize your knowledge into broad categories.
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>
        <form className="h-full space-y-6 pt-6" onSubmit={handleSubmit}>
          <div className="">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="A title for your note"
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Jot down your thoughts..."
              rows={10}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="idea, to-do, reminder"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
