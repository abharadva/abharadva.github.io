// src/pages/blog/index.tsx
import Link from "next/link";
import { useState, useMemo } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import {
  Eye,
  Clock,
  Loader2,
  FileText,
  Search,
  X,
  Tag,
  CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetPublishedBlogPostsQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";

const calculateReadTime = (content: string = ""): number => {
  const wordsPerMinute = 225;
  const textLength = content.split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(textLength / wordsPerMinute);
  return Math.max(1, time);
};

export default function BlogIndexPage() {
  const {
    data: posts = [],
    isLoading,
    error,
  } = useGetPublishedBlogPostsQuery();
  const { site: siteConfig } = appConfig;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt?.toLowerCase().includes(lowerQuery) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }, [posts, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <Layout>
      <Head>
        <title>{`Blog | ${siteConfig.title}`}</title>
        <meta
          name="description"
          content={`Articles and thoughts from ${siteConfig.author}.`}
        />
        <meta property="og:title" content={`Blog | ${siteConfig.title}`} />
        <meta
          property="og:description"
          content={`Articles and thoughts from ${siteConfig.author}.`}
        />
        <meta property="og:url" content={`${siteConfig.url}/blog/`} />
        <link rel="canonical" href={`${siteConfig.url}/blog/`} />
      </Head>

      <main className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-foreground"
          >
            The Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl text-lg"
          >
            Thoughts, tutorials, and insights on software development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-md mt-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search posts..."
              className="pl-10 pr-10 h-11 bg-secondary/30 border-border/50 focus-visible:ring-primary/50 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !!error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-destructive mb-2 font-medium">
              Failed to load posts.
            </p>
            <p className="text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/50 mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No posts found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms.
            </p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-primary"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            // MASONRY GRID IMPLEMENTATION
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const readTime = calculateReadTime(post.content || "");
                const hasImage = !!post.cover_image_url;

                return (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    layout
                    className="break-inside-avoid" // Prevents cards from splitting across columns
                  >
                    <Link
                      href={`/blog/view?slug=${post.slug}`}
                      className="group flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                    >
                      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 bg-card border-border/50">
                        {hasImage && (
                          <div className="w-full overflow-hidden bg-secondary relative shrink-0">
                            <img
                              src={post.cover_image_url!}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <CardContent className="flex flex-col flex-1 p-5">
                          {post.tags && post.tags[0] && (
                            <div className="mb-3">
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {post.tags[0]}
                              </Badge>
                            </div>
                          )}

                          <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary mb-2">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                            {post.excerpt || "Read more about this topic..."}
                          </p>
                        </CardContent>

                        <CardFooter className="p-5 pt-0 flex items-center justify-between text-xs text-muted-foreground/60 font-medium border-t border-border/30 mt-auto">
                          <div className="flex items-center gap-1.5 pt-4">
                            <CalendarIcon className="size-3.5" />
                            <time
                              dateTime={
                                post.published_at || post.created_at || ""
                              }
                            >
                              {formatDate(post.published_at || post.created_at)}
                            </time>
                          </div>
                          <div className="flex items-center gap-3 pt-4">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" /> {readTime} min
                            </span>
                            {typeof post.views === "number" && (
                              <span className="flex items-center gap-1">
                                <Eye className="size-3.5" /> {post.views}
                              </span>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </Layout>
  );
}
