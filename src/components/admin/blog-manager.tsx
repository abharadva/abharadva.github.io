
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, BookText, Loader2, ToggleLeft, ToggleRight, Plus } from "lucide-react";
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

interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({ startInCreateMode, onActionHandled }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

    if (filterStatus === "published") query = query.eq("published", true);
    else if (filterStatus === "draft") query = query.eq("published", false);
    if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError("Failed to load posts: " + fetchError.message);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadPosts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (startInCreateMode) {
      handleCreatePost();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const handleCreatePost = () => { setIsCreating(true); setEditingPost(null); };
  const handleEditPost = (post: BlogPost) => { setEditingPost(post); setIsCreating(false); };

  const handleDeletePost = async (postId: string) => {
    setIsLoading(true);
    const postToDelete = posts.find((p) => p.id === postId);

    if (postToDelete?.cover_image_url && postToDelete.cover_image_url.includes(supabaseUrl)) {
      const pathSegments = postToDelete.cover_image_url.split("/");
      const imagePath = pathSegments.slice(pathSegments.indexOf(bucketName) + 1).join("/");
      if (imagePath.startsWith("blog_images/")) {
        try { await supabase.storage.from(bucketName).remove([imagePath]); }
        catch (storageError) { console.error("Failed to delete cover image:", storageError); }
      }
    }

    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", postId);
    if (deleteError) { setError("Failed to delete post: " + deleteError.message); }
    else { await loadPosts(); }
    setIsLoading(false);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, updated_at, ...dataToSave } = postData;

    const response = isCreating || !editingPost?.id
      ? await supabase.from("blog_posts").insert(dataToSave).select().single()
      : await supabase.from("blog_posts").update(dataToSave).eq("id", editingPost.id).select().single();

    if (response.error) {
      setError("Failed to save post: " + response.error.message);
      setIsLoading(false);
      return;
    }

    setIsCreating(false);
    setEditingPost(null);
    await loadPosts();
  };

  const handleCancel = () => { setIsCreating(false); setEditingPost(null); setError(null); };

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase.from("blog_posts")
      .update({ published: newStatus, published_at: newStatus ? new Date().toISOString() : null })
      .eq("id", postId);

    if (updateError) { setError("Failed to update status: " + updateError.message); }
    else { await loadPosts(); }
    setIsLoading(false);
  };

  if (isCreating || editingPost) {
    return <BlogEditor post={editingPost} onSave={handleSavePost} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-neutral-600">Manage your blog content</p>
        </div>
        <Button onClick={handleCreatePost}><Plus className="mr-2 size-4" /> Create New Post</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 border-t-0 p-4 md:flex-row md:p-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /><span className="ml-2">Fetching posts...</span></div>}
      
      {!isLoading && error && <div className="rounded-none border-2 border-destructive bg-red-100 p-4 font-bold text-destructive">{error}</div>}
      
      {!isLoading && !error && posts.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-black py-12 text-center">
          <BookText className="mx-auto mb-4 size-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-bold">No posts found</h3>
          <p className="text-neutral-500">Try adjusting your filters or create a new post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="flex flex-col gap-4 border-t-0 p-4 md:flex-row md:items-start md:justify-between md:p-6">
                    <div className="min-w-0 flex-1 md:mr-4">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="truncate text-lg font-bold" title={post.title}>{post.title}</h3>
                        <Badge variant={post.published ? "default" : "secondary"}>{post.published ? "Published" : "Draft"}</Badge>
                      </div>
                      <p className="mb-3 line-clamp-2 text-sm text-neutral-600">{post.excerpt || <span className="italic">No excerpt.</span>}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                        {post.created_at && <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>}
                        <span>Slug: /{post.slug}</span>
                        <span>Views: {post.views || 0}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.map((tag: string) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                      )}
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Button variant="outline" size="sm" onClick={() => togglePostStatus(post.id, post.published || false)} disabled={isLoading}>
                        {post.published ? <ToggleRight className="mr-2 size-4" /> : <ToggleLeft className="mr-2 size-4" />}
                        {post.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEditPost(post)} disabled={isLoading}><Edit className="mr-2 size-4" />Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isLoading}><Trash2 className="mr-2 size-4" />Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the post titled "{post.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}