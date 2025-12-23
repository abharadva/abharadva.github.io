// src/components/admin/AssetManager.tsx
"use client";

import React, { useState, useRef, DragEvent } from "react";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  LayoutGrid,
  List,
  RefreshCw,
  X,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import { cn, getStorageUrl } from "@/lib/utils";
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StorageAsset | null>(null);
  const [assetsToDelete, setAssetsToDelete] = useState<StorageAsset[]>([]);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Default to grid for better mobile exp

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

  // Determine effective view mode (force grid on mobile if preferred, or keep explicit toggle)
  const effectiveViewMode = isMobile ? "grid" : viewMode;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Asset Manager</h2>
          <p className="text-muted-foreground">
            Upload, view, and manage your site's images and files.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBulkSelectMode ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkSelectedIds.size === 0}
                className="flex-1 sm:flex-none"
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
                className="flex-1 sm:flex-none"
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
                className="hidden sm:flex"
              >
                <RefreshCw className="mr-2 size-4" /> Rescan
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
                className="flex-1 sm:flex-none"
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
        className="min-h-[500px]"
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <Button
              variant={isBulkSelectMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsBulkSelectMode(!isBulkSelectMode)}
            >
              <CheckSquare className="mr-2 size-4" />
              {isMobile ? "Select" : "Bulk Select"}
            </Button>

            {/* Hide view toggle on mobile if forcing grid */}
            {!isMobile && (
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
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-b-lg flex flex-col items-center justify-center backdrop-blur-sm">
              <Upload className="size-10 text-primary mb-2" />
              <p className="font-semibold text-primary">Drop files to upload</p>
            </div>
          )}

          {isLoading && !assets.length ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <LayoutGrid className="size-8 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold">No assets found</h3>
              <p className="text-sm mt-1">Upload images to get started.</p>
            </div>
          ) : effectiveViewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 p-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-md border bg-secondary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
                    isBulkSelectMode &&
                      bulkSelectedIds.has(asset.id) &&
                      "ring-2 ring-primary bg-primary/10",
                  )}
                  onClick={() => {
                    if (isBulkSelectMode) toggleBulkSelect(asset.id);
                    else setSelectedAsset(asset);
                  }}
                >
                  {isBulkSelectMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={bulkSelectedIds.has(asset.id)}
                        className="bg-background/80 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  )}

                  <img
                    src={getStorageUrl(asset.file_path)}
                    alt={asset.alt_text || asset.file_name}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-300",
                      !isBulkSelectMode && "group-hover:scale-105",
                    )}
                    loading="lazy"
                  />

                  {/* Overlay on Desktop Hover / Always Visible Title on Mobile if needed (optional) */}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white opacity-0 transition-opacity flex flex-col justify-end",
                      !isBulkSelectMode && "group-hover:opacity-100",
                    )}
                  >
                    <p className="text-[10px] font-medium truncate">
                      {asset.file_name}
                    </p>
                    <p className="text-[9px] opacity-80 uppercase">
                      {asset.mime_type?.split("/")[1]}
                    </p>
                  </div>

                  {asset.used_in && asset.used_in.length > 0 && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-primary/90 p-1 shadow-sm">
                      <LinkIcon className="size-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Preview</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Alt Text
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="w-[50px]">Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow
                      key={asset.id}
                      className="group hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        if (isBulkSelectMode) toggleBulkSelect(asset.id);
                        else setSelectedAsset(asset);
                      }}
                    >
                      <TableCell className="py-2">
                        {isBulkSelectMode ? (
                          <Checkbox
                            checked={bulkSelectedIds.has(asset.id)}
                            onCheckedChange={() => toggleBulkSelect(asset.id)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary">
                            <img
                              src={getStorageUrl(asset.file_path)}
                              alt={asset.alt_text || asset.file_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {asset.file_name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                        {asset.alt_text || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">
                        {asset.size_kb
                          ? `${asset.size_kb.toFixed(0)} KB`
                          : "N/A"}
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
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={assetsToDelete.length > 0}
        onOpenChange={(open) => !open && setAssetsToDelete([])}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold text-foreground">
                {assetsToDelete.length}
              </span>{" "}
              asset(s). Any links to these assets will be broken.
            </AlertDialogDescription>
            {assetsToDelete.some((a) => a.used_in && a.used_in.length > 0) && (
              <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5" />
                  <p className="font-medium">
                    Warning: One or more selected assets are currently in use.
                  </p>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
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
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <div className="flex justify-between items-center p-4 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
            <SheetHeader className="text-left">
              <SheetTitle>Asset Details</SheetTitle>
              <SheetDescription className="hidden sm:block">
                View details, edit alt text, and see usage.
              </SheetDescription>
            </SheetHeader>

            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>

          {selectedAsset && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="rounded-lg border bg-secondary/20 p-2 flex items-center justify-center min-h-[200px]">
                <img
                  src={getStorageUrl(selectedAsset.file_path)}
                  alt={selectedAsset.alt_text || selectedAsset.file_name}
                  className="max-h-[300px] w-auto object-contain rounded-md shadow-sm"
                />
              </div>

              <form onSubmit={handleUpdateAltText} className="space-y-3">
                <Label htmlFor="alt_text">Alt Text (Accessibility)</Label>
                <div className="flex gap-2">
                  <Input
                    id="alt_text"
                    name="alt_text"
                    defaultValue={selectedAsset.alt_text || ""}
                    placeholder="Describe this image..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                <Label>File Information</Label>
                <div className="rounded-md border p-3 text-sm space-y-2 bg-card">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filename:</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">
                      {selectedAsset.file_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>
                      {selectedAsset.size_kb
                        ? `${selectedAsset.size_kb.toFixed(1)} KB`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="uppercase">
                      {selectedAsset.mime_type?.split("/")[1] || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getStorageUrl(selectedAsset.file_path)}
                    readOnly
                    className="text-xs font-mono bg-muted/50"
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

              <div className="space-y-3">
                <Label>Used In</Label>
                {selectedAsset.used_in && selectedAsset.used_in.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAsset.used_in.map((use, i) => (
                      <Link
                        key={i}
                        href="#"
                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent transition-colors text-sm group"
                      >
                        <span className="font-medium">{use.type}</span>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-md border border-dashed text-center text-sm text-muted-foreground bg-muted/10">
                    Not currently used in any known content.
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
