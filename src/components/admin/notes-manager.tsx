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
  LayoutGrid,
  List,
  MoreHorizontal,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <Card
      className={cn(
        "flex flex-col h-full hover:border-primary/50 transition-colors",
        note.is_pinned && "bg-secondary border-primary/20",
      )}
    >
      <CardHeader>
        {note.title && (
          <CardTitle className="truncate text-base font-bold">
            {note.title}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4 text-sm text-muted-foreground">
          {note.content || <span className="italic">No content.</span>}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 border-t pt-4">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        <div className="flex w-full items-center justify-between gap-2 pt-2">
          <div className="text-xs text-muted-foreground">
            {format(new Date(note.updated_at || ""), "MMM dd, yyyy")}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onTogglePin}>
                {note.is_pinned ? (
                  <PinOff className="mr-2 size-4" />
                ) : (
                  <Pin className="mr-2 size-4" />
                )}
                {note.is_pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  </motion.div>
);

export default function NotesManager() {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: notes = [], isLoading, error } = useGetNotesQuery();
  const [addNote, { isLoading: isAdding }] = useAddNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const isMutating = isAdding || isUpdating;

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsSheetOpen(true);
  };
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsSheetOpen(true);
  };
  const handleCloseSheet = () => setIsSheetOpen(false);

  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    const lowercasedTerm = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowercasedTerm) ||
        note.content?.toLowerCase().includes(lowercasedTerm) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(lowercasedTerm)),
    );
  }, [notes, searchTerm]);

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
      if (editingNote?.id) {
        await updateNote({ ...noteData, id: editingNote.id }).unwrap();
        toast.success("Note updated successfully.");
      } else {
        await addNote(noteData).unwrap();
        toast.success("Note created successfully.");
      }
      handleCloseSheet();
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
          <h2 className="text-2xl font-bold">Personal Notes</h2>
          <p className="text-muted-foreground">
            A space for your thoughts, ideas, and reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as any)}
            size="sm"
          >
            <ToggleGroupItem value="list">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={handleCreateNote} size="sm" className="h-9">
            <Plus className="mr-2 size-4" /> New Note
          </Button>
        </div>
      </div>

      {!isLoading && filteredNotes.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          <StickyNote className="mx-auto size-12 opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">No Notes Found</h3>
          <p className="mt-1 mb-4">
            {searchTerm
              ? "Try a different search term."
              : "Create your first note to get started."}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Tags</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Last Updated
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => (
                    <TableRow key={note.id} className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTogglePin(note)}
                        >
                          {note.is_pinned ? (
                            <Pin className="size-4 text-primary" />
                          ) : (
                            <Pin className="size-4 text-muted-foreground opacity-20 group-hover:opacity-100" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {note.title || (
                          <span className="text-muted-foreground italic">
                            Untitled Note
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {note.tags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {note.tags && note.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {format(
                          new Date(note.updated_at || ""),
                          "MMM dd, yyyy",
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </AnimatePresence>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCloseSheet}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
