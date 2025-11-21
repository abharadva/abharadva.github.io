// src/components/admin/content-manager.tsx
"use client";

import { useState, FormEvent, DragEvent, useEffect } from "react";
import { motion } from "framer-motion";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical, Plus, Edit, Trash2, Loader2 } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Combobox } from "../ui/combobox";
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

const SectionEditor = ({
  section,
  availablePaths,
  onSaveSection,
  onDeleteSection,
  onSaveItem,
  onDeleteItem,
}: {
  section: PortfolioSection;
  availablePaths: { label: string; value: string }[];
  onSaveSection: (data: Partial<PortfolioSection>) => void;
  onDeleteSection: (id: string) => void;
  onSaveItem: (data: Partial<PortfolioItem>, sectionId: string) => void;
  onDeleteItem: (id: string) => void;
}) => {
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isVisible, setIsVisible] = useState(section.is_visible);

  const handleVisibilityChange = (checked: boolean) => {
    setIsVisible(checked);
    onSaveSection({ id: section.id, is_visible: checked });
  };

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-1"
    >
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>{section.title}</CardTitle>
            <CardDescription>
              Path: {section.page_path} | Style: {section.layout_style}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`visible-${section.id}`}
                checked={isVisible}
                onCheckedChange={handleVisibilityChange}
              />
              <Label htmlFor={`visible-${section.id}`}>Visible</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingSection(!isEditingSection)}
            >
              <Edit className="mr-2 size-4" />{" "}
              {isEditingSection ? "Cancel" : "Edit Section"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingSection && (
            <div className="mb-6 rounded-md border bg-secondary/20 p-4">
              <h4 className="mb-3 text-lg font-semibold">
                Editing Section Details
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  onSaveSection({
                    id: section.id,
                    title: formData.get("title") as string,
                    layout_style: formData.get("layout_style") as string,
                  });
                  setIsEditingSection(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Section Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={section.title}
                      required
                    />
                  </div>
                  <div>
                    <Label>Page Path</Label>
                    <Combobox
                      options={availablePaths}
                      value={section.page_path || ""}
                      onChange={(value) =>
                        onSaveSection({ id: section.id, page_path: value })
                      }
                      placeholder="Select or type a path..."
                      searchPlaceholder="Search paths..."
                      emptyPlaceholder="No paths found. Type to create."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="layout_style">Layout Style</Label>
                  <Select
                    name="layout_style"
                    defaultValue={section.layout_style}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        Default (Markdown)
                      </SelectItem>
                      <SelectItem value="timeline">
                        Timeline (for Experience)
                      </SelectItem>
                      <SelectItem value="grid-2-col">
                        Grid - 2 Columns (for Skills/Tools)
                      </SelectItem>
                      <SelectItem value="feature-alternating">
                        Featured Projects (Alternating)
                      </SelectItem>
                      <SelectItem value="github-grid">
                        GitHub Projects Grid
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Determines how the content is visually rendered on the page.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsEditingSection(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => onDeleteSection(section.id)}
                  >
                    Delete Section
                  </Button>
                </div>
              </form>
            </div>
          )}

          {section.type === "markdown" && (
            <div>
              <Label>Markdown Content</Label>
              <Textarea
                defaultValue={section.content || ""}
                rows={8}
                onBlur={(e) =>
                  onSaveSection({ id: section.id, content: e.target.value })
                }
                placeholder="Enter your markdown content here..."
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Content saves automatically when you click away.
              </p>
            </div>
          )}

          {section.type === "list_items" && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Items in this Section
              </h4>
              {section.portfolio_items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border p-3 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        setEditingItem(item);
                        setIsCreatingItem(false);
                      }}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreatingItem(true);
                  setEditingItem(null);
                }}
              >
                <Plus className="mr-2 size-4" /> Add New Item
              </Button>
            </div>
          )}

          {(isCreatingItem || editingItem) && (
            <div className="mt-6 rounded-md border bg-secondary/20 p-4">
              <h4 className="mb-3 text-lg font-semibold">
                {editingItem
                  ? `Editing: ${editingItem.title}`
                  : "Create New Item"}
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: Partial<PortfolioItem> = {
                    id: editingItem?.id,
                    title: formData.get("item_title") as string,
                    subtitle: (formData.get("item_subtitle") as string) || null,
                    date_from:
                      (formData.get("item_date_from") as string) || null,
                    date_to: (formData.get("item_date_to") as string) || null,
                    description:
                      (formData.get("item_description") as string) || null,
                    link_url: (formData.get("item_link_url") as string) || null,
                    image_url:
                      (formData.get("item_image_url") as string) || null,
                    tags:
                      (formData.get("item_tags") as string)
                        ?.split(",")
                        .map((t) => t.trim())
                        .filter(Boolean) || null,
                  };
                  onSaveItem(data, section.id);
                  setEditingItem(null);
                  setIsCreatingItem(false);
                }}
                className="space-y-3"
              >
                <Input
                  name="item_title"
                  placeholder="Title"
                  defaultValue={editingItem?.title || ""}
                  required
                />
                <Input
                  name="item_subtitle"
                  placeholder="Subtitle"
                  defaultValue={editingItem?.subtitle || ""}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="item_date_from"
                    placeholder="From (e.g., Jan 2022)"
                    defaultValue={editingItem?.date_from || ""}
                  />
                  <Input
                    name="item_date_to"
                    placeholder="To (e.g., Present)"
                    defaultValue={editingItem?.date_to || ""}
                  />
                </div>
                <Textarea
                  name="item_description"
                  placeholder="Description (Markdown supported)"
                  defaultValue={editingItem?.description || ""}
                  rows={3}
                />
                <Input
                  name="item_link_url"
                  placeholder="Link URL (e.g., https://...)"
                  defaultValue={editingItem?.link_url || ""}
                />
                <Input
                  name="item_image_url"
                  placeholder="Image URL (e.g., https://...)"
                  defaultValue={editingItem?.image_url || ""}
                />
                <Input
                  name="item_tags"
                  placeholder="Tags (comma,separated)"
                  defaultValue={editingItem?.tags?.join(", ") || ""}
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit">Save Item</Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                      setIsCreatingItem(false);
                    }}
                  >
                    Cancel
                  </Button>
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
  const [localSections, setLocalSections] = useState<PortfolioSection[]>([]);
  const [availablePaths, setAvailablePaths] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

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

  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => {
    setDraggedSectionId(sectionId);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDragEnd = () => setDraggedSectionId(null);

  const handleDrop = async (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;
    const reorderedSections = [...localSections];
    const draggedIndex = reorderedSections.findIndex(
      (s) => s.id === draggedSectionId,
    );
    const targetIndex = reorderedSections.findIndex(
      (s) => s.id === targetSectionId,
    );
    if (
      reorderedSections[draggedIndex].page_path !==
      reorderedSections[targetIndex].page_path
    ) {
      toast.warning("Cannot reorder sections across different pages.");
      return;
    }
    const [draggedItem] = reorderedSections.splice(draggedIndex, 1);
    reorderedSections.splice(targetIndex, 0, draggedItem);
    setLocalSections(reorderedSections);

    const sectionIdsInNewOrder = reorderedSections
      .filter((s) => s.page_path === draggedItem.page_path)
      .map((s) => s.id);
    try {
      await updateOrder(sectionIdsInNewOrder).unwrap();
    } catch {
      toast.error("Failed to save new order.");
    }
  };

  const handleSaveSection = async (data: Partial<PortfolioSection>) => {
    try {
      const saved = await saveSection(data).unwrap();
      toast.success(`Section "${saved.title}" saved.`);
      setIsCreating(false);
      setSelectedSectionId(saved.id);
    } catch (err: any) {
      toast.error("Failed to save section", { description: err.message });
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (
      !confirm("Delete this section and ALL its items? This is irreversible.")
    )
      return;
    try {
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
    {} as Record<string, PortfolioSection[]>,
  );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[calc(100vh-10rem)] rounded-lg border"
    >
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <div className="flex h-full flex-col p-2">
          <Button
            onClick={() => {
              setIsCreating(true);
              setSelectedSectionId(null);
            }}
            className="mb-2"
          >
            <Plus className="mr-2 size-4" /> New Section
          </Button>
          <ScrollArea className="flex-grow">
            {isLoadingSections ? (
              <Loader2 className="mx-auto my-10 animate-spin" />
            ) : (
              Object.entries(groupedSections).map(([path, sectionsInGroup]) => (
                <div key={path} className="mb-4">
                  <h3 className="px-2 py-1 font-mono text-xs font-semibold uppercase text-muted-foreground">
                    {path === "/" ? "Home Page" : path}
                  </h3>
                  {sectionsInGroup.map((section) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, section.id)}
                      onDrop={() => handleDrop(section.id)}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "mb-1",
                        draggedSectionId === section.id && "opacity-50",
                      )}
                    >
                      <Button
                        variant={
                          selectedSectionId === section.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start h-9"
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setIsCreating(false);
                        }}
                      >
                        <GripVertical className="mr-2 size-4 text-muted-foreground cursor-grab" />
                        <span className="truncate">{section.title}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ScrollArea className="h-full px-4 py-2">
          {isCreating && (
            <Card className="m-1">
              <CardHeader>
                <CardTitle>Create a New Section</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveSection({
                      title: formData.get("title") as string,
                      type: formData.get("type") as any,
                      page_path: (
                        document.querySelector(
                          'input[name="page_path"]',
                        ) as HTMLInputElement
                      )?.value,
                      layout_style: formData.get("layout_style") as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="new-title">Section Title *</Label>
                    <Input id="new-title" name="title" required />
                  </div>
                  <div>
                    <Label>Page Path *</Label>
                    <Combobox
                      options={availablePaths}
                      value="/" // Default to homepage
                      onChange={(value) => {
                        const input = document.querySelector(
                          'input[name="page_path"]',
                        ) as HTMLInputElement;
                        if (input) input.value = value;
                      }}
                      placeholder="Select or type a path..."
                      searchPlaceholder="Search paths..."
                      emptyPlaceholder="No paths found. Type to create."
                    />
                    <input type="hidden" name="page_path" defaultValue="/" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-type">Content Type</Label>
                      <Select name="type" defaultValue="list_items" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="list_items">
                            List of Items
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="new-layout_style">Layout Style</Label>
                      <Select name="layout_style" defaultValue="default">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">
                            Default (Markdown)
                          </SelectItem>
                          <SelectItem value="timeline">
                            Timeline (for Experience)
                          </SelectItem>
                          <SelectItem value="grid-2-col">
                            Grid - 2 Columns (for Skills/Tools)
                          </SelectItem>
                          <SelectItem value="feature-alternating">
                            Featured Projects (Alternating)
                          </SelectItem>
                          <SelectItem value="github-grid">
                            GitHub Projects Grid
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Section</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {selectedSection && (
            <SectionEditor
              section={selectedSection}
              availablePaths={availablePaths}
              onSaveSection={handleSaveSection}
              onDeleteSection={handleDeleteSection}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {!isCreating && !selectedSection && !isLoadingSections && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Select a section to edit</p>
                <p className="text-sm">or</p>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedSectionId(null);
                  }}
                >
                  create a new one.
                </Button>
              </div>
            </div>
          )}
          {isLoadingSections && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
