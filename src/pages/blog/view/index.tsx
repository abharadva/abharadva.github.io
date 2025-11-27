// src/pages/blog/view/index.tsx

import { useRouter } from "next/router";
import { useEffect } from "react";
import type { BlogPost, SiteContent } from "@/types";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { cn, formatDate } from "@/lib/utils";
import { Eye, Clock, Linkedin, ChevronRight, Calendar, FileText, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import NotFoundComponent from "@/components/not-found";
import { BsTwitterX } from "react-icons/bs";
import {
  useGetBlogPostBySlugQuery,
  useIncrementPostViewMutation,
  useGetSiteIdentityQuery,
} from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import { TableOfContents } from "@/components/table-of-contents";

// ... (PostBreadcrumb and PostMeta components remain the same) ...
const PostBreadcrumb = ({ post }: { post: BlogPost }) => (
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <li>
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
      </li>
      <li>
        <ChevronRight className="size-4" />
      </li>
      <li className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
        {post.title}
      </li>
    </ol>
  </nav>
);

const PostMeta = ({
  post,
  readTime,
  siteContent,
}: {
  post: BlogPost;
  readTime: number;
  siteContent: SiteContent | null;
}) => {
  const authorName = siteContent?.profile_data.name || appConfig.site.author;
  const authorImage = siteContent?.profile_data.profile_picture_url;
  const showImage = siteContent?.profile_data.show_profile_picture;

  return (
    <div className="flex items-center gap-3">
      {showImage && authorImage && (
        <Avatar className="size-10 border border-border">
          <AvatarImage src={authorImage} alt={authorName} />
          <AvatarFallback>
            {authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="text-sm leading-tight">
        <p className="font-medium text-foreground">{authorName}</p>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <time
            dateTime={new Date(
              post.published_at || post.created_at || "",
            ).toISOString()}
          >
            {formatDate(post.published_at || post.created_at || new Date())}
          </time>
          <span>•</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </div>
  );
};

const PostContent = ({ content }: { content: string }) => (
  <div className="prose prose-lg max-w-none dark:prose-invert
    prose-headings:scroll-mt-24
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
    prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border
    prose-img:rounded-xl prose-img:border prose-img:border-border"
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypePrism, rehypeSlug]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const PostFooter = ({
  post,
  onShareX,
  onShareLinkedIn,
}: {
  post: BlogPost;
  onShareX: () => void;
  onShareLinkedIn: () => void;
}) => (
  <footer className="mt-16 pt-8 border-t border-border">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}
            >
              <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors px-3 py-1 text-sm font-normal">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Share:</span>
        <Button variant="outline" size="icon" onClick={onShareX} className="rounded-full size-9">
          <BsTwitterX className="size-4" />
          <span className="sr-only">Share on X</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onShareLinkedIn} className="rounded-full size-9">
          <Linkedin className="size-4" />
          <span className="sr-only">Share on LinkedIn</span>
        </Button>
      </div>
    </div>
  </footer>
);

const BlogPostSkeleton = () => (
  <div className="mx-auto max-w-5xl px-4 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 lg:col-start-1">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  </div>
);


export default function BlogPostViewPage() {
  const router = useRouter();
  const { slug } = router.query;

  const {
    data: post,
    isLoading: isPostLoading,
    isError,
  } = useGetBlogPostBySlugQuery(slug as string, {
    skip: !router.isReady || !slug,
  });

  const { data: siteContent, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();
  const [incrementView] = useIncrementPostViewMutation();
  const { site: siteConfig } = appConfig;

  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production") {
      const timer = setTimeout(() => {
        incrementView(post.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [post?.id, incrementView]);

  const isLoading = isPostLoading || isContentLoading || !router.isReady;

  if (isLoading) {
    return (
      <Layout>
        <BlogPostSkeleton />
      </Layout>
    );
  }

  if (isError || !post) {
    return (
      <Layout>
        <NotFoundComponent />
      </Layout>
    );
  }

  const postUrl = `${siteConfig.url}/blog/view?slug=${post.slug}`;
  const metaDescription =
    post.excerpt ||
    post.content?.substring(0, 160).replace(/\n/g, " ") ||
    post.title;
  const readTime = Math.max(
    1,
    Math.ceil((post.content?.split(/\s+/).filter(Boolean).length || 0) / 225),
  );

  const shareOnX = () =>
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out this article: ${post.title}`)}&url=${encodeURIComponent(postUrl)}`,
      "_blank",
    );
  const shareOnLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      "_blank",
    );

  return (
    <Layout>
      <Head>
        <title>{`${post.title} | ${siteConfig.title}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <link rel="canonical" href={postUrl} />
      </Head>
      <main className="py-8 md:py-16">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 max-w-7xl"
        >
          <div className={cn("grid grid-cols-1 gap-12", post.show_toc && "lg:grid-cols-12")}>

            <div data-toc={post.show_toc} className={cn(post.show_toc ? "lg:col-span-8" : "lg:col-span-1")}>
              <PostBreadcrumb post={post} />

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.1]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-6 mb-10">
                <PostMeta
                  post={post}
                  readTime={readTime}
                  siteContent={siteContent || null}
                />
              </div>

              {post.cover_image_url && (
                <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              )}

              <PostContent content={post.content || ''} />

              <PostFooter
                post={post}
                onShareX={shareOnX}
                onShareLinkedIn={shareOnLinkedIn}
              />
            </div>

            {post.show_toc && (
              <aside className="hidden lg:col-span-4 lg:block">
                <div className="sticky top-28 space-y-8">
                  {post.content && (
                    <div className="p-1">
                      <TableOfContents content={post.content} />
                    </div>
                  )}
                </div>
              </aside>
            )}

          </div>
        </motion.article>
      </main>
    </Layout>
  );
}