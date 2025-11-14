
/*
This file is redesigned for the neo-brutalist theme.
- The minimalist header and post cards are replaced with a raw, high-contrast design.
- The page header is made starker with bold, uppercase typography.
- Post cards are now built using the redesigned neo-brutalist `Card` component, featuring sharp corners, thick borders, and hard shadows.
- Metadata (date, views, read time) is presented in a functional, bold style.
- The empty/loading states are updated to match the stark aesthetic.
*/
import Link from "next/link";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const calculateReadTime = (content: string = ""): number => {
  const wordsPerMinute = 225;
  const textLength = content.split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(textLength / wordsPerMinute);
  return Math.max(1, time);
};

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (fetchError) throw new Error(fetchError.message);
        setPosts(data || []);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  if (loading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center p-4"><div className="rounded-none border-2 border-destructive bg-destructive/10 p-6 font-bold text-destructive">Error loading posts: {error}</div></div></Layout>;
  }

  return (
    <Layout>
      <Head>
        <title>{`Blog | ${siteConfig.title}`}</title>
        <meta name="description" content={`Articles and thoughts from ${siteConfig.author}.`} />
        <meta property="og:title" content={`Blog | ${siteConfig.title}`} />
        <meta property="og:description" content={`Articles and thoughts from ${siteConfig.author}.`} />
        <meta property="og:url" content={`${siteConfig.url}/blog/`} />
        <link rel="canonical" href={`${siteConfig.url}/blog/`} />
      </Head>
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b-2 border-foreground pb-8 text-center"
        >
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground md:text-6xl">
            The Blog
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A collection of articles on web development, design, and technology.
          </p>
        </motion.header>

        {posts.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <h3 className="text-2xl font-bold">No Posts Yet</h3>
            <p className="text-muted-foreground">Check back soon for new articles.</p>
          </motion.div>
        )}

        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => {
            const readTime = calculateReadTime(post.content || "");
            return (
              <motion.div key={post.id} variants={itemVariants} role="article">
                <Link href={`/blog/${post.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-none">
                  <Card className="overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-none active:translate-x-1 active:translate-y-1 md:flex">
                    {post.cover_image_url && (
                      <div className="md:w-1/3 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={`Cover image for ${post.title}`}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-full"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-col p-6 md:w-2/3">
                      <div className="flex-grow">
                         {post.tags && post.tags[0] && <Badge variant="outline" className="mb-2">{post.tags[0]}</Badge>}
                        <h2 className="mb-2 text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-accent">
                          {post.title}
                        </h2>
                        <p className="mb-4 leading-relaxed text-muted-foreground line-clamp-2">
                          {post.excerpt || "Click to read more..."}
                        </p>
                      </div>
                      <footer className="mt-auto flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <time dateTime={post.published_at || post.created_at || ""}>
                          {formatDate(post.published_at || post.created_at || new Date())}
                        </time>
                        <span className="flex items-center gap-1.5"><Clock className="size-3" /> {readTime} min read</span>
                        {typeof post.views === "number" && (
                          <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {post.views.toLocaleString()} views</span>
                        )}
                      </footer>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </Layout>
  );
}