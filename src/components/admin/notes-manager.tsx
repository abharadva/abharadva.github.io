"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import NoteEditor from "@/components/admin/note-editor";
import { supabase } from "@/supabase/client";
import { Pin, PinOff, Edit, Trash2 } from "lucide-react";

const buttonPrimaryClass =
  "bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-none font-bold border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 ";

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

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    if (deleteError) {
      setError("Failed to delete note: " + deleteError.message);
    } else {
      await loadNotes();
    }
    setIsLoading(false);
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, ...dataToSave } = noteData;

    let response;
    if (isCreating || !editingNote?.id) {
      response = await supabase.from("notes").insert(dataToSave).select().single();
    } else {
      response = await supabase
        .from("notes")
        .update(dataToSave)
        .eq("id", editingNote.id)
        .select()
        .single();
    }

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
    const { error: pinError } = await supabase
      .from("notes")
      .update({ is_pinned: !note.is_pinned })
      .eq("id", note.id);
    if (pinError) {
      setError("Failed to update pin status: " + pinError.message);
    } else {
      await loadNotes();
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
    setError(null);
  };
  
  if (isCreating || editingNote) {
    return <NoteEditor note={editingNote} onSave={handleSaveNote} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Personal Notes</h2>
          <p className="text-gray-700">A space for your thoughts and reminders.</p>
        </div>
        <button onClick={handleCreateNote} className={buttonPrimaryClass}>+ Create New Note</button>
      </div>

      {isLoading && <p className="font-semibold text-black">Loading notes...</p>}
      {error && <div className="rounded-none border-2 border-red-500 bg-red-100 p-4 font-semibold text-red-700">{error}</div>}

      {!isLoading && notes.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-black bg-white py-12 text-center">
          <h3 className="text-lg font-bold text-black">No notes yet.</h3>
          <p className="text-gray-600">Click "Create New Note" to start.</p>
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
                className={`flex flex-col rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_#000] ${note.is_pinned ? "bg-yellow-100" : "bg-white"}`}
              >
                <div className="flex-grow p-4">
                  {note.title && <h3 className="mb-2 text-lg font-bold text-black truncate">{note.title}</h3>}
                  <p className="line-clamp-4 text-sm text-gray-700">{note.content || <span className="italic">No content.</span>}</p>
                </div>
                <div className="border-t-2 border-black p-3">
                  {note.tags && note.tags.length > 0 && (
                     <div className="mb-3 flex flex-wrap gap-1">
                        {note.tags.map(tag => <span key={tag} className="inline-block rounded-none border border-black bg-gray-200 px-2 py-0.5 text-xs font-semibold text-black">{tag}</span>)}
                     </div>
                  )}
                   <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">
                        Updated: {new Date(note.updated_at || "").toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleTogglePin(note)} className="p-1.5 text-gray-600 hover:text-black hover:bg-yellow-200 border-2 border-transparent hover:border-black rounded-none" title={note.is_pinned ? "Unpin" : "Pin"}>{note.is_pinned ? <PinOff className="size-4"/> : <Pin className="size-4"/>}</button>
                        <button onClick={() => handleEditNote(note)} className="p-1.5 text-gray-600 hover:text-black hover:bg-blue-200 border-2 border-transparent hover:border-black rounded-none" title="Edit"><Edit className="size-4"/></button>
                        <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 text-gray-600 hover:text-white hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" title="Delete"><Trash2 className="size-4"/></button>
                    </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}