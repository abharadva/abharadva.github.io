// src/components/admin/content-manager.tsx
"use client";

import { useState, FormEvent, DragEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioSection, PortfolioItem } from "@/types";
import {
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  ArrowLeft,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { useIsMobile } from "@/hooks/use-mobile";

type SheetState =
  | { type: "new-section" }
  | { type: "edit-section"; section: PortfolioSection }
  | { type: "new-item"; sectionId: string }
  | { type: "edit-item"; item: PortfolioItem }
  | null;

// --- Sub-components for Sheets ---

const SectionEditorSheet = ({
  section,
  availablePaths,
  onSave,
  onClose,
}: {
  section: Partial<PortfolioSection> | null;
  availablePaths: { label: string; value: string }[];
  onSave: (data: Partial<PortfolioSection>) => void;
  onClose: () => void;
}) => {
  const [pagePath, setPagePath] = useState(section?.page_path || "/");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      id: section?.id,
      title: formData.get("title") as string,
      page_path: pagePath,
      type: formData.get("type") as any,
      layout_style: formData.get("layout_style") as string,
    });
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              {section?.id ? "Edit Section" : "Create New Section"}
            </SheetTitle>
            <SheetDescription>
              Configure the section's properties and placement.
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={section?.title || ""}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Page Path *</Label>
            <Combobox
              options={availablePaths}
              value={pagePath}
              onChange={setPagePath}
              placeholder="Select or create path..."
              searchPlaceholder="Search paths..."
              emptyPlaceholder="No paths."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="type">Content Type</Label>
              <Select
                name="type"
                defaultValue={section?.type || "list_items"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="list_items">List of Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="layout_style">Layout Style</Label>
              <Select
                name="layout_style"
                defaultValue={section?.layout_style || "default"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="grid-2-col">Grid - 2 Columns</SelectItem>
                  <SelectItem value="feature-alternating">
                    Featured Projects
                  </SelectItem>
                  <SelectItem value="github-grid">GitHub Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Section</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

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
      tags:
        formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean) || null,
    };
    onSave(data, sectionId);
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              {item?.id ? "Edit Item" : "Create New Item"}
            </SheetTitle>
            <SheetDescription>
              Fill in the details for this portfolio item.
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4 pb-4">
              <div className="space-y-1">
                <Label htmlFor="item_title">Title *</Label>
                <Input
                  id="item_title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_subtitle">Subtitle</Label>
                <Input
                  id="item_subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, subtitle: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="item_date_from">From</Label>
                  <Input
                    id="item_date_from"
                    value={formData.date_from}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, date_from: e.target.value }))
                    }
                    placeholder="e.g., Jan 2022"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="item_date_to">To</Label>
                  <Input
                    id="item_date_to"
                    value={formData.date_to}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, date_to: e.target.value }))
                    }
                    placeholder="e.g., Present"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_description">Description (Markdown)</Label>
                <Textarea
                  id="item_description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={5}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_link_url">Link URL</Label>
                <Input
                  id="item_link_url"
                  value={formData.link_url}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, link_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_image_url">Image URL</Label>
                <Input
                  id="item_image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, image_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item_tags">Tags (comma-separated)</Label>
                <Input
                  id="item_tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, tags: e.target.value }))
                  }
                />
              </div>
            </div>
          </ScrollArea>
          <div className="pt-4 mt-auto border-t">
            <Button type="submit" className="w-full">
              Save Item
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// --- Main ContentManager Component ---

export default function ContentManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();

  const [localSections, setLocalSections] = useState<PortfolioSection[]>([]);
  const [availablePaths, setAvailablePaths] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [sheetState, setSheetState] = useState<SheetState>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(
    null,
  );

  const { data: sections, isLoading: isLoadingSections } =
    useGetPortfolioContentQuery();
  const { data: navLinks } = useGetNavLinksAdminQuery();
  const [saveSection] = useSaveSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [saveItem] = useSavePortfolioItemMutation();
  const [deleteItem] = useDeletePortfolioItemMutation();
  const [updateOrder] = useUpdateSectionOrderMutation();
  const [rescanUsage] = useRescanAssetUsageMutation();

  useEffect(() => {
    if (sections) setLocalSections(sections);
  }, [sections]);

  useEffect(() => {
    if (navLinks) {
      const paths = new Set<string>(["/"]);
      navLinks.forEach((link) => paths.add(link.href));
      setAvailablePaths(
        Array.from(paths)
          .sort()
          .map((path) => ({ label: path, value: path })),
      );
    }
  }, [navLinks]);

  // Drag and Drop Logic
  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => {
    // Required for Firefox
    e.dataTransfer.effectAllowed = "move";
    setDraggedSectionId(sectionId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedSectionId === sectionId) return;
    setDragOverSectionId(sectionId);
  };

  const handleDragLeave = () => setDragOverSectionId(null);
  const handleDragEnd = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const handleDrop = async (targetSectionId: string) => {
    setDragOverSectionId(null); // Clear highlight immediately

    if (!draggedSectionId || draggedSectionId === targetSectionId) return;

    const reorderedSections = [...localSections];
    const draggedIndex = reorderedSections.findIndex(
      (s) => s.id === draggedSectionId,
    );
    const targetIndex = reorderedSections.findIndex(
      (s) => s.id === targetSectionId,
    );

    // Only allow reordering within same page
    if (
      reorderedSections[draggedIndex].page_path !==
      reorderedSections[targetIndex].page_path
    ) {
      toast.warning("Cannot reorder sections across different pages.");
      return;
    }

    // Remove from old index
    const [draggedItem] = reorderedSections.splice(draggedIndex, 1);
    // Insert at new index
    reorderedSections.splice(targetIndex, 0, draggedItem);

    // Update local state immediately for UI feedback
    setLocalSections(reorderedSections);

    const sectionIdsInNewOrder = reorderedSections
      .filter((s) => s.page_path === draggedItem.page_path)
      .map((s) => s.id);

    try {
      await updateOrder(sectionIdsInNewOrder).unwrap();
      toast.success("Section order saved.");
    } catch {
      toast.error("Failed to save new order.");
      // Revert on failure (optional, but good UX)
      if (sections) setLocalSections(sections);
    }
    setDraggedSectionId(null);
  };

  const handleSaveSection = async (data: Partial<PortfolioSection>) => {
    try {
      const saved = await saveSection(data).unwrap();
      toast.success(`Section "${saved.title}" saved.`);
      setSheetState(null);
      setSelectedSectionId(saved.id);
    } catch (err: any) {
      toast.error("Failed to save section", { description: err.message });
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const ok = await confirm({
        title: "Delete Section?",
        description:
          "This will permanently delete this section and all items within it.",
        variant: "destructive",
      });
      if (!ok) return;

      await deleteSection(id).unwrap();
      toast.success("Section deleted.");
      setSelectedSectionId(null);
    } catch (err: any) {
      toast.error("Failed to delete section", { description: err.message });
    }
  };

  const handleSaveItem = async (
    itemData: Partial<PortfolioItem>,
    sectionId: string,
  ) => {
    try {
      await saveItem({ ...itemData, section_id: sectionId }).unwrap();
      toast.success("Item saved.");
      await rescanUsage().unwrap();
      setSheetState(null);
    } catch (err: any) {
      toast.error("Failed to save item", { description: err.message });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const ok = await confirm({
        title: "Delete Item?",
        description: "This action cannot be undone.",
        variant: "destructive",
      });
      if (!ok) return;

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
    {} as Record<string, PortfolioSection[]>,
  );

  // --- Render Helpers ---

  const SectionList = () => (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <Button
          onClick={() => setSheetState({ type: "new-section" })}
          className="w-full h-9 shadow-sm"
        >
          <Plus className="mr-2 size-4" /> New Section
        </Button>
      </div>
      <ScrollArea className="flex-grow bg-muted/5">
        {isLoadingSections ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={Object.keys(groupedSections)}
            className="w-full p-2"
          >
            {Object.entries(groupedSections).map(([path, sectionsInGroup]) => (
              <AccordionItem
                value={path}
                key={path}
                className="border rounded-lg bg-card mb-2 shadow-sm"
              >
                <AccordionTrigger className="py-2.5 px-3 text-sm font-semibold hover:no-underline rounded-t-lg">
                  <span className="flex items-center gap-2">
                    <LayoutTemplate className="size-4 text-muted-foreground" />
                    {path === "/" ? "Home Page" : path}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-0 px-2">
                  <div className="flex flex-col gap-1 mt-1">
                    {sectionsInGroup.map((section) => (
                      <div
                        key={section.id}
                        draggable={!isMobile} // Disable drag on mobile to prevent scroll issues
                        onDragStart={(e) => handleDragStart(e, section.id)}
                        onDrop={() => handleDrop(section.id)}
                        onDragOver={(e) => handleDragOver(e, section.id)}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "rounded-md transition-all",
                          draggedSectionId === section.id && "opacity-30",
                          dragOverSectionId === section.id &&
                            "bg-primary/10 ring-2 ring-primary",
                        )}
                      >
                        <Button
                          variant={
                            selectedSectionId === section.id
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start h-9 cursor-pointer px-2"
                          onClick={() => setSelectedSectionId(section.id)}
                        >
                          {!isMobile && (
                            <GripVertical className="mr-2 size-4 text-muted-foreground/50 cursor-grab" />
                          )}
                          <span className="truncate">{section.title}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );

  const SectionDetail = () =>
    selectedSection ? (
      <div className="h-full flex flex-col bg-background">
        {/* Mobile Header with Back Button */}
        {isMobile && (
          <div className="flex items-center gap-2 p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedSectionId(null)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h2 className="font-semibold truncate">{selectedSection.title}</h2>
          </div>
        )}

        <ScrollArea className="flex-1 px-4 py-6 md:px-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Desktop Header */}
            {!isMobile && (
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {selectedSection.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="capitalize bg-secondary px-2 py-0.5 rounded text-xs">
                      {selectedSection.type.replace("_", " ")}
                    </span>
                    <span className="text-border">|</span>
                    <span className="capitalize bg-secondary px-2 py-0.5 rounded text-xs">
                      {selectedSection.layout_style}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSheetState({
                        type: "edit-section",
                        section: selectedSection,
                      })
                    }
                  >
                    <Edit className="mr-2 size-4" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleDeleteSection(selectedSection.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Actions */}
            {isMobile && (
              <div className="flex gap-2 mb-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setSheetState({
                      type: "edit-section",
                      section: selectedSection,
                    })
                  }
                >
                  <Edit className="mr-2 size-4" /> Edit Details
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteSection(selectedSection.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}

            {selectedSection.type === "markdown" && (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  defaultValue={selectedSection.content || ""}
                  rows={20}
                  className="font-mono text-sm"
                  onBlur={(e) =>
                    handleSaveSection({
                      id: selectedSection.id,
                      content: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Markdown is supported. Click outside to save automatically.
                </p>
              </div>
            )}

            {(selectedSection.type === "list_items" ||
              selectedSection.type === "gallery") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Items</h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSheetState({
                        type: "new-item",
                        sectionId: selectedSection.id,
                      })
                    }
                  >
                    <Plus className="mr-2 size-4" /> Add Item
                  </Button>
                </div>
                <div className="grid gap-3">
                  {selectedSection.portfolio_items?.map((item) => (
                    <Card
                      key={item.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:shadow-md transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.title}</p>
                          {item.link_url && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                              Linked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.subtitle || "No subtitle"}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setSheetState({ type: "edit-item", item })
                          }
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {(!selectedSection.portfolio_items ||
                    selectedSection.portfolio_items.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                      No items yet. Click "Add Item" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    ) : (
      <div className="flex h-full items-center justify-center text-center text-muted-foreground bg-muted/5">
        <div className="max-w-xs">
          <LayoutTemplate className="mx-auto size-12 opacity-20 mb-4" />
          <p>Select a section from the list to edit its content and items.</p>
        </div>
      </div>
    );

  // --- Render based on device ---

  if (isMobile) {
    return (
      <>
        <div className="h-[calc(100vh-8rem)]">
          <AnimatePresence mode="wait">
            {selectedSection ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full bg-background"
              >
                <SectionDetail />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <SectionList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit/Create Sheets */}
        {(sheetState?.type === "new-item" ||
          sheetState?.type === "edit-item") && (
          <ItemEditorSheet
            item={sheetState.type === "edit-item" ? sheetState.item : null}
            sectionId={
              sheetState.type === "new-item"
                ? sheetState.sectionId
                : sheetState.item.section_id
            }
            onSave={handleSaveItem}
            onClose={() => setSheetState(null)}
          />
        )}
        {(sheetState?.type === "new-section" ||
          sheetState?.type === "edit-section") && (
          <SectionEditorSheet
            section={
              sheetState.type === "edit-section" ? sheetState.section : null
            }
            availablePaths={availablePaths}
            onSave={handleSaveSection}
            onClose={() => setSheetState(null)}
          />
        )}
      </>
    );
  }

  // Desktop View
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-8rem)] rounded-xl border bg-card shadow-sm overflow-hidden"
      >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <SectionList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <SectionDetail />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Edit/Create Sheets */}
      {(sheetState?.type === "new-item" ||
        sheetState?.type === "edit-item") && (
        <ItemEditorSheet
          item={sheetState.type === "edit-item" ? sheetState.item : null}
          sectionId={
            sheetState.type === "new-item"
              ? sheetState.sectionId
              : sheetState.item.section_id
          }
          onSave={handleSaveItem}
          onClose={() => setSheetState(null)}
        />
      )}
      {(sheetState?.type === "new-section" ||
        sheetState?.type === "edit-section") && (
        <SectionEditorSheet
          section={
            sheetState.type === "edit-section" ? sheetState.section : null
          }
          availablePaths={availablePaths}
          onSave={handleSaveSection}
          onClose={() => setSheetState(null)}
        />
      )}
    </>
  );
}
