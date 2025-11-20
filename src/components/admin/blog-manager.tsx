// src/components/admin/blog-manager.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import {
  useGetAdminBlogPostsQuery,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Loader2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";

interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({
  startInCreateMode,
  onActionHandled,
}: BlogManagerProps) {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");

  const { data: posts = [], isLoading, error } = useGetAdminBlogPostsQuery();
  const [addBlogPost, { isLoading: isAdding }] = useAddBlogPostMutation();
  const [updateBlogPost, { isLoading: isUpdating }] =
    useUpdateBlogPostMutation();
  const [deleteBlogPost, { isLoading: isDeleting }] =
    useDeleteBlogPostMutation();
  const isMutating = isAdding || isUpdating || isDeleting;

  useEffect(() => {
    if (startInCreateMode) {
      handleCreatePost();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (filterStatus === "published") return post.published;
        if (filterStatus === "draft") return !post.published;
        return true;
      })
      .filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [posts, searchTerm, filterStatus]);

  const handleCreatePost = () => {
    setIsCreating(true);
    setEditingPost(null);
  };
  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
  };
  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    )
      return;
    try {
      await deleteBlogPost(post).unwrap();
      toast.success("Post deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete post", { description: err.message });
    }
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    try {
      if (isCreating || !editingPost?.id) {
        await addBlogPost(postData).unwrap();
        toast.success("Post created successfully.");
      } else {
        await updateBlogPost({ ...postData, id: editingPost.id }).unwrap();
        toast.success("Post updated successfully.");
      }
      handleCancel();
    } catch (err: any) {
      toast.error("Failed to save post", { description: err.message });
    }
  };

  const togglePostStatus = async (post: BlogPost) => {
    try {
      await updateBlogPost({
        id: post.id,
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      }).unwrap();
      toast.success(`Post ${!post.published ? "published" : "unpublished"}.`);
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    }
  };

  if (isCreating || editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSavePost}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 size-4" />
          Create New Post
        </Button>
      </div>
      {!!error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error && typeof error === "object" && "message" in error
              ? String((error as { message: unknown }).message)
              : "Failed to load posts"}
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <Input
            type="text"
            placeholder="Search posts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as any)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <FileText className="mx-auto size-12" />
          <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
          <p>Try adjusting your filters or create a new post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 md:mr-4">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3
                          className="truncate text-lg font-bold"
                          title={post.title}
                        >
                          {post.title}
                        </h3>
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt || (
                          <span className="italic">No excerpt.</span>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Created:{" "}
                          {new Date(post.created_at || "").toLocaleDateString()}
                        </span>
                        <span>Slug: /{post.slug}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {post.views || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePostStatus(post)}
                        disabled={isMutating}
                      >
                        {isUpdating ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}{" "}
                        {post.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                        disabled={isMutating}
                      >
                        <Edit className="mr-2 size-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 size-4" /> Delete
                      </Button>
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
