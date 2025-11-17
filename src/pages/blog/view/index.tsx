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
import NotFoundComponent from "@/components/not-found";

// --- Reusable Components ---
const PostHeader = ({ post }: { post: BlogPost }) => ( <header className="mb-8"><h1 className="mb-4 text-3xl font-black leading-tight tracking-tighter text-foreground md:text-4xl lg:text-5xl">{post.title}</h1>{post.excerpt && (<p className="text-lg text-muted-foreground md:text-xl">{post.excerpt}</p>)}</header> );
const AuthorInfo = ({ author, postDate, views }: { author: string; postDate: string | Date; views: number; }) => ( <div className="flex items-center gap-3"><Avatar><AvatarImage src="https://avatars.githubusercontent.com/u/52954931?v=4" alt={author} /><AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="text-sm"><p className="font-semibold text-foreground">{author}</p><div className="flex items-center gap-2 text-muted-foreground"><time dateTime={new Date(postDate).toISOString()}>{formatDate(postDate)}</time><span>·</span><div className="flex items-center gap-1"><Eye className="size-3.5" /><span>{views.toLocaleString()} views</span></div></div></div></div> );
const PostContent = ({ content }: { content: string }) => ( <div className="prose prose-lg dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypePrism]} components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />, }}>{content}</ReactMarkdown></div> );
const PostTagsSidebar = ({ tags }: { tags: string[] }) => ( <div><h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3><div className="flex flex-wrap gap-2">{tags.map((tag) => (<Badge key={tag} variant="secondary"><Link href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}>{tag}</Link></Badge>))}</div></div> );

// --- Main Page Component ---
export default function BlogPostViewPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined = loading
  const { site: siteConfig } = appConfig;

  useEffect(() => {
    if (router.isReady) {
      if (slug && typeof slug === "string") {
        const fetchPostData = async () => {
          setPost(undefined);
          try {
            const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
            if (error && error.code !== "PGRST116") throw error;
            setPost(data);
          } catch (e) {
            console.error("Failed to fetch post", e);
            setPost(null);
          }
        };
        fetchPostData();
      } else {
        setPost(null); // No slug in URL, so post is not found
      }
    }
  }, [slug, router.isReady]);
  
  // View counter
  // View counter
  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production") {
      const timer = setTimeout(async () => { // Make the function async
        const { error } = await supabase.rpc("increment_blog_post_view", { 
          post_id_to_increment: post.id 
        });

        if (error) {
          console.error("Failed to increment view count:", error);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [post?.id]);

  if (post === undefined) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  if (post === null) {
    return <Layout><NotFoundComponent /></Layout>;
  }
  
  const postUrl = `${siteConfig.url}/blog/view?slug=${post.slug}`;
  const metaDescription = post.excerpt || post.content?.substring(0, 160).replace(/\n/g, " ") || post.title;

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
            <article className="lg:col-span-9">
              <PostHeader post={post} />
              {post.cover_image_url && (<img src={post.cover_image_url} alt={post.title} width={1200} height={630} className="my-8 h-auto w-full rounded-lg border object-cover" />)}
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