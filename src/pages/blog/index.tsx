// src/pages/blog/index.tsx
import Link from "next/link";
import type { BlogPost } from "@/types";
import Head from "next/head";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye, Clock, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetPublishedBlogPostsQuery } from "@/store/api/publicApi";

const calculateReadTime = (content: string = ""): number => {
  const wordsPerMinute = 225;
  const textLength = content.split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(textLength / wordsPerMinute);
  return Math.max(1, time); // Ensure read time is at least 1 minute
};

export default function BlogIndexPage() {
  const { data: posts = [], isLoading, error } = useGetPublishedBlogPostsQuery();
  const { site: siteConfig } = appConfig;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (isLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center p-4"><div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 font-medium text-destructive">Error loading posts.</div></div></Layout>;
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
          className="mb-12 border-b border-border pb-8 text-center"
        >
          <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">
            The Blog
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A collection of articles on web development, design, and technology.
          </p>
        </motion.header>

        {posts.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-2xl font-bold">No Posts Published Yet</h3>
            <p className="mt-2 text-muted-foreground">Check back soon for new articles and insights.</p>
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
                <Link href={`/blog/view?slug=${post.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                  <Card className="overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg md:flex">
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
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {post.title}
                        </h2>
                        <p className="mb-4 leading-relaxed text-muted-foreground line-clamp-2">
                          {post.excerpt || "Click to read more..."}
                        </p>
                      </div>
                      <footer className="mt-auto flex items-center gap-4 text-xs font-medium text-muted-foreground">
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