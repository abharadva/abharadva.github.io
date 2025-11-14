/*
This file is heavily redesigned for the kinetic typography theme.
- The `markdownComponents` are updated to render clean, unstyled HTML. All styling is now handled by the Tailwind Typography plugin (`prose dark:prose-invert`) for automatic theme support.
- The custom code block styling is simplified, removing the neo-brutalist elements.
- The overall page layout is cleaner, with a two-column design on larger screens for the article and a sticky sidebar for metadata.
- `PostHeader`, `AuthorInfo`, and `PostTagsSidebar` are restyled to be minimalist and modern, using components from the UI kit where appropriate (`Avatar`, `Badge`).
- The "Not Found" display is redesigned to match the new, clean aesthetic.
*/
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Calendar, Eye, Copy, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const CodeBlock = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "bash";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg border bg-secondary/50 font-sans">
      <div className="flex items-center justify-between px-4 py-1.5 text-xs">
        <span className="font-sans text-muted-foreground">{lang}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleCopy}>
          {isCopied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        className="!m-0 !p-4 !bg-transparent overflow-x-auto text-sm"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

const markdownComponents: any = {
  code: (props: any) => <CodeBlock {...props} />,
  img: ({ node, ...props }: any) => (
    <Image {...props} loading="lazy" className="my-8 h-auto max-h-[80vh] w-full rounded-lg border object-contain" alt={props.alt || "Blog image"} />
  ),
};

const PostHeader = ({ post }: { post: BlogPost }) => (
  <header className="mb-8">
    <h1 className="mb-4 text-3xl font-black leading-tight tracking-tighter text-foreground md:text-4xl lg:text-5xl">
      {post.title}
    </h1>
    {post.excerpt && <p className="text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>}
  </header>
);

const AuthorInfo = ({ author, postDate, views }: { author: string; postDate: string | Date; views: number }) => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/52954931?v=4" alt={author} />
      <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-semibold text-foreground">{author}</p>
      <div className="flex items-center gap-2 text-muted-foreground">
        <time dateTime={new Date(postDate).toISOString()}>{formatDate(postDate)}</time>
        <span>·</span>
        <div className="flex items-center gap-1"><Eye className="size-3.5" /><span>{views.toLocaleString()} views</span></div>
      </div>
    </div>
  </div>
);

const PostContent = ({ content }: { content: string }) => (
  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  </div>
);

const PostTagsSidebar = ({ tags }: { tags: string[] }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          <Link href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}>{tag}</Link>
        </Badge>
      ))}
    </div>
  </div>
);

const NotFoundDisplay = () => (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <Head><title>Post Not Found | Blog</title><meta name="robots" content="noindex" /></Head>
        <div className="w-full max-w-md text-center">
            <h1 className="text-6xl font-black text-foreground">404</h1>
            <p className="mt-2 text-xl font-medium text-muted-foreground">Post Not Found</p>
            <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
            <Button asChild className="mt-8"><Link href="/blog">Back to Blog</Link></Button>
        </div>
    </div>
);

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    if (slug && typeof slug === "string") {
      const fetchPostData = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: fetchError } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
          if (fetchError) {
            if (fetchError.code === "PGRST116") setPost(null); else setError(fetchError.message);
          } else setPost(data);
        } catch (e: any) { setError(e.message || "An unexpected error occurred"); }
        setLoading(false);
      };
      fetchPostData();
    } else if (router.isReady && !slug) {
      setLoading(false);
      setPost(null);
    }
  }, [slug, router.isReady]);

  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production") {
      const incrementViewCount = async () => {
        try { await supabase.rpc("increment_blog_post_view", { post_id_to_increment: post.id }); }
        catch (rpcError) { console.error("Failed to increment view count", rpcError); }
      };
      const timeoutId = setTimeout(incrementViewCount, 3000); // Increased delay
      return () => clearTimeout(timeoutId);
    }
  }, [post?.id]);

  if (loading) { return <Layout><div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground"/></div></Layout>; }
  if (error) { return <Layout><div className="flex min-h-screen items-center justify-center p-4"><div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 font-medium text-destructive">Error: {error}. <Link href="/blog" className="underline hover:text-foreground">Back to blog</Link></div></div></Layout>; }
  if (!post) { return <Layout><NotFoundDisplay /></Layout>; }

  const postUrl = `${siteConfig.url}/blog/${post.slug}/`;
  const metaDescription = post.excerpt || post.content?.substring(0, 160).replace(/\n/g, ' ') || post.title;

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
              {post.cover_image_url && <Image src={post.cover_image_url} alt={post.title} className="my-8 w-full h-auto rounded-lg border object-cover" />}
              <Separator className="my-8" />
              {post.content && <PostContent content={post.content} />}
            </article>
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <AuthorInfo author={siteConfig.author} postDate={post.published_at || post.created_at || new Date()} views={post.views || 0} />
                {post.tags && post.tags.length > 0 && <PostTagsSidebar tags={post.tags} />}
              </div>
            </aside>
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}