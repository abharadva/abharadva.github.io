// src/components/admin/content-manager.tsx
"use client";

import { useState, FormEvent, DragEvent, useEffect } from "react";
import { motion } from "framer-motion";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Combobox } from "../ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import {
  useGetPortfolioContentQuery,
  useGetNavLinksAdminQuery,
  useSaveSectionMutation,
  useDeleteSectionMutation,
  useSavePortfolioItemMutation,
  useDeletePortfolioItemMutation,
  useUpdateSectionOrderMutation,
  useRescanAssetUsageMutation,
} from "@/store/api/adminApi";

type DialogState =
  | { type: "new-section" }
  | { type: "edit-section"; section: PortfolioSection }
  | { type: "new-item"; sectionId: string }
  | { type: "edit-item"; item: PortfolioItem }
  | null;

const ItemEditorSheet = ({
  item,
  sectionId,
  onSave,
  onClose,
}: {
  item: Partial<PortfolioItem> | null;
  sectionId: string;
  onSave: (data: Partial<PortfolioItem>, sectionId: string) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    subtitle: item?.subtitle || "",
    date_from: item?.date_from || "",
    date_to: item?.date_to || "",
    description: item?.description || "",
    link_url: item?.link_url || "",
    image_url: item?.image_url || "",
    tags: item?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: Partial<PortfolioItem> = {
      id: item?.id,
      title: formData.title,
      subtitle: formData.subtitle || null,
      date_from: formData.date_from || null,
      date_to: formData.date_to || null,
      description: formData.description || null,
      link_url: formData.link_url || null,
      image_url: formData.image_url || null,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean) || null,
    };
    onSave(data, sectionId);
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{item?.id ? "Edit Item" : "Create New Item"}</SheetTitle>
          <SheetDescription>
            Fill in the details for this portfolio item.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6">
          <ScrollArea className="h-[calc(100vh-8rem)] pr-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="item_title">Title *</Label>
                <Input id="item_title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_subtitle">Subtitle</Label>
                <Input id="item_subtitle" value={formData.subtitle} onChange={e => setFormData(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="item_date_from">From</Label>
                  <Input id="item_date_from" value={formData.date_from} onChange={e => setFormData(f => ({ ...f, date_from: e.target.value }))} placeholder="e.g., Jan 2022" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="item_date_to">To</Label>
                  <Input id="item_date_to" value={formData.date_to} onChange={e => setFormData(f => ({ ...f, date_to: e.target.value }))} placeholder="e.g., Present" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_description">Description (Markdown)</Label>
                <Textarea id="item_description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={5} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_link_url">Link URL</Label>
                <Input id="item_link_url" value={formData.link_url} onChange={e => setFormData(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_image_url">Image URL</Label>
                <Input id="item_image_url" value={formData.image_url} onChange={e => setFormData(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_tags">Tags (comma-separated)</Label>
                <Input id="item_tags" value={formData.tags} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
          </ScrollArea>
          <div className="absolute bottom-0 right-0 p-6 w-full bg-background border-t">
            <Button type="submit" className="w-full">Save Item</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default function ContentManager() {
  const [localSections, setLocalSections] = useState<PortfolioSection[]>([]);
  const [availablePaths, setAvailablePaths] = useState<{ label: string; value: string }[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const { data: sections, isLoading: isLoadingSections } = useGetPortfolioContentQuery();
  const { data: navLinks } = useGetNavLinksAdminQuery();
  const [saveSection, { isLoading: isSavingSection }] = useSaveSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [saveItem] = useSavePortfolioItemMutation();
  const [deleteItem] = useDeletePortfolioItemMutation();
  const [updateOrder] = useUpdateSectionOrderMutation();
  const [rescanUsage] = useRescanAssetUsageMutation();

  useEffect(() => { if (sections) setLocalSections(sections); }, [sections]);
  useEffect(() => {
    if (navLinks) {
      const paths = new Set<string>(["/"]);
      navLinks.forEach((link) => paths.add(link.href));
      setAvailablePaths(Array.from(paths).sort().map((path) => ({ label: path, value: path })));
    }
  }, [navLinks]);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => setDraggedSectionId(sectionId);
  const handleDragOver = (e: DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(sectionId);
  };
  const handleDragLeave = () => setDragOverSectionId(null);
  const handleDragEnd = () => { setDraggedSectionId(null); setDragOverSectionId(null); };
  const handleDrop = async (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;
    const reorderedSections = [...localSections];
    const draggedIndex = reorderedSections.findIndex((s) => s.id === draggedSectionId);
    const targetIndex = reorderedSections.findIndex((s) => s.id === targetSectionId);
    if (reorderedSections[draggedIndex].page_path !== reorderedSections[targetIndex].page_path) {
      toast.warning("Cannot reorder sections across different pages.");
      return;
    }
    const [draggedItem] = reorderedSections.splice(draggedIndex, 1);
    reorderedSections.splice(targetIndex, 0, draggedItem);
    setLocalSections(reorderedSections);

    const sectionIdsInNewOrder = reorderedSections.filter((s) => s.page_path === draggedItem.page_path).map((s) => s.id);
    try {
      await updateOrder(sectionIdsInNewOrder).unwrap();
      toast.success("Section order saved.");
    } catch {
      toast.error("Failed to save new order.");
      setLocalSections(sections || []); // Revert on failure
    }
  };

  const handleSaveSection = async (data: Partial<PortfolioSection>) => {
    try {
      const saved = await saveSection(data).unwrap();
      toast.success(`Section "${saved.title}" saved.`);
      setDialogState(null);
      setSelectedSectionId(saved.id);
    } catch (err: any) {
      toast.error("Failed to save section", { description: err.message });
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and ALL its items? This is irreversible.")) return;
    try {
      await deleteSection(id).unwrap();
      toast.success("Section deleted.");
      setSelectedSectionId(null);
    } catch (err: any) {
      toast.error("Failed to delete section", { description: err.message });
    }
  };

  const handleSaveItem = async (itemData: Partial<PortfolioItem>, sectionId: string) => {
    try {
      await saveItem({ ...itemData, section_id: sectionId }).unwrap();
      toast.success("Item saved.");
      await rescanUsage().unwrap();
    } catch (err: any) {
      toast.error("Failed to save item", { description: err.message });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item? This is irreversible.")) return;
    try {
      await deleteItem(itemId).unwrap();
      toast.success("Item deleted.");
      await rescanUsage().unwrap();
    } catch (err: any) {
      toast.error("Failed to delete item", { description: err.message });
    }
  };

  const selectedSection = localSections.find((s) => s.id === selectedSectionId);

  const groupedSections = localSections.reduce(
    (acc, section) => {
      const path = section.page_path || "Uncategorized";
      if (!acc[path]) acc[path] = [];
      acc[path].push(section);
      return acc;
    },
    {} as Record<string, PortfolioSection[]>
  );

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-8rem)] rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="flex h-full flex-col">
            <div className="p-2 border-b">
              <Button onClick={() => setDialogState({ type: "new-section" })} className="w-full h-9">
                <Plus className="mr-2 size-4" /> New Section
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              {isLoadingSections ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <Accordion type="multiple" defaultValue={Object.keys(groupedSections)} className="w-full p-2">
                  {Object.entries(groupedSections).map(([path, sectionsInGroup]) => (
                    <AccordionItem value={path} key={path}>
                      <AccordionTrigger className="py-2 px-2 text-xs font-mono uppercase text-muted-foreground hover:no-underline">
                        {path === "/" ? "Home Page" : path}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2 pl-2">
                        {sectionsInGroup.map((section) => (
                          <div
                            key={section.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, section.id)}
                            onDrop={() => handleDrop(section.id)}
                            onDragOver={(e) => handleDragOver(e, section.id)}
                            onDragLeave={handleDragLeave}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "mb-1 rounded-md transition-all",
                              draggedSectionId === section.id && "opacity-30",
                              dragOverSectionId === section.id && "bg-primary/10 ring-2 ring-primary"
                            )}
                          >
                            <Button
                              variant={selectedSectionId === section.id ? "secondary" : "ghost"}
                              className="w-full justify-start h-9 cursor-pointer"
                              onClick={() => setSelectedSectionId(section.id)}
                            >
                              <GripVertical className="mr-2 size-4 text-muted-foreground cursor-grab" />
                              <span className="truncate">{section.title}</span>
                            </Button>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <ScrollArea className="h-full px-4 py-6">
            {selectedSection ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSection.title}</h2>
                    <p className="text-sm text-muted-foreground">Type: {selectedSection.type} | Layout: {selectedSection.layout_style}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDialogState({type: 'edit-section', section: selectedSection})}>
                     <Edit className="mr-2 size-4" /> Edit Details
                  </Button>
                </div>
                
                {selectedSection.type === 'markdown' && (
                  <Textarea defaultValue={selectedSection.content || ""} rows={20} onBlur={(e) => handleSaveSection({ id: selectedSection.id, content: e.target.value })} />
                )}

                {selectedSection.type === 'list_items' && (
                  <div className="space-y-3">
                     <Button variant="outline" onClick={() => setDialogState({ type: "new-item", sectionId: selectedSection.id })}>
                       <Plus className="mr-2 size-4" /> Add Item
                     </Button>
                     {selectedSection.portfolio_items?.map(item => (
                       <Card key={item.id} className="group flex justify-between items-center p-3 pr-1">
                          <div>
                             <p className="font-medium">{item.title}</p>
                             <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          </div>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDialogState({ type: 'edit-item', item })}><Edit className="size-4" /></Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteItem(item.id)}><Trash2 className="size-4" /></Button>
                          </div>
                       </Card>
                     ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <p>Select a section to edit, or create a new one.</p>
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      {(dialogState?.type === "new-item" || dialogState?.type === "edit-item") && (
        <ItemEditorSheet
          item={dialogState.type === 'edit-item' ? dialogState.item : null}
          sectionId={dialogState.type === 'new-item' ? dialogState.sectionId : dialogState.item.section_id}
          onSave={handleSaveItem}
          onClose={() => setDialogState(null)}
        />
      )}

      <Dialog open={dialogState?.type === 'new-section' || dialogState?.type === 'edit-section'} onOpenChange={(open) => !open && setDialogState(null)}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{dialogState?.type === 'edit-section' ? "Edit Section Details" : "Create New Section"}</DialogTitle>
           </DialogHeader>
           <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const isNew = dialogState?.type === 'new-section';
                const section = dialogState?.type === 'edit-section' ? dialogState.section : {};

                handleSaveSection({
                  id: isNew ? undefined : (section as PortfolioSection).id,
                  title: formData.get("title") as string,
                  page_path: (document.querySelector('input[name="page_path"]') as HTMLInputElement)?.value,
                  type: formData.get("type") as any,
                  layout_style: formData.get("layout_style") as string,
                });
              }}
              className="space-y-4 pt-4"
            >
              <div className="space-y-1">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" defaultValue={dialogState?.type === 'edit-section' ? dialogState.section.title : ''} required />
              </div>
              <div className="space-y-1">
                <Label>Page Path *</Label>
                <Combobox
                  options={availablePaths}
                  value={dialogState?.type === 'edit-section' ? dialogState.section.page_path : '/'}
                  onChange={(value) => {
                    const input = document.querySelector('input[name="page_path"]') as HTMLInputElement;
                    if (input) input.value = value;
                  }}
                  placeholder="Select or create path..." searchPlaceholder="Search paths..." emptyPlaceholder="No paths."
                />
                <input type="hidden" name="page_path" defaultValue={dialogState?.type === 'edit-section' ? dialogState.section.page_path : '/'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="type">Content Type</Label>
                    <Select name="type" defaultValue={dialogState?.type === 'edit-section' ? dialogState.section.type : "list_items"} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="list_items">List of Items</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="layout_style">Layout Style</Label>
                    <Select name="layout_style" defaultValue={dialogState?.type === 'edit-section' ? dialogState.section.layout_style : 'default'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                        <SelectItem value="grid-2-col">Grid - 2 Columns</SelectItem>
                        <SelectItem value="feature-alternating">Featured Projects</SelectItem>
                        <SelectItem value="github-grid">GitHub Grid</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <DialogFooter className="pt-4">
                {dialogState?.type === 'edit-section' && (
                  <Button type="button" variant="destructive" className="mr-auto" onClick={() => handleDeleteSection(dialogState.section.id)}>Delete Section</Button>
                )}
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSavingSection}>
                  {isSavingSection && <Loader2 className="mr-2 size-4 animate-spin"/>}
                  Save
                </Button>
              </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </>
  );
}