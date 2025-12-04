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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  ExternalLink,
  ImageIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [addBlogPost] = useAddBlogPostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();
  const [deleteBlogPost] = useDeleteBlogPostMutation();

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
        `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Manager</h2>
          <p className="text-muted-foreground">
            Manage, create, and publish your content.
          </p>
        </div>
        <Button onClick={handleCreatePost} size="sm" className="h-9">
          <Plus className="mr-2 size-4" /> Create Post
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b p-4 space-y-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as any)}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto bg-background/50">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>No posts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Views</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredPosts.map((post) => (
                    <motion.tr
                      key={post.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-secondary/40"
                    >
                      <TableCell>
                        <div className="h-10 w-10 rounded-md border bg-secondary/50 overflow-hidden flex items-center justify-center">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[200px] sm:max-w-[300px]">
                            {post.title}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            /{post.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                          className={
                            post.published
                              ? "bg-primary/15 text-primary hover:bg-primary/25 border-primary/20"
                              : ""
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {post.views?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(post.updated_at || new Date()),
                            "MMM dd, yyyy",
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditPost(post)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => togglePostStatus(post)}
                              >
                                {post.published ? (
                                  <>
                                    <FileText className="mr-2 h-4 w-4" />{" "}
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" /> Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              {post.published && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/blog/view?slug=${post.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                    View Live
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeletePost(post)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
