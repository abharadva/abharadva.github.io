
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import NoteEditor from "@/components/admin/note-editor";
import { supabase } from "@/supabase/client";
import { Pin, PinOff, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load notes: " + fetchError.message);
      setNotes([]);
    } else {
      setNotes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = () => { setIsCreating(true); setEditingNote(null); };
  const handleEditNote = (note: Note) => { setEditingNote(note); setIsCreating(false); };

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true);
    const { error: deleteError } = await supabase.from("notes").delete().eq("id", noteId);
    if (deleteError) { setError("Failed to delete note: " + deleteError.message); }
    else { await loadNotes(); }
    setIsLoading(false);
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, ...dataToSave } = noteData;

    const response = isCreating || !editingNote?.id
      ? await supabase.from("notes").insert(dataToSave).select().single()
      : await supabase.from("notes").update(dataToSave).eq("id", editingNote.id).select().single();

    if (response.error) {
      setError("Failed to save note: " + response.error.message);
      setIsLoading(false);
      return;
    }
    setIsCreating(false);
    setEditingNote(null);
    await loadNotes();
  };

  const handleTogglePin = async (note: Note) => {
    setIsLoading(true);
    const { error: pinError } = await supabase.from("notes").update({ is_pinned: !note.is_pinned }).eq("id", note.id);
    if (pinError) { setError("Failed to update pin status: " + pinError.message); }
    else { await loadNotes(); }
    setIsLoading(false);
  };

  const handleCancel = () => { setIsCreating(false); setEditingNote(null); setError(null); };
  
  if (isCreating || editingNote) {
    return <NoteEditor note={editingNote} onSave={handleSaveNote} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase">Personal Notes</h2>
          <p className="text-muted-foreground">A space for your thoughts and reminders.</p>
        </div>
        <Button onClick={handleCreateNote}><Plus className="mr-2 size-4" />Create New Note</Button>
      </div>

      {isLoading && <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /><span className="ml-2">Loading notes...</span></div>}
      {error && <div className="rounded-none border-2 border-destructive bg-destructive/10 p-4 font-bold text-destructive">{error}</div>}

      {!isLoading && notes.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-foreground py-12 text-center">
          <h3 className="text-lg font-bold">No notes yet.</h3>
          <p className="text-muted-foreground">Click "Create New Note" to start.</p>
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
                <Card className={`flex flex-col h-full ${note.is_pinned ? "border-accent bg-accent/5" : "bg-card"}`}>
                  <CardHeader>
                    {note.title && <CardTitle className="truncate">{note.title}</CardTitle>}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="line-clamp-4 text-sm text-muted-foreground">{note.content || <span className="italic">No content.</span>}</p>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-3 p-3">
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    )}
                    <div className="flex w-full items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                          Updated: {new Date(note.updated_at || "").toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleTogglePin(note)} title={note.is_pinned ? "Unpin" : "Pin"}>{note.is_pinned ? <PinOff className="size-4 text-accent"/> : <Pin className="size-4"/>}</Button>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEditNote(note)} title="Edit"><Edit className="size-4"/></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="size-4"/></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Note?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{note.title || 'this note'}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteNote(note.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
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