
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Loader2, Plus, FileText } from "lucide-react";

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
    if (fetchError) { setError("Failed to load posts: " + fetchError.message); setPosts([]); } else { setPosts(data || []); }
    setIsLoading(false);
  };

  useEffect(() => { loadPosts(); }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (startInCreateMode) { handleCreatePost(); onActionHandled?.(); }
  }, [startInCreateMode, onActionHandled]);

  const handleCreatePost = () => { setIsCreating(true); setEditingPost(null); };
  const handleEditPost = (post: BlogPost) => { setEditingPost(post); setIsCreating(false); };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    setIsLoading(true);
    const postToDelete = posts.find((p) => p.id === postId);
    if (postToDelete?.cover_image_url && postToDelete.cover_image_url.includes(supabaseUrl)) {
      const pathSegments = postToDelete.cover_image_url.split("/");
      const imagePath = pathSegments.slice(pathSegments.indexOf(bucketName) + 1).join("/");
      if (imagePath.startsWith("blog_images/")) {
        try { await supabase.storage.from(bucketName).remove([imagePath]); }
        catch (storageError) { console.error("Failed to delete cover image from storage:", storageError); }
      }
    }
    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", postId);
    if (deleteError) setError("Failed to delete post: " + deleteError.message); else await loadPosts();
    setIsLoading(false);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, updated_at, ...dataToSave } = postData;
    let response;
    if (isCreating || !editingPost?.id) { response = await supabase.from("blog_posts").insert(dataToSave).select().single(); }
    else { response = await supabase.from("blog_posts").update(dataToSave).eq("id", editingPost.id).select().single(); }
    if (response.error) { setError("Failed to save post: " + response.error.message); setIsLoading(false); return; }
    setIsCreating(false); setEditingPost(null); await loadPosts();
  };

  const handleCancel = () => { setIsCreating(false); setEditingPost(null); setError(null); };

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase.from("blog_posts").update({ published: newStatus, published_at: newStatus ? new Date().toISOString() : null }).eq("id", postId);
    if (updateError) setError("Failed to update status: " + updateError.message); else await loadPosts();
    setIsLoading(false);
  };

  if (isCreating || editingPost) {
    return <BlogEditor post={editingPost} onSave={handleSavePost} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">Create, edit, and manage your blog posts.</p>
        </div>
        <Button onClick={handleCreatePost}><Plus className="mr-2 size-4" />Create New Post</Button>
      </div>
      {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <Input type="text" placeholder="Search posts by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Posts</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Drafts</SelectItem></SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {isLoading ? (<div className="flex justify-center py-10"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>) :
      posts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <FileText className="mx-auto size-12" />
          <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
          <p>Try adjusting your filters or create a new post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 md:mr-4">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="truncate text-lg font-bold" title={post.title}>{post.title}</h3>
                        <Badge variant={post.published ? "default" : "secondary"}>{post.published ? "Published" : "Draft"}</Badge>
                      </div>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{post.excerpt || <span className="italic">No excerpt.</span>}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Created: {new Date(post.created_at || "").toLocaleDateString()}</span>
                        <span>Slug: /{post.slug}</span>
                        <span className="flex items-center gap-1"><Eye className="size-3" /> {post.views || 0}</span>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Button variant="outline" size="sm" onClick={() => togglePostStatus(post.id, post.published || false)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} {post.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEditPost(post)} disabled={isLoading}><Edit className="mr-2 size-4" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)} disabled={isLoading}><Trash2 className="mr-2 size-4" /> Delete</Button>
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