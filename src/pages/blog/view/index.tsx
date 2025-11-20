// src/pages/blog/view/index.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye, Loader2, Clock, Linkedin, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus';
import NotFoundComponent from "@/components/not-found";
import { BsTwitterX } from "react-icons/bs";
import { useGetBlogPostBySlugQuery, useIncrementPostViewMutation } from "@/store/api/publicApi";
import type { BlogPost } from "@/types";

const PostBreadcrumb = ({ post }: { post: BlogPost }) => (
  <nav aria-label="breadcrumb">
    <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
      <li><ChevronRight className="size-4" /></li>
      <li className="font-medium text-foreground truncate max-w-xs">{post.title}</li>
    </ol>
  </nav>
);

const PostMeta = ({ post, readTime }: { post: BlogPost, readTime: number }) => (
  <div className="flex items-center gap-4">
    <Avatar className="size-12">
      <AvatarImage src="https://avatars.githubusercontent.com/u/52954931?v=4" alt={appConfig.site.author} />
      <AvatarFallback>{appConfig.site.author.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-semibold text-foreground">{appConfig.site.author}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        <time dateTime={new Date(post.published_at || post.created_at || "").toISOString()}>{formatDate(post.published_at || post.created_at || new Date())}</time>
        <span className="hidden sm:inline">·</span>
        <span className="flex items-center gap-1.5"><Clock className="size-4" /> {readTime} min read</span>
        <span className="hidden sm:inline">·</span>
        <span className="flex items-center gap-1.5"><Eye className="size-4" /> {(post.views || 0).toLocaleString()} views</span>
      </div>
    </div>
  </div>
);

const PostContent = ({ content }: { content: string }) => (
  <div className="prose dark:prose-invert max-w-none prose-p:text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypePrism]} components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />, }}>
      {content}
    </ReactMarkdown>
  </div>
);

const PostFooter = ({ post, onShareX, onShareLinkedIn }: { post: BlogPost, onShareX: () => void, onShareLinkedIn: () => void }) => (
  <footer className="mt-12 space-y-8">
    {post.tags && post.tags.length > 0 && (
      <div>
        <h3 className="mb-3 text-lg font-semibold">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => <Badge key={tag} variant="secondary">
            <Link href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}>#{tag}</Link>
          </Badge>)}
        </div>
      </div>
    )}
    <div>
      <h3 className="mb-3 text-lg font-semibold">Share this article</h3>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onShareX}><BsTwitterX className="mr-2 size-4" /> X</Button>
        <Button variant="outline" onClick={onShareLinkedIn}><Linkedin className="mr-2 size-4" /> LinkedIn</Button>
      </div>
    </div>
  </footer>
);

export default function BlogPostViewPage() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: post, isLoading, isError } = useGetBlogPostBySlugQuery(slug as string, {
    skip: !router.isReady || !slug,
  });

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

  if (isLoading || !router.isReady) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  if (isError || !post) {
    return <Layout><NotFoundComponent /></Layout>;
  }

  const postUrl = `${siteConfig.url}/blog/view?slug=${post.slug}`;
  const metaDescription = post.excerpt || post.content?.substring(0, 160).replace(/\n/g, " ") || post.title;
  const readTime = Math.max(1, Math.ceil((post.content?.split(/\s+/).filter(Boolean).length || 0) / 225));

  const shareOnX = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`Check out this article: ${post.title}`)}&url=${encodeURIComponent(postUrl)}`, '_blank');
  const shareOnLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');

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
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-4xl px-4">
          <PostBreadcrumb post={post} />
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tighter text-foreground md:text-5xl lg:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>}
          <div className="mt-8">
            <PostMeta post={post} readTime={readTime} />
          </div>
          {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} width={1200} height={630} className="my-8 h-auto w-full rounded-lg border object-cover" />}
          <div className="mt-8">{post.content && <PostContent content={post.content} />}</div>
          <Separator className="my-12" />
          <PostFooter post={post} onShareX={shareOnX} onShareLinkedIn={shareOnLinkedIn} />
        </motion.article>
      </main>
    </Layout>
  );
}