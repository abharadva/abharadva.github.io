// src/pages/about.tsx
import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DynamicPageContent from "@/components/DynamicPageContent";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

export default function AboutPage() {
  const { site: siteConfig } = appConfig;
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  const pageTitle = `About Me | ${content?.profile_data.name || siteConfig.title}`;
  const pageUrl = `${siteConfig.url}/about/`;
  const pageDescription =
    content?.profile_data.bio.join(" ") ||
    "Learn more about the developer behind the code.";

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
      </Head>
      <main className="py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="mb-4 border-b pb-4 text-center font-mono text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            [ ABOUT_ME ]
          </h1>
          <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            {isLoading || !content ? (
              <>
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-4 flex-1">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-11/12" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </>
            ) : (
              <>
                {content.profile_data.show_profile_picture && (
                  <Avatar className="h-24 w-24 border-2 sm:h-32 sm:w-32">
                    <AvatarImage
                      src={content.profile_data.profile_picture_url}
                      alt={content.profile_data.name}
                    />
                    <AvatarFallback>
                      {content.profile_data.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="prose prose-lg dark:prose-invert max-w-none text-center sm:text-left">
                  {content.profile_data.bio.map((paragraph, index) => (
                    <ReactMarkdown key={index}>{paragraph}</ReactMarkdown>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <div className="mx-auto mt-12 max-w-5xl">
          <DynamicPageContent pagePath="/about" />
        </div>
      </main>
    </Layout>
  );
}
