/*
This file is redesigned for the neo-brutalist theme.
- The `markdownComponents` are updated to render HTML with a raw, unstyled look. Styling is now more direct and less reliant on plugins.
- The custom code block component has a simple, bordered style.
- The page layout is a single column.
- The header, author info, and tags sections are restyled with bold fonts, sharp corners, and high contrast.
- All soft design elements are replaced with hard-edged, utilitarian equivalents.
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
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
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
    <div className="relative my-6 rounded-none border-2 border-black bg-neutral-100">
      <div className="flex items-center justify-between border-b-2 border-black px-4 py-1.5 text-xs">
        <span className="font-bold uppercase text-neutral-500">{lang}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500" onClick={handleCopy}>
          {isCopied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={lang}
        PreTag="div"
        className="!m-0 !p-4 !bg-transparent overflow-x-auto text-sm"
        customStyle={{backgroundColor: "transparent"}}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

const markdownComponents: any = {
  code: (props: any) => <CodeBlock {...props} />,
  img: ({ node, ...props }: any) => (
    <img {...props} loading="lazy" className="my-8 h-auto max-h-[80vh] w-full rounded-none border-2 border-black object-contain" alt={props.alt || "Blog image"} />
  ),
};

const PostHeader = ({ post }: { post: BlogPost }) => (
  <header className="mb-8">
    <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tighter text-black md:text-4xl lg:text-5xl">
      {post.title}
    </h1>
    {post.excerpt && <p className="text-lg text-neutral-600 md:text-xl">{post.excerpt}</p>}
  </header>
);

const AuthorInfo = ({ author, postDate, views }: { author: string; postDate: string | Date; views: number }) => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/52954931?v=4" alt={author} />
      <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-bold text-black">{author}</p>
      <div className="flex items-center gap-2 text-neutral-600">
        <time dateTime={new Date(postDate).toISOString()}>{formatDate(postDate)}</time>
        <span>·</span>
        <div className="flex items-center gap-1"><Eye className="size-3.5" /><span>{views.toLocaleString()} views</span></div>
      </div>
    </div>
  </div>
);

const PostContent = ({ content }: { content: string }) => (
  <div className="prose max-w-none focus:outline-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  </div>
);

const PostTags = ({ tags }: { tags: string[] }) => (
  <div className="mt-8">
    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">Tags</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
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
            <h1 className="text-6xl font-bold text-black">404</h1>
            <p className="mt-2 text-xl font-bold text-neutral-600">Post Not Found</p>
            <p className="mt-4 text-neutral-500">The page you're looking for doesn't exist or has been moved.</p>
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
      const timeoutId = setTimeout(incrementViewCount, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [post?.id]);

  if (loading) { return <Layout><div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-neutral-500"/></div></Layout>; }
  if (error) { return <Layout><div className="flex min-h-screen items-center justify-center p-4"><div className="rounded-none border-2 border-destructive bg-red-100 p-6 font-bold text-destructive">Error: {error}. <Link href="/blog" className="underline hover:text-black">Back to blog</Link></div></div></Layout>; }
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl px-4">
            <article>
              <PostHeader post={post} />
              <AuthorInfo author={siteConfig.author} postDate={post.published_at || post.created_at || new Date()} views={post.views || 0} />
              {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="my-8 w-full h-auto rounded-none border-2 border-black object-cover" />}
              <Separator className="my-8" />
              {post.content && <PostContent content={post.content} />}
              {post.tags && post.tags.length > 0 && <PostTags tags={post.tags} />}
            </article>
        </motion.div>
      </main>
    </Layout>
  );
}