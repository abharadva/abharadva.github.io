"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";

const inputClass =
  "w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ";
const selectClass =
  "px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ";
const buttonPrimaryClass = (fullWidth = false) =>
  `bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-none font-bold border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150  ${fullWidth ? "w-full" : ""}`;
const buttonActionClass = (
  color: string,
  bgColorHover: string,
  textColor: string = "text-black",
) =>
  `px-3 py-1 rounded-none text-sm font-semibold border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all duration-100  ${color} hover:${bgColorHover} ${textColor}`;

interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({ startInCreateMode, onActionHandled }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

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
    loadPosts();
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (startInCreateMode) {
      handleCreatePost();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const handleCreatePost = () => {
    setIsCreating(true);
    setEditingPost(null);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    const postToDelete = posts.find((p) => p.id === postId);

    if (
      postToDelete?.cover_image_url &&
      postToDelete.cover_image_url.includes(supabaseUrl)
    ) {
      const pathSegments = postToDelete.cover_image_url.split("/");
      const imagePath = pathSegments
        .slice(pathSegments.indexOf(bucketName) + 1)
        .join("/");
      if (imagePath.startsWith("blog_images/")) {
        try {
          await supabase.storage.from(bucketName).remove([imagePath]);
        } catch (storageError) {
          console.error(
            "Failed to delete cover image from storage:",
            storageError,
          );
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);
    if (deleteError) {
      setError("Failed to delete post: " + deleteError.message);
    } else {
      await loadPosts();
    }
    setIsLoading(false);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, updated_at, ...dataToSave } = postData;

    let response;
    if (isCreating || !editingPost?.id) {
      response = await supabase
        .from("blog_posts")
        .insert(dataToSave)
        .select()
        .single();
    } else {
      response = await supabase
        .from("blog_posts")
        .update(dataToSave)
        .eq("id", editingPost.id)
        .select()
        .single();
    }

    if (response.error) {
      setError("Failed to save post: " + response.error.message);
      setIsLoading(false);
      return;
    }

    setIsCreating(false);
    setEditingPost(null);
    await loadPosts();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
    setError(null);
  };

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      })
      .eq("id", postId);

    if (updateError) {
      setError("Failed to update status: " + updateError.message);
    } else {
      await loadPosts();
    }
    setIsLoading(false);
  };

  if (isLoading && posts.length === 0 && !isCreating && !editingPost && !error) {
    return (
      <div className="p-4  font-semibold text-black">
        Loading blog posts...
      </div>
    );
  }
  if (error && !isCreating && !editingPost) {
    return (
      <div className="rounded-none border-2 border-red-500 bg-red-100 p-4  font-semibold text-red-700">
        {error}
      </div>
    );
  }

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
    <div className="space-y-6 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Blog Posts</h2>
          <p className="text-gray-700">Manage your blog content</p>
        </div>
        <button
          onClick={handleCreatePost}
          className={`${buttonPrimaryClass()} flex items-center space-x-2`}
        >
          <span className="text-xl leading-none">+</span>
          <span>Create New Post</span>
        </button>
      </div>

      <div className="rounded-none border-2 border-black bg-white p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "published" | "draft")
            }
            className={selectClass}
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="font-semibold text-black">Fetching posts...</p>
      )}
      {!isLoading && posts.length === 0 ? (
        <div className="rounded-none border-2 border-black bg-white py-12 text-center">
          <div className="mb-4 text-6xl text-gray-500">📝</div>
          <h3 className="mb-2 text-lg font-bold text-black">No posts found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or create a new post.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border-2 border-black bg-white">
          <div className="divide-y-2 divide-black">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-yellow-50 md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 md:mr-4">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3
                          className="truncate text-lg font-bold text-black"
                          title={post.title}
                        >
                          {post.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-none border-2 border-black px-2 py-0.5  text-xs font-bold ${post.published
                            ? "bg-green-300 text-black"
                            : "bg-yellow-300 text-black"
                            }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mb-3 line-clamp-2 text-gray-700">
                        {post.excerpt || (
                          <span className="italic">No excerpt.</span>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        {post.created_at && (
                          <span>
                            Created:{" "}
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        )}
                        <span>Slug: /{post.slug}</span>
                        <span>Views: {post.views || 0}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-none border border-black bg-gray-200 px-2 py-1  text-xs text-black"
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-2">
                      <button
                        onClick={() =>
                          togglePostStatus(post.id, post.published || false)
                        }
                        disabled={isLoading}
                        className={buttonActionClass(
                          post.published ? "bg-yellow-400" : "bg-green-400",
                          post.published ? "bg-yellow-500" : "bg-green-500",
                        )}
                      >
                        {isLoading
                          ? "..."
                          : post.published
                            ? "Unpublish"
                            : "Publish"}
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        disabled={isLoading}
                        className={buttonActionClass(
                          "bg-blue-400",
                          "bg-blue-500",
                        )}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={isLoading}
                        className={buttonActionClass(
                          "bg-red-400",
                          "bg-red-500",
                          "text-white",
                        )}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}