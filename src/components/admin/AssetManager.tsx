"use client";

import React, { useState, useRef, DragEvent, useMemo } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  File as FileIcon,
  FileCode,
  Download,
  Folder,
  FolderPlus,
  Home,
  ChevronRight,
  Move,
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
  useMoveAssetMutation,
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

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "assets";
const PLACEHOLDER_FILENAME = ".emptyFolderPlaceholder";

// Helper to determine icon based on mime type
const getFileIcon = (mimeType: string | null, className?: string) => {
  if (!mimeType) return <FileIcon className={className} />;
  if (mimeType.startsWith("image/")) return null;
  if (mimeType.startsWith("video/")) return <FileVideo className={className} />;
  if (mimeType.startsWith("audio/")) return <FileAudio className={className} />;
  if (mimeType.includes("pdf")) return <FileText className={className} />;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  )
    return <FileArchive className={className} />;
  if (
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("html")
  )
    return <FileCode className={className} />;
  return <FileIcon className={className} />;
};

export default function AssetManager() {
  const isMobile = useIsMobile();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StorageAsset | null>(null);
  const [assetsToDelete, setAssetsToDelete] = useState<StorageAsset[]>([]);
  
  // Folder Logic
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  // Selection & Move
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>("root"); // "root" or "folderName" or "path/to/folder"
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: assets = [], isLoading } = useGetAssetsQuery();
  const [addAsset] = useAddAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const [moveAsset] = useMoveAssetMutation();
  const [rescanUsage] = useRescanAssetUsageMutation();

  // --- DERIVED DATA ---
  
  // Get all unique folder paths that exist in the system
  const allAvailableFolders = useMemo(() => {
    const folders = new Set<string>();
    assets.forEach(asset => {
        const parts = asset.file_path.split('/');
        if (parts.length > 1) {
            // It has a folder.
            // Add full folder path (excluding filename)
            const folderPath = parts.slice(0, -1).join('/');
            folders.add(folderPath);
        }
    });
    return Array.from(folders).sort();
  }, [assets]);

  const { currentFolderAssets, subFolders } = useMemo(() => {
    const pathPrefix = currentPath.length > 0 ? currentPath.join("/") + "/" : "";
    
    const folders = new Set<string>();
    const files: StorageAsset[] = [];

    assets.forEach((asset) => {
      if (!asset.file_path.startsWith(pathPrefix)) return;

      const relativePath = asset.file_path.slice(pathPrefix.length);
      const parts = relativePath.split("/");

      if (parts.length > 1) {
        folders.add(parts[0]);
      } else {
        if (asset.file_name !== PLACEHOLDER_FILENAME) {
          files.push(asset);
        }
      }
    });

    return {
      subFolders: Array.from(folders).sort(),
      currentFolderAssets: files,
    };
  }, [assets, currentPath]);

  // --- NAVIGATION ---

  const navigateToFolder = (folderName: string) => {
    setCurrentPath((prev) => [...prev, folderName]);
    setBulkSelectedIds(new Set());
  };

  const navigateUp = () => {
    setCurrentPath((prev) => prev.slice(0, -1));
    setBulkSelectedIds(new Set());
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
    setBulkSelectedIds(new Set());
  };

  const navigateRoot = () => {
    setCurrentPath([]);
    setBulkSelectedIds(new Set());
  };

  // --- ACTIONS ---

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (!supabase) return;

    const pathPrefix = currentPath.length > 0 ? currentPath.join("/") + "/" : "";
    const safeName = newFolderName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullPath = `${pathPrefix}${safeName}/${PLACEHOLDER_FILENAME}`;

    try {
      // Use native File constructor
      const dummyFile = new File([""], PLACEHOLDER_FILENAME, { type: "text/plain" });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, dummyFile);

      if (uploadError) throw uploadError;

      await addAsset({
        file_name: PLACEHOLDER_FILENAME,
        file_path: fullPath,
        mime_type: "application/x-directory",
        size_kb: 0,
      }).unwrap();

      toast.success("Folder created");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    } catch (err: any) {
      toast.error("Failed to create folder", { description: err.message });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) handleUpload(files);
  };

  const handleUpload = async (files: FileList) => {
    if (!supabase) {
      toast.error("Database not configured. Cannot upload assets.");
      return;
    }

    setIsUploading(true);
    const pathPrefix = currentPath.length > 0 ? currentPath.join("/") + "/" : "";

    const uploadPromises = Array.from(files).map(async (file) => {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/__+/g, "_");
      
      const filePath = `${pathPrefix}${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabase!.storage
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
        await supabase!.storage.from(BUCKET_NAME).remove([filePath]);
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

  const handleMoveAssets = async () => {
    const assetsToMove = currentFolderAssets.filter(a => bulkSelectedIds.has(a.id));
    if (assetsToMove.length === 0) return;

    try {
        const movePromises = assetsToMove.map(asset => {
            const fileName = asset.file_name;
            const newPath = targetMoveFolder === 'root' 
                ? fileName 
                : `${targetMoveFolder}/${fileName}`;
            
            // Skip if path is same
            if (newPath === asset.file_path) return Promise.resolve();

            return moveAsset({
                assetId: asset.id,
                oldPath: asset.file_path,
                newPath: newPath
            }).unwrap();
        });

        await Promise.all(movePromises);
        toast.success(`Moved ${assetsToMove.length} items`);
        setBulkSelectedIds(new Set());
        setIsMoveDialogOpen(false);
        setIsBulkSelectMode(false);
    } catch (err: any) {
        toast.error("Failed to move assets", { description: err.message });
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
    const toDelete = currentFolderAssets.filter((asset) => bulkSelectedIds.has(asset.id));
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

  const downloadAsset = async (asset: StorageAsset) => {
    try {
      const url = getStorageUrl(asset.file_path);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = asset.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, isEntering: boolean) => {
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

  // --- RENDER HELPERS ---
  const renderThumbnail = (asset: StorageAsset) => {
    const isImage = asset.mime_type?.startsWith("image/");
    if (isImage) {
      return (
        <img
          src={getStorageUrl(asset.file_path)}
          alt={asset.alt_text || asset.file_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      );
    }
    const Icon = getFileIcon(asset.mime_type, "size-8 text-muted-foreground");
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/30 p-2 text-center group-hover:bg-secondary/50 transition-colors">
        {Icon}
      </div>
    );
  };

  const renderFullPreview = (asset: StorageAsset) => {
    const url = getStorageUrl(asset.file_path);
    const mime = asset.mime_type || "";

    if (mime.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={asset.alt_text || asset.file_name}
          className="max-h-[300px] w-auto object-contain rounded-md shadow-sm"
        />
      );
    }
    if (mime.startsWith("video/")) {
      return (
        <video src={url} controls className="w-full max-h-[300px] rounded-md shadow-sm bg-black" />
      );
    }
    if (mime.startsWith("audio/")) {
      return (
        <div className="w-full p-4 bg-secondary rounded-md flex flex-col items-center gap-4">
          <FileAudio className="size-16 text-primary" />
          <audio src={url} controls className="w-full" />
        </div>
      );
    }
    if (mime.includes("pdf")) {
      return (
        <div className="w-full h-[300px] bg-secondary/20 rounded-md border flex flex-col items-center justify-center gap-4">
          <FileText className="size-16 text-muted-foreground" />
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        {getFileIcon(mime, "size-20 mb-4 opacity-50")}
        <p className="text-sm">Preview not available for this file type.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => downloadAsset(asset)}>
          <Download className="mr-2 size-4" /> Download File
        </Button>
      </div>
    );
  };

  const effectiveViewMode = isMobile ? "grid" : viewMode;

  return (
    <div className="space-y-4 pb-20 md:pb-0 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Asset Manager</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground overflow-x-auto no-scrollbar">
             {/* BREADCRUMBS */}
            <button 
              onClick={navigateRoot} 
              className={cn("flex items-center hover:text-primary transition-colors", currentPath.length === 0 && "text-foreground font-semibold")}
            >
              <Home className="size-3.5 mr-1" /> Root
            </button>
            {currentPath.map((folder, i) => (
              <React.Fragment key={folder + i}>
                <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
                <button
                   onClick={() => navigateToBreadcrumb(i)}
                   className={cn("whitespace-nowrap hover:text-primary transition-colors", i === currentPath.length - 1 && "text-foreground font-semibold")}
                >
                  {folder}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isBulkSelectMode ? (
            <>
              <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setIsMoveDialogOpen(true)}
                 disabled={bulkSelectedIds.size === 0}
                 className="flex-1 sm:flex-none"
              >
                  <Move className="mr-2 size-4" /> Move ({bulkSelectedIds.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkSelectedIds.size === 0}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="mr-2 size-4" /> Delete ({bulkSelectedIds.size})
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
              <Button variant="outline" size="sm" onClick={() => setIsCreateFolderOpen(true)} className="hidden sm:flex">
                <FolderPlus className="mr-2 size-4" /> New Folder
              </Button>
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
          />
        </div>
      </div>

      <Card
        className="flex-1 flex flex-col min-h-[500px]"
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <CardHeader className="border-b p-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               {currentPath.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={navigateUp} className="h-8 w-8 p-0">
                    <ChevronRight className="size-4 rotate-180" />
                 </Button>
               )}
               <Button
                variant={isBulkSelectMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsBulkSelectMode(!isBulkSelectMode)}
                className="h-8 text-xs"
              >
                <CheckSquare className="mr-2 size-3.5" />
                {isMobile ? "Select" : "Select Files"}
              </Button>
            </div>

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
        
        <CardContent className="p-4 flex-1 relative overflow-y-auto">
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-b-lg flex flex-col items-center justify-center backdrop-blur-sm">
              <Upload className="size-10 text-primary mb-2" />
              <p className="font-semibold text-primary">Drop files to upload to current folder</p>
            </div>
          )}

          {isLoading && !assets.length ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : subFolders.length === 0 && currentFolderAssets.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center h-full justify-center">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <LayoutGrid className="size-8 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold">Empty Folder</h3>
              <p className="text-sm mt-1">Upload files or create a subfolder.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCreateFolderOpen(true)}>
                <FolderPlus className="mr-2 size-4" /> Create Folder
              </Button>
            </div>
          ) : (
             <>
               {/* 1. Folders Render */}
               {subFolders.length > 0 && (
                 <div className="mb-6">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Folders</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {subFolders.map(folder => (
                         <div 
                           key={folder}
                           onClick={() => navigateToFolder(folder)}
                           className="group flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all"
                         >
                            <Folder className="size-10 text-blue-400 fill-blue-400/20 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium truncate w-full text-center">{folder}</span>
                         </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* 2. Files Render */}
               {currentFolderAssets.length > 0 && (
                 <div>
                    {subFolders.length > 0 && <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Files</h3>}
                    
                    {effectiveViewMode === "grid" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {currentFolderAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className={cn(
                              "group relative aspect-square overflow-hidden rounded-md border bg-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
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

                            {renderThumbnail(asset)}

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
                                {asset.mime_type?.split("/")[1] || "File"}
                              </p>
                            </div>
                            
                             {/* Quick Download Button on Hover */}
                            {!isBulkSelectMode && (
                              <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAsset(asset);
                                }}
                                title="Download"
                              >
                                <Download className="size-3.5" />
                              </Button>
                            )}

                            {asset.used_in && asset.used_in.length > 0 && (
                              <div className="absolute top-1.5 left-1.5 rounded-full bg-primary/90 p-1 shadow-sm z-10">
                                <LinkIcon className="size-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[60px]">Preview</TableHead>
                              <TableHead>Filename</TableHead>
                              <TableHead className="hidden md:table-cell">Type</TableHead>
                              <TableHead className="hidden sm:table-cell">Size</TableHead>
                              <TableHead className="w-[50px]">Used</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentFolderAssets.map((asset) => (
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
                                    <div className="h-8 w-8 rounded-md overflow-hidden bg-secondary flex items-center justify-center">
                                      {asset.mime_type?.startsWith("image/") ? (
                                        <img
                                          src={getStorageUrl(asset.file_path)}
                                          alt={asset.alt_text || asset.file_name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        getFileIcon(asset.mime_type, "size-4 opacity-50")
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium max-w-[150px] truncate text-xs">
                                  {asset.file_name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs uppercase">
                                  {asset.mime_type?.split("/")[1] || "File"}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">
                                  {asset.size_kb
                                    ? `${asset.size_kb.toFixed(0)} KB`
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {asset.used_in && asset.used_in.length > 0 && (
                                    <LinkIcon className="size-3.5 text-primary" />
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadAsset(asset);
                                      }}
                                      title="Download"
                                    >
                                      <Download className="size-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssetsToDelete([asset]);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="size-3.5 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                 </div>
               )}
             </>
          )}
        </CardContent>
      </Card>

      {/* --- MODALS --- */}

      {/* New Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <SheetDescription>
              Create a subfolder in <strong>{currentPath.length ? currentPath.join("/") : "Root"}</strong>
            </SheetDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input id="folder-name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g. project-screenshots" />
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsCreateFolderOpen(false)}>Cancel</Button>
             <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Move Assets Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Move Items</DialogTitle>
            <DialogDescription>
              Select destination folder for {bulkSelectedIds.size} item(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label>Destination Folder</Label>
               <Select onValueChange={setTargetMoveFolder} defaultValue="root">
                 <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                 </SelectTrigger>
                 <SelectContent className="max-h-60">
                   <SelectItem value="root">/ (Root)</SelectItem>
                   {allAvailableFolders.map(f => (
                     <SelectItem key={f} value={f}>{f}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsMoveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMoveAssets}>Move Here</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              asset(s).
            </AlertDialogDescription>
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

            <div className="flex items-center gap-1">
              {selectedAsset && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadAsset(selectedAsset)}
                  title="Download"
                >
                  <Download className="size-4" />
                </Button>
              )}
              <SheetClose asChild>
                <Button type="button" variant="ghost" size="icon">
                  <X className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </div>

          {selectedAsset && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="rounded-lg border bg-secondary/20 p-2 flex items-center justify-center min-h-[200px]">
                {renderFullPreview(selectedAsset)}
              </div>

              <form onSubmit={handleUpdateAltText} className="space-y-3">
                <Label htmlFor="alt_text">Alt Text (Accessibility)</Label>
                <div className="flex gap-2">
                  <Input
                    id="alt_text"
                    name="alt_text"
                    defaultValue={selectedAsset.alt_text || ""}
                    placeholder="Describe this asset..."
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
                    <span className="text-muted-foreground">Folder:</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">
                       {selectedAsset.file_path.split('/').slice(0, -1).join('/') || 'Root'}
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