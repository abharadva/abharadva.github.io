// src/components/admin/notes-manager.tsx
"use client";
import { useState, useMemo } from "react";
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
  Tag,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent } from "../ui/sheet";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import ReactMarkdown from "react-markdown";
import { ScrollArea, ScrollBar } from "../ui/scroll-area"; // Import ScrollArea

// NoteCard Component (Same as before)
const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <Card
      className={cn(
        "flex flex-col h-full hover:shadow-md transition-shadow duration-300 relative overflow-hidden border-t-4",
        note.is_pinned && "bg-secondary/50",
      )}
      style={{ borderTopColor: note.color || "hsl(var(--border))" }}
    >
      <CardHeader className="pb-2">
        {note.is_pinned && (
          <Pin className="absolute top-3 right-3 size-4 text-muted-foreground" />
        )}
        {note.title && (
          <h3 className="font-semibold text-foreground truncate pr-6">
            {note.title}
          </h3>
        )}
      </CardHeader>
      <CardContent className="flex-grow py-0">
        <div className="prose prose-sm dark:prose-invert text-muted-foreground line-clamp-5">
          <ReactMarkdown>{note.content || ""}</ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-4 mt-auto">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground/80">
          <span>
            {formatDistanceToNow(new Date(note.updated_at || ""), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onTogglePin}
            >
              {note.is_pinned ? (
                <PinOff className="size-3.5" />
              ) : (
                <Pin className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  </motion.div>
);

export default function NotesManager() {
  const confirm = useConfirm();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: notes = [], isLoading } = useGetNotesQuery();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const uniqueTags = useMemo(() => {
    const allTags = new Set<string>();
    notes.forEach((note) => note.tags?.forEach((tag) => allTags.add(tag)));
    return Array.from(allTags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (!selectedTag) return true;
        return note.tags?.includes(selectedTag);
      })
      .filter((note) => {
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          note.title?.toLowerCase().includes(lowercasedTerm) ||
          note.content?.toLowerCase().includes(lowercasedTerm) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(lowercasedTerm))
        );
      });
  }, [notes, searchTerm, selectedTag]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsSheetOpen(true);
  };
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsSheetOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await confirm({
      title: "Delete Note?",
      description: "This action cannot be undone.",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteNote(noteId).unwrap();
      toast.success("Note deleted.");
    } catch (err: any) {
      toast.error("Failed to delete note", { description: err.message });
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

  if (isLoading && !notes.length)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <StickyNote className="size-6 text-primary" /> Personal Notes
          </h2>
          <p className="text-muted-foreground">
            A space for your thoughts, ideas, and reminders.
          </p>
        </div>
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 size-4" /> New Note
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar for Tags (Desktop) */}
        <aside className="w-56 hidden md:block sticky top-20 shrink-0">
          <div className="font-semibold text-sm mb-3 px-2">Tags</div>
          <div className="flex flex-col gap-1">
            <Button
              variant={!selectedTag ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => setSelectedTag(null)}
            >
              All Notes
            </Button>
            {uniqueTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setSelectedTag(tag)}
              >
                <Tag className="mr-2 size-3.5 opacity-60" />
                <span className="truncate">{tag}</span>
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="relative mb-4">
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <X
                className="absolute right-2.5 top-2.5 size-4 text-muted-foreground cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          {/* RESPONSIVE FIX: Mobile Tag Filter (Horizontal Scroll) */}
          <div className="md:hidden mb-6">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={!selectedTag ? "default" : "outline"}
                  onClick={() => setSelectedTag(null)}
                  className="rounded-full h-8"
                >
                  All
                </Button>
                {uniqueTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() =>
                      setSelectedTag(tag === selectedTag ? null : tag)
                    }
                    className="rounded-full h-8"
                  >
                    # {tag}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              <StickyNote className="mx-auto size-12 opacity-30" />
              <h3 className="mt-4 text-lg font-semibold">No Notes Found</h3>
              <p className="mt-1 text-sm">
                {searchTerm
                  ? "Try a different search."
                  : selectedTag
                    ? `No notes with the tag "${selectedTag}".`
                    : "Create your first note!"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col">
          <NoteEditor
            note={editingNote}
            onSuccess={() => setIsSheetOpen(false)}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
