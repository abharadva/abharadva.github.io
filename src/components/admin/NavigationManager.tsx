// src/components/admin/NavigationManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetNavLinksAdminQuery,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
} from "@/store/api/adminApi";

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
    label: "",
    href: "",
    display_order: 0,
  });

  useEffect(() => {
    setFormData({
      label: link?.label || "",
      href: link?.href || "",
      display_order: link?.display_order || 0,
    });
  }, [link]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) =>
            setFormData((f) => ({ ...f, label: e.target.value }))
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="href">Path (e.g., /about)</Label>
        <Input
          id="href"
          value={formData.href}
          onChange={(e) => setFormData((f) => ({ ...f, href: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) =>
            setFormData((f) => ({
              ...f,
              display_order: parseInt(e.target.value, 10) || 0,
            }))
          }
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Save Link</Button>
      </div>
    </form>
  );
};

export default function NavigationManager() {
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: links = [], isLoading } = useGetNavLinksAdminQuery();
  const [saveNavLink, { isLoading: isSaving }] = useSaveNavLinkMutation();
  const [deleteNavLink, { isLoading: isDeleting }] = useDeleteNavLinkMutation();
  const [updateNavLinkVisibility] = useSaveNavLinkMutation(); // Re-use for visibility toggle

  const handleSave = async (data: Partial<NavLink>) => {
    try {
      await saveNavLink(data).unwrap();
      toast.success("Navigation link saved.");
      setIsDialogOpen(false);
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
      await updateNavLinkVisibility({
        id: link.id,
        is_visible: !link.is_visible,
      }).unwrap();
      toast.success(
        `"${link.label}" is now ${!link.is_visible ? "visible" : "hidden"}.`,
      );
    } catch (err: any) {
      toast.error("Failed to update visibility", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Navigation Manager</h2>
          <p className="text-muted-foreground">
            Manage the main navigation links for your site.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLink(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> Add Link
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-secondary"
                >
                  <span className="flex-1 font-medium">
                    {link.label} ({link.href})
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Order: {link.display_order}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleVisibility(link)}
                    title={link.is_visible ? "Hide" : "Show"}
                  >
                    {link.is_visible ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingLink(link);
                      setIsDialogOpen(true);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit" : "Add"} Navigation Link
            </DialogTitle>
          </DialogHeader>
          <LinkForm
            link={editingLink}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
