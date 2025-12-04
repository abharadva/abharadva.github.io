// src/components/admin/NavigationManager.tsx
"use client";

import React, { useState, useEffect, DragEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, GripVertical, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGetNavLinksAdminQuery,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
  useUpdateSectionOrderMutation,
} from "@/store/api/adminApi";
import { cn } from "@/lib/utils";

type NavLink = {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_visible: boolean;
};

const LinkForm = ({
  link,
  onSave,
  onCancel,
}: {
  link: Partial<NavLink> | null;
  onSave: (data: Partial<NavLink>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    label: link?.label || "",
    href: link?.href || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
      <div className="space-y-1">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) =>
            setFormData((f) => ({ ...f, label: e.target.value }))
          }
          required
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="href">Path (e.g., /about)</Label>
        <Input
          id="href"
          value={formData.href}
          onChange={(e) => setFormData((f) => ({ ...f, href: e.target.value }))}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Link</Button>
      </div>
    </form>
  );
};

export default function NavigationManager() {
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localLinks, setLocalLinks] = useState<NavLink[]>([]);
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);

  const { data: links = [], isLoading } = useGetNavLinksAdminQuery();
  const [saveNavLink, { isLoading: isSaving }] = useSaveNavLinkMutation();
  const [deleteNavLink] = useDeleteNavLinkMutation();
  const [updateOrder] = useUpdateSectionOrderMutation(); // Re-using this for nav links

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const handleSave = async (data: Partial<NavLink>) => {
    try {
      await saveNavLink(data).unwrap();
      toast.success("Navigation link saved.");
      setIsSheetOpen(false);
    } catch (err: any) {
      toast.error("Failed to save link", { description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteNavLink(id).unwrap();
      toast.success("Navigation link deleted.");
    } catch (err: any) {
      toast.error("Failed to delete link", { description: err.message });
    }
  };

  const handleToggleVisibility = async (link: NavLink) => {
    try {
      await saveNavLink({ id: link.id, is_visible: !link.is_visible }).unwrap();
      toast.success(
        `"${link.label}" is now ${!link.is_visible ? "visible" : "hidden"}.`,
      );
    } catch (err: any) {
      toast.error("Failed to update visibility", { description: err.message });
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, linkId: string) => {
    setDraggedLinkId(linkId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (targetLinkId: string) => {
    if (!draggedLinkId || draggedLinkId === targetLinkId) return;

    const reorderedLinks = [...localLinks];
    const draggedIndex = reorderedLinks.findIndex(
      (l) => l.id === draggedLinkId,
    );
    const targetIndex = reorderedLinks.findIndex((l) => l.id === targetLinkId);

    const [draggedItem] = reorderedLinks.splice(draggedIndex, 1);
    reorderedLinks.splice(targetIndex, 0, draggedItem);

    setLocalLinks(reorderedLinks);
    setDraggedLinkId(null);

    const linkIdsInNewOrder = reorderedLinks.map((l) => l.id);

    try {
      // We need a specific RPC for nav links, or a generic one
      // Let's assume we have a generic `update_display_order` RPC
      // If not, you'd need to create one:
      // CREATE OR REPLACE FUNCTION update_navigation_order(link_ids UUID[]) ...
      // For now, let's update them one-by-one. It's less efficient but works without DB changes.
      const updatePromises = reorderedLinks.map((link, index) =>
        saveNavLink({ id: link.id, display_order: index }),
      );
      await Promise.all(updatePromises);
      toast.success("Navigation order saved.");
    } catch {
      toast.error("Failed to save new order.");
      setLocalLinks(links); // Revert on failure
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Navigation Manager</h2>
          <p className="text-muted-foreground">
            Manage and reorder the main navigation links for your site.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLink(null);
            setIsSheetOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> Add Link
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Drag and drop to reorder links.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {localLinks.map((link) => (
                <div
                  key={link.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, link.id)}
                  onDrop={() => handleDrop(link.id)}
                  onDragOver={handleDragOver}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-2 border bg-card transition-all",
                    draggedLinkId === link.id && "opacity-50 scale-95",
                  )}
                >
                  <GripVertical className="size-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {link.href}
                    </p>
                  </div>
                  <Switch
                    checked={link.is_visible}
                    onCheckedChange={() => handleToggleVisibility(link)}
                    aria-label="Toggle visibility"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingLink(link);
                      setIsSheetOpen(true);
                    }}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>
                {editingLink ? "Edit" : "Add"} Navigation Link
              </SheetTitle>
              <SheetDescription>
                This link will appear in your site's main navigation bar.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          <LinkForm
            link={editingLink}
            onSave={handleSave}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
