// src/components/admin/notes-manager.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import NoteEditor from "@/components/admin/note-editor";
import {
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from "@/store/api/adminApi";
import {
  Pin,
  PinOff,
  Edit,
  Trash2,
  Plus,
  StickyNote,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

const NoteCardSkeleton = () => (
  <Card className="flex flex-col h-full">
    <CardHeader>
      <Skeleton className="h-5 w-3/4" />
    </CardHeader>
    <CardContent className="flex-grow space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="flex-col items-start gap-3 border-t pt-4">
      <Skeleton className="h-5 w-1/4" />
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex items-center gap-1">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </CardFooter>
  </Card>
);

export default function NotesManager() {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: notes = [], isLoading, error } = useGetNotesQuery();
  const [addNote, { isLoading: isAdding }] = useAddNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

  const isMutating = isAdding || isUpdating || isDeleting;

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote(null);
  };
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };
  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(noteId).unwrap();
      toast.success("Note deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete note", { description: err.message });
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (isCreating || !editingNote?.id) {
        await addNote(noteData).unwrap();
        toast.success("Note created successfully.");
      } else {
        await updateNote({ ...noteData, id: editingNote.id }).unwrap();
        toast.success("Note updated successfully.");
      }
      handleCancel();
    } catch (err: any) {
      toast.error("Failed to save note", { description: err.message });
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await updateNote({ id: note.id, is_pinned: !note.is_pinned }).unwrap();
      toast.success(note.is_pinned ? "Note unpinned." : "Note pinned.");
    } catch (err: any) {
      toast.error("Failed to update pin status", { description: err.message });
    }
  };

  if (isCreating || editingNote) {
    return (
      <NoteEditor
        note={editingNote}
        onSave={handleSaveNote}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personal Notes</h2>
          <p className="text-muted-foreground">
            A space for your thoughts and reminders.
          </p>
        </div>
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 size-4" /> Create New Note
        </Button>
      </div>

      {isLoading && !notes.length && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!!error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error && typeof error === "object" && "message" in error
              ? String((error as { message: unknown }).message)
              : "Failed to load notes"}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && notes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <StickyNote className="mx-auto size-12" />
          <h3 className="mt-4 text-lg font-semibold">No notes yet.</h3>
          <p className="mt-1 mb-4">
            Click the button below to start jotting down your thoughts.
          </p>
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 size-4" /> Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`flex flex-col h-full ${note.is_pinned ? "bg-secondary" : "bg-card"}`}
                >
                  <CardHeader>
                    {note.title && (
                      <CardTitle className="truncate">{note.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="line-clamp-4 text-sm text-muted-foreground">
                      {note.content || (
                        <span className="italic">No content.</span>
                      )}
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-3 border-t pt-4">
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Updated:{" "}
                        {new Date(note.updated_at || "").toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={isMutating}
                          onClick={() => handleTogglePin(note)}
                          title={note.is_pinned ? "Unpin" : "Pin"}
                        >
                          {note.is_pinned ? (
                            <PinOff className="size-4 text-primary" />
                          ) : (
                            <Pin className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={isMutating}
                          onClick={() => handleEditNote(note)}
                          title="Edit"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-destructive/10 hover:text-destructive"
                          disabled={isMutating}
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
