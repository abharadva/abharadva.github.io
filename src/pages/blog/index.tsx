
/*
This file is redesigned for the neo-brutalist theme.
- The page header is made bolder and more direct.
- Post cards now use the brutalist `Card` component, featuring hard shadows, thick borders, and a stark layout.
- All subtle design elements (hover effects, soft shadows, rounded corners) are replaced with high-contrast, sharp-edged equivalents.
- The `font-mono` is applied to give a more raw, technical feel.
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-500" /></div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center p-4"><div className="rounded-none border-2 border-destructive bg-red-100 p-6 font-bold text-destructive">Error loading posts: {error}</div></div></Layout>;
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
          className="mb-12 border-b-2 border-black pb-8 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tighter text-black md:text-6xl">
            The Blog
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            A collection of articles on web development, design, and technology.
          </p>
        </motion.header>

        {posts.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <h3 className="text-2xl font-bold">No Posts Yet</h3>
            <p className="text-neutral-500">Check back soon for new articles.</p>
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
                <Link href={`/blog/${post.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-[8px_8px_0_#000] md:flex">
                    {post.cover_image_url && (
                      <div className="md:w-1/3 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black">
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
                         {post.tags && post.tags[0] && <Badge className="mb-2">{post.tags[0]}</Badge>}
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-black transition-colors group-hover:text-blue-600">
                          {post.title}
                        </h2>
                        <p className="mb-4 leading-relaxed text-neutral-600 line-clamp-2">
                          {post.excerpt || "Click to read more..."}
                        </p>
                      </div>
                      <footer className="mt-auto flex items-center gap-4 text-xs font-bold text-neutral-500">
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