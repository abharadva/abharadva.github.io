// src/components/admin/AssetManager.tsx
"use client";

import React, { useState, useRef, DragEvent } from "react";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Loader2,
  Trash2,
  Copy,
  AlertTriangle,
  Link as LinkIcon,
  Edit,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import { cn, getStorageUrl } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useGetAssetsQuery,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useRescanAssetUsageMutation,
} from "@/store/api/adminApi";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";

type StorageAsset = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_kb: number | null;
  alt_text: string | null;
  used_in: { type: string; id: string }[] | null;
  created_at: string;
};

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";

export default function AssetManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StorageAsset | null>(null);
  const [assetsToDelete, setAssetsToDelete] = useState<StorageAsset[]>([]);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: assets = [], isLoading } = useGetAssetsQuery();
  const [addAsset] = useAddAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const [rescanUsage] = useRescanAssetUsageMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) handleUpload(files);
  };

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/__+/g, "_");
      const fileName = `${Date.now()}_${sanitizedName}`;
      const filePath = `blog_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);
      if (uploadError)
        throw new Error(
          `Upload failed for ${file.name}: ${uploadError.message}`,
        );

      try {
        await addAsset({
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type,
          size_kb: file.size / 1024,
        }).unwrap();
      } catch (dbInsertError) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        throw new Error(
          `DB insert failed for ${file.name}: ${(dbInsertError as any).message}`,
        );
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} asset(s) uploaded!`);
      await handleRescanUsage(true);
    } catch (error: any) {
      toast.error("An upload failed", { description: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (assetsToDelete.length === 0) return;
    const assetsToDeleteCopy = [...assetsToDelete];
    setAssetsToDelete([]);

    const deletePromises = assetsToDeleteCopy.map((asset) =>
      deleteAsset(asset).unwrap(),
    );

    try {
      await Promise.all(deletePromises);
      toast.success(`${assetsToDeleteCopy.length} asset(s) deleted.`);
      if (isBulkSelectMode) {
        setIsBulkSelectMode(false);
        setBulkSelectedIds(new Set());
      }
    } catch (err: any) {
      toast.error("Failed to delete one or more assets", {
        description: err.message,
      });
    }
  };

  const handleBulkDelete = () => {
    const toDelete = assets.filter((asset) => bulkSelectedIds.has(asset.id));
    if (toDelete.length > 0) {
      setAssetsToDelete(toDelete);
    }
  };

  const handleUpdateAltText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const formData = new FormData(e.currentTarget);
    const alt_text = formData.get("alt_text") as string;

    try {
      const updated = await updateAsset({
        id: selectedAsset.id,
        alt_text,
      }).unwrap();
      toast.success("Alt text updated.");
      setSelectedAsset(updated);
    } catch (err: any) {
      toast.error("Failed to update alt text", { description: err.message });
    }
  };

  const handleRescanUsage = async (isSilent = false) => {
    try {
      await rescanUsage().unwrap();
      if (!isSilent) toast.success("Asset usage successfully updated.");
    } catch (err: any) {
      if (!isSilent)
        toast.error("Failed to rescan asset usage", {
          description: err.message,
        });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDragEvents = (
    e: DragEvent<HTMLDivElement>,
    isEntering: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleUpload(files);
  };

  const toggleBulkSelect = (id: string) => {
    const newSet = new Set(bulkSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setBulkSelectedIds(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Manager</h2>
          <p className="text-muted-foreground">
            Upload, view, and manage your site's images and files.
          </p>
        </div>
        <div className="flex gap-2">
          {isBulkSelectMode ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkSelectedIds.size === 0}
              >
                <Trash2 className="mr-2 size-4" /> Delete (
                {bulkSelectedIds.size})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulkSelectMode(false);
                  setBulkSelectedIds(new Set());
                }}
              >
                <X className="mr-2 size-4" /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRescanUsage()}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 size-4" /> Rescan Usage
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}{" "}
                Upload
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf"
          />
        </div>
      </div>
      <Card
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsBulkSelectMode(!isBulkSelectMode)}
              disabled={isBulkSelectMode}
            >
              <CheckSquare className="mr-2 size-4" /> Bulk Select
            </Button>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as "grid" | "list");
              }}
              size="sm"
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {isDragging && (
            <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-b-lg flex flex-col items-center justify-center">
              <Upload className="size-10 text-primary mb-2" />
              <p className="font-semibold text-primary">Drop files to upload</p>
            </div>
          )}
          {isLoading && !assets.length ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">No assets found.</h3>
              <p>Click "Upload" or drag files here to add your first asset.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-secondary cursor-pointer"
                  onClick={() => !isBulkSelectMode && setSelectedAsset(asset)}
                >
                  {isBulkSelectMode && (
                    <div
                      className="absolute top-2 left-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBulkSelect(asset.id);
                      }}
                    >
                      <Checkbox
                        checked={bulkSelectedIds.has(asset.id)}
                        className="bg-background/50 border-white/50 data-[state=checked]:bg-primary"
                      />
                    </div>
                  )}
                  <img
                    src={getStorageUrl(asset.file_path)}
                    alt={asset.alt_text || asset.file_name}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-300",
                      isBulkSelectMode &&
                        bulkSelectedIds.has(asset.id) &&
                        "scale-90 opacity-70",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/60 opacity-0 transition-opacity flex flex-col justify-between p-2 text-white",
                      !isBulkSelectMode && "group-hover:opacity-100",
                    )}
                  >
                    <p className="text-xs font-semibold truncate">
                      {asset.file_name}
                    </p>
                  </div>
                  {asset.used_in && asset.used_in.length > 0 && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-1">
                      <LinkIcon className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Preview</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="group hover:bg-secondary/40 cursor-pointer"
                    onClick={() => !isBulkSelectMode && setSelectedAsset(asset)}
                  >
                    <TableCell>
                      {isBulkSelectMode ? (
                        <Checkbox
                          checked={bulkSelectedIds.has(asset.id)}
                          onCheckedChange={() => toggleBulkSelect(asset.id)}
                        />
                      ) : (
                        <img
                          src={getStorageUrl(asset.file_path)}
                          alt={asset.alt_text || asset.file_name}
                          className="h-10 w-10 object-cover rounded-md"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-xs">
                      {asset.file_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">
                      {asset.alt_text || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.size_kb ? `${asset.size_kb.toFixed(1)} KB` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {asset.used_in && asset.used_in.length > 0 && (
                        <LinkIcon className="size-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssetsToDelete([asset]);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={assetsToDelete.length > 0}
        onOpenChange={(open) => !open && setAssetsToDelete([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {assetsToDelete.length} asset(s). Any links to these assets will
              be broken.
            </AlertDialogDescription>
            {assetsToDelete.some((a) => a.used_in && a.used_in.length > 0) && (
              <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5" />
                  <p>
                    <strong>Warning:</strong> At least one selected asset is
                    currently in use.
                  </p>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: "destructive" })}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      >
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>Asset Details</SheetTitle>
              <SheetDescription>
                View details, edit alt text, and see where this asset is used.
              </SheetDescription>
            </SheetHeader>

            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          {selectedAsset && (
            <div className="py-6 space-y-6">
              <img
                src={getStorageUrl(selectedAsset.file_path)}
                alt={selectedAsset.alt_text || selectedAsset.file_name}
                className="w-full object-contain rounded-md border bg-secondary/30 aspect-video"
              />
              <form onSubmit={handleUpdateAltText} className="space-y-2">
                <Label htmlFor="alt_text">Alt Text (for accessibility)</Label>
                <div className="flex gap-2">
                  <Input
                    id="alt_text"
                    name="alt_text"
                    defaultValue={selectedAsset.alt_text || ""}
                  />
                  <Button type="submit">Save</Button>
                </div>
              </form>
              <div className="space-y-2">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getStorageUrl(selectedAsset.file_path)}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyUrl(getStorageUrl(selectedAsset.file_path))
                    }
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Usage</Label>
                {selectedAsset.used_in && selectedAsset.used_in.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAsset.used_in.map((use, i) => (
                      <Link
                        key={i}
                        href="#"
                        className="flex items-center justify-between p-2 rounded-md hover:bg-secondary text-sm"
                      >
                        <span>{use.type}</span>
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2 border rounded-md bg-secondary/30">
                    This asset is not currently used in any content.
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
