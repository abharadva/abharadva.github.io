// src/components/admin/note-editor.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/types";
import {
  useAddNoteMutation,
  useUpdateNoteMutation,
} from "@/store/api/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, Check } from "lucide-react";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdvancedMarkdownEditor from "./AdvancedMarkdownEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NOTE_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#22d3ee", // cyan
  "#60a5fa", // blue
  "#c084fc", // purple
  "#818cf8", // indigo
];

interface NoteEditorProps {
  note: Note | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NoteEditor({
  note,
  onCancel,
  onSuccess,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(note?.tags?.join(", ") || "");
  const [color, setColor] = useState(note?.color || null);

  const [addNote, { isLoading: isAdding }] = useAddNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const isLoading = isAdding || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const noteDataToSave: Partial<Note> = {
      title: title || null,
      content: content || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      color: color,
    };

    try {
      if (note?.id) {
        await updateNote({ ...noteDataToSave, id: note.id }).unwrap();
      } else {
        await addNote(noteDataToSave).unwrap();
      }
      toast.success("Note saved successfully.");
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to save note", { description: err.message });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <SheetHeader>
          <SheetTitle>{note?.id ? "Edit Note" : "Create New Note"}</SheetTitle>
          <SheetDescription>
            Jot down your thoughts, ideas, and reminders.
          </SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button type="button" variant="ghost" size="icon">
            <X />
          </Button>
        </SheetClose>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full space-y-4 pt-6"
      >
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex gap-2 items-center">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="font-semibold text-lg h-11"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  style={{ backgroundColor: color || undefined }}
                >
                  <div
                    className={cn(
                      "size-5 rounded-full border",
                      !color && "bg-muted",
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-4 gap-2">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="h-8 w-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="size-4 text-white" />}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="col-span-4 h-8"
                    onClick={() => setColor(null)}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 min-h-0">
            <AdvancedMarkdownEditor
              value={content}
              onChange={setContent}
              onImageUploadRequest={() =>
                toast.info("Image upload coming soon.")
              }
              minHeight="100%"
            />
          </div>
          <div>
            <Label htmlFor="tags" className="text-xs text-muted-foreground">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="idea, to-do, reminder"
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />} Save
            Note
          </Button>
        </div>
      </form>
    </>
  );
}
