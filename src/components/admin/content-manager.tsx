
"use client";

import { useState, useEffect, FormEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Reusable component to edit a selected section
const SectionEditor = ({
  section,
  onSaveSection,
  onDeleteSection,
  onSaveItem,
  onDeleteItem,
  isLoading
}: {
  section: PortfolioSection;
  onSaveSection: (data: Partial<PortfolioSection>) => void;
  onDeleteSection: (id: string) => void;
  onSaveItem: (data: Partial<PortfolioItem>, sectionId: string) => void;
  onDeleteItem: (id: string) => void;
  isLoading: boolean;
}) => {
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  return (
    <motion.div key={section.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-1">
      <Card>
        <CardHeader className="flex-row items-center justify-between border-b-2">
          <div>
            <CardTitle>{section.title}</CardTitle>
            <CardDescription>Type: {section.type} | Order: {section.display_order}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditingSection(!isEditingSection)}>
              <Edit className="mr-2 size-4" /> {isEditingSection ? 'Cancel' : 'Edit Section'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 size-4" /> Delete Section</Button></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Section?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{section.title}" and all of its content. This action is irreversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteSection(section.id)}>Confirm Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditingSection && (
            <div className="mb-6 rounded-none border-2 border-black bg-neutral-100 p-4">
              <h4 className="mb-3 text-lg font-semibold">Editing Section Details</h4>
              <form
                onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); onSaveSection({ id: section.id, title: formData.get("title") as string, type: formData.get("type") as any }); setIsEditingSection(false); }}
                className="space-y-4"
              >
                <div><Label htmlFor="title">Section Title</Label><Input id="title" name="title" defaultValue={section.title} required /></div>
                <div><Label htmlFor="type">Section Type</Label><Select name="type" defaultValue={section.type}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="markdown">Markdown</SelectItem><SelectItem value="list_items">List of Items</SelectItem></SelectContent></Select></div>
                <div className="flex gap-2"><Button type="submit">Save Changes</Button><Button variant="ghost" type="button" onClick={() => setIsEditingSection(false)}>Cancel</Button></div>
              </form>
            </div>
          )}

          {section.type === "markdown" && (
            <div>
              <Label>Markdown Content</Label>
              <Textarea defaultValue={section.content || ""} rows={8} onBlur={(e) => onSaveSection({ id: section.id, content: e.target.value })} placeholder="Enter your markdown content here..." />
              <p className="mt-2 text-xs text-neutral-500">Content saves automatically when you click away.</p>
            </div>
          )}

          {section.type === 'list_items' && (
             <div className="space-y-4">
               <h4 className="font-semibold text-black">Items in this Section</h4>
               {section.portfolio_items?.map(item => (
                 <div key={item.id} className="rounded-none border-2 border-black p-3 flex justify-between items-start bg-white">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-neutral-600">{item.subtitle}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditingItem(item); setIsCreatingItem(false); }}><Edit className="size-4"/></Button>
                      <AlertDialog>
                         <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="size-8 hover:bg-red-100 text-neutral-500 hover:text-destructive"><Trash2 className="size-4"/></Button></AlertDialogTrigger>
                         <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Item?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the item titled "{item.title}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteItem(item.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                 </div>
               ))}
               <Button variant="secondary" onClick={() => { setIsCreatingItem(true); setEditingItem(null); }}><Plus className="mr-2 size-4"/> Add New Item</Button>
             </div>
          )}

          {(isCreatingItem || editingItem) && (
            <div className="mt-6 rounded-none border-2 border-black bg-neutral-100 p-4">
                <h4 className="mb-3 text-lg font-semibold">{editingItem ? `Editing: ${editingItem.title}` : 'Create New Item'}</h4>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data: Partial<PortfolioItem> = {
                            id: editingItem?.id,
                            title: formData.get("item_title") as string,
                            subtitle: (formData.get("item_subtitle") as string) || null,
                            description: (formData.get("item_description") as string) || null,
                            tags: (formData.get("item_tags") as string)?.split(',').map(t => t.trim()).filter(Boolean) || null,
                        };
                        onSaveItem(data, section.id);
                        setEditingItem(null);
                        setIsCreatingItem(false);
                    }}
                    className="space-y-3"
                >
                    <Input name="item_title" placeholder="Title" defaultValue={editingItem?.title || ""} required />
                    <Input name="item_subtitle" placeholder="Subtitle" defaultValue={editingItem?.subtitle || ""} />
                    <Textarea name="item_description" placeholder="Description (Markdown supported)" defaultValue={editingItem?.description || ""} rows={3}/>
                    <Input name="item_tags" placeholder="Tags (comma,separated)" defaultValue={editingItem?.tags?.join(', ') || ""}/>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit">Save Item</Button>
                        <Button variant="outline" type="button" onClick={() => { setEditingItem(null); setIsCreatingItem(false); }}>Cancel</Button>
                    </div>
                </form>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ContentManager() {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const fetchPortfolioContent = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("portfolio_sections").select(`*, portfolio_items (*)`).order("display_order", { ascending: true }).order("display_order", { foreignTable: "portfolio_items", ascending: true });
    if (err) { setError("Failed to load portfolio content: " + err.message); setSections([]); } 
    else { setSections(data || []); }
    setIsLoading(false);
  };
  useEffect(() => { fetchPortfolioContent(); }, []);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => { setDraggedSectionId(sectionId); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDragEnd = () => setDraggedSectionId(null);
  
  const handleDrop = async (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;
    const reorderedSections = [...sections];
    const draggedIndex = reorderedSections.findIndex(s => s.id === draggedSectionId);
    const targetIndex = reorderedSections.findIndex(s => s.id === targetSectionId);
    const [draggedItem] = reorderedSections.splice(draggedIndex, 1);
    reorderedSections.splice(targetIndex, 0, draggedItem);
    setSections(reorderedSections); // Optimistic update
    
    const sectionIdsInNewOrder = reorderedSections.map(s => s.id);
    const { error: rpcError } = await supabase.rpc('update_section_order', { section_ids: sectionIdsInNewOrder });
    if (rpcError) { setError("Failed to save new order."); await fetchPortfolioContent(); } // Revert on error
  };

  const handleSaveSection = async (data: Partial<PortfolioSection>) => {
    setIsLoading(true);
    const response = data.id 
      ? await supabase.from("portfolio_sections").update({ title: data.title, type: data.type }).eq("id", data.id).select().single()
      : await supabase.from("portfolio_sections").insert(data).select().single();
    if (response.error) setError(response.error.message);
    else { setIsCreating(false); if (response.data) setSelectedSectionId(response.data.id); await fetchPortfolioContent(); }
    setIsLoading(false);
  };

  const handleDeleteSection = async (id: string) => {
    await supabase.from("portfolio_sections").delete().eq("id", id);
    setSelectedSectionId(null);
    await fetchPortfolioContent();
  };
  
  const handleSaveItem = async (itemData: Partial<PortfolioItem>, sectionId: string) => {
    const { id, ...dataToSave } = { ...itemData, section_id: sectionId };
    const response = id
      ? await supabase.from("portfolio_items").update(dataToSave).eq("id", id)
      : await supabase.from("portfolio_items").insert(dataToSave);
    if (response.error) setError(response.error.message);
    else await fetchPortfolioContent();
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from("portfolio_items").delete().eq("id", itemId);
    await fetchPortfolioContent();
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-16rem)] rounded-none border-2 border-black">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <div className="flex h-full flex-col p-2">
          <Button onClick={() => { setIsCreating(true); setSelectedSectionId(null); }} className="mb-2">
            <Plus className="mr-2 size-4"/> New Section
          </Button>
          <div className="flex-grow overflow-auto">
            {sections.map(section => (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDrop={() => handleDrop(section.id)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                className={cn("mb-1", draggedSectionId === section.id && "opacity-50")}
              >
                <Button
                  variant={selectedSectionId === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => { setSelectedSectionId(section.id); setIsCreating(false); }}
                >
                  <GripVertical className="mr-2 size-4 text-neutral-400 cursor-grab"/>
                  {section.title}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ScrollArea className="h-full px-4 py-2">
          {isCreating && (
            <Card className="m-1">
              <CardHeader className="border-b-2"><CardTitle>Create a New Section</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleSaveSection({ title: formData.get("title") as string, type: formData.get("type") as any }); }} className="space-y-4">
                  <div><Label htmlFor="new-title">Section Title</Label><Input id="new-title" name="title" required /></div>
                  <div><Label htmlFor="new-type">Section Type</Label><Select name="type" defaultValue="list_items" required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="markdown">Markdown</SelectItem><SelectItem value="list_items">List of Items</SelectItem></SelectContent></Select></div>
                  <div className="flex gap-2"><Button type="submit">Create Section</Button><Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button></div>
                </form>
              </CardContent>
            </Card>
          )}

          {selectedSection && (
            <SectionEditor
              section={selectedSection}
              onSaveSection={handleSaveSection}
              onDeleteSection={handleDeleteSection}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
              isLoading={isLoading}
            />
          )}

          {!isCreating && !selectedSection && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-neutral-500">
                <p>Select a section to edit</p>
                <p className="text-sm">or</p>
                <Button variant="link" className="p-0" onClick={() => { setIsCreating(true); setSelectedSectionId(null); }}>create a new one.</Button>
              </div>
            </div>
          )}
          {error && <p className="p-4 text-sm text-destructive">{error}</p>}
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}