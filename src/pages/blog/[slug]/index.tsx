import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus';

// --- Reusable Components (Unchanged) ---

const PostHeader = ({ post }: { post: BlogPost }) => (
  <header className="mb-8">
    <h1 className="mb-4 text-3xl font-black leading-tight tracking-tighter text-foreground md:text-4xl lg:text-5xl">
      {post.title}
    </h1>
    {post.excerpt && (
      <p className="text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>
    )}
  </header>
);

const AuthorInfo = ({
  author,
  postDate,
  views,
}: {
  author: string;
  postDate: string | Date;
  views: number;
}) => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage
        src="https://avatars.githubusercontent.com/u/52954931?v=4"
        alt={author}
      />
      <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-semibold text-foreground">{author}</p>
      <div className="flex items-center gap-2 text-muted-foreground">
        <time dateTime={new Date(postDate).toISOString()}>
          {formatDate(postDate)}
        </time>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Eye className="size-3.5" />
          <span>{views.toLocaleString()} views</span>
        </div>
      </div>
    </div>
  </div>
);

const PostContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypePrism]}
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const PostTagsSidebar = ({ tags }: { tags: string[] }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      Tags
    </h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          <Link href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}>
            {tag}
          </Link>
        </Badge>
      ))}
    </div>
  </div>
);

const NotFoundDisplay = () => (
  <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
    <Head>
      <title>Post Not Found | Blog</title>
      <meta name="robots" content="noindex" />
    </Head>
    <div className="w-full max-w-md text-center">
      <h1 className="text-6xl font-black text-foreground">404</h1>
      <p className="mt-2 text-xl font-medium text-muted-foreground">
        Post Not Found
      </p>
      <p className="mt-4 text-muted-foreground">
        The blog post you're looking for couldn't be found. It might have been moved or deleted.
      </p>
      <Button asChild className="mt-8">
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </div>
  </div>
);

// --- Main Page Component ---

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    // router.isReady ensures that the router has been hydrated and the query params are available
    if (router.isReady) {
      if (slug && typeof slug === "string") {
        const fetchPostData = async () => {
          setLoading(true);
          setError(null);
          try {
            const { data, error: fetchError } = await supabase
              .from("blog_posts")
              .select("*")
              .eq("slug", slug)
              .eq("published", true)
              .single();

            // PGRST116 means "No rows found" which is a valid 404 case, not an error
            if (fetchError && fetchError.code !== "PGRST116") {
              throw new Error(fetchError.message);
            }

            setPost(data); // Will be null if not found
          } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
            setPost(null);
          } finally {
            setLoading(false);
          }
        };
        fetchPostData();
      } else {
        // If there's no slug for some reason, stop loading and show 404
        setLoading(false);
      }
    }
  }, [slug, router.isReady]);

  // View counter logic
  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production") {
      const incrementViewCount = async () => {
        try {
          await supabase.rpc("increment_blog_post_view", {
            post_id_to_increment: post.id,
          });
        } catch (rpcError) {
          console.error("Failed to increment view count", rpcError);
        }
      };
      const timeoutId = setTimeout(incrementViewCount, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [post?.id]);

  if (loading || !router.isReady) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    // You could create a more specific error component here
    return <Layout><NotFoundDisplay /></Layout>;
  }

  if (!post) {
    return <Layout><NotFoundDisplay /></Layout>;
  }

  // --- Meta Tags ---
  const postUrl = `${siteConfig.url}/blog/${post.slug}/`;
  const metaDescription =
    post.excerpt ||
    post.content?.substring(0, 160).replace(/\n/g, " ") ||
    post.title;

  return (
    <Layout>
      <Head>
        <title>{`${post.title} | ${siteConfig.title}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={post.cover_image_url || siteConfig.defaultOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={post.cover_image_url || siteConfig.defaultOgImage} />
        <link rel="canonical" href={postUrl} />
      </Head>

      <main className="py-8 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
            <article className="lg:col-span-9">
              <PostHeader post={post} />
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt={post.title} width={1200} height={630} className="my-8 h-auto w-full rounded-lg border object-cover" />
              )}
              <Separator className="my-8" />
              {post.content && <PostContent content={post.content} />}
            </article>
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <AuthorInfo author={siteConfig.author} postDate={post.published_at || post.created_at || new Date()} views={post.views || 0} />
                {post.tags && post.tags.length > 0 && (
                  <PostTagsSidebar tags={post.tags} />
                )}
              </div>
            </aside>
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}