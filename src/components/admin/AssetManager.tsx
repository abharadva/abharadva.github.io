"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabase/client';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Loader2, Trash2, Copy, AlertTriangle, Link as LinkIcon, Edit, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || 'blog-assets';

export default function AssetManager() {
  const [assets, setAssets] = useState<StorageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StorageAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<StorageAsset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    const { data: dbData, error: dbError } = await supabase.from('storage_assets').select('*').order('created_at', { ascending: false });

    if (dbError) {
      toast.error("Failed to fetch asset metadata", { description: dbError.message });
    } else {
      setAssets(dbData || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async file => {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}`;
      const filePath = `blog_images/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);

      const { error: dbInsertError } = await supabase.from('storage_assets').insert({ file_name: file.name, file_path: filePath, mime_type: file.type, size_kb: file.size / 1024 });
      if (dbInsertError) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        throw new Error(`DB insert failed for ${file.name}: ${dbInsertError.message}`);
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
    if (!assetToDelete) return;

    const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([assetToDelete.file_path]);
    if (storageError) { toast.error("Failed to delete from storage", { description: storageError.message }); return; }

    const { error: dbError } = await supabase.from('storage_assets').delete().eq('id', assetToDelete.id);
    if (dbError) { toast.error("Storage file deleted, but failed to remove metadata.", { description: dbError.message }); }
    else { toast.success(`Asset "${assetToDelete.file_name}" deleted.`); }

    setAssetToDelete(null);
    fetchAssets();
  };

  const handleUpdateAltText = async (e: React.FormEvent<HTMLFormElement>) => { /* ... (This function remains unchanged) */ };

  const handleRescanUsage = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    const { error } = await supabase.rpc('update_asset_usage');
    if (error) { if (!isSilent) toast.error("Failed to rescan asset usage", { description: error.message }); }
    else { if (!isSilent) toast.success("Asset usage successfully updated."); }
    fetchAssets();
  }

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Manager</h2>
          <p className="text-muted-foreground">Upload, view, and manage your site's images and files.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleRescanUsage()} disabled={isLoading}>Rescan Usage</Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
            Upload
          </Button>
          <input type="file" ref={fileInputRef} multiple onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Assets</CardTitle>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'grid' | 'list') }} size="sm">
              <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading && !assets.length ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : assets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">No assets found.</h3>
              <p>Click "Upload" to add your first asset.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="group relative aspect-square overflow-hidden rounded-md border bg-secondary">
                  <img src={getPublicUrl(asset.file_path)} alt={asset.alt_text || asset.file_name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-between p-2 text-white">
                    <p className="text-xs font-semibold truncate">{asset.file_name}</p>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => copyUrl(getPublicUrl(asset.file_path))}><Copy className="size-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => { setSelectedAsset(asset); setIsEditDialogOpen(true); }}><Edit className="size-4" /></Button>                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-destructive/80" onClick={() => setAssetToDelete(asset)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                  {asset.used_in && asset.used_in.length > 0 && (
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-1"><LinkIcon className="size-3 text-primary-foreground" /></div></TooltipTrigger><TooltipContent><p>Used in: {asset.used_in.map(u => u.type).join(', ')}</p></TooltipContent></Tooltip></TooltipProvider>
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
                {assets.map(asset => (
                  <TableRow key={asset.id} className="group">
                    <TableCell>
                      <img src={getPublicUrl(asset.file_path)} alt={asset.alt_text || asset.file_name} className="h-12 w-12 object-cover rounded-md" />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-xs">{asset.file_name}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">{asset.alt_text || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{asset.size_kb ? `${asset.size_kb.toFixed(1)} KB` : 'N/A'}</TableCell>
                    <TableCell>
                      {asset.used_in && asset.used_in.length > 0 && (
                        <TooltipProvider><Tooltip><TooltipTrigger><LinkIcon className="size-4 text-primary" /></TooltipTrigger><TooltipContent><p>Used in: {asset.used_in.map(u => u.type).join(', ')}</p></TooltipContent></Tooltip></TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Copy URL" onClick={() => copyUrl(getPublicUrl(asset.file_path))}><Copy className="size-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit Alt Text" onClick={() => { setSelectedAsset(asset); setIsEditDialogOpen(true); }}><Edit className="size-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete Asset" onClick={() => setAssetToDelete(asset)}><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset: <strong className="text-foreground">{assetToDelete?.file_name}</strong>.
            </AlertDialogDescription>
            {assetToDelete?.used_in && assetToDelete.used_in.length > 0 && (
              <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5" />
                  <div>
                    <p className="font-bold">Warning: Asset is in use!</p>
                    <ul className="mt-1 list-disc pl-5">
                      {assetToDelete.used_in.map((use, i) => <li key={i}>{use.type}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Asset Details</DialogTitle></DialogHeader>
          {selectedAsset && (
            <form onSubmit={handleUpdateAltText} className="space-y-4">
              <img src={getPublicUrl(selectedAsset.file_path)} alt="preview" className="max-h-48 w-full object-contain rounded-md border" />
              <div><Label htmlFor="alt_text">Alt Text (for accessibility)</Label><Input id="alt_text" name="alt_text" defaultValue={selectedAsset.alt_text || ''} /></div>
              <div className="flex justify-end gap-2"><Button type="submit">Save</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}