// src/pages/projects.tsx
import Layout from "@/components/layout";
import ProjectsComponent from "@/components/projects";
import FeaturedProject from "@/components/case-study-card";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetSectionsByPathQuery } from "@/store/api/publicApi";

export default function ProjectsPage() {
  const { site: siteConfig } = appConfig;
  const content = siteContent.pages.projects;
  const pageTitle = `${content.title} | ${siteConfig.title}`;
  const pageUrl = `${siteConfig.url}/projects/`;

  // Fetch all sections for the '/projects' page path
  const {
    data: sections,
    isLoading,
    error,
  } = useGetSectionsByPathQuery("/projects");

  // Find the specific "Featured Projects" section from the fetched data
  const featuredSection = sections?.find(
    (s) => s.title === "Featured Projects",
  );

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={content.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={content.description} />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
      </Head>

      <main className="py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">
            {content.heading}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A curated showcase of my proudest work and technical deep-dives.
          </p>
        </motion.header>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!!error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto my-16">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Case Studies</AlertTitle>
            <AlertDescription>
              {error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "An unknown error occurred."}
            </AlertDescription>
          </Alert>
        )}

        {featuredSection?.portfolio_items &&
          featuredSection.portfolio_items.length > 0 && (
            <div className="mx-auto max-w-6xl space-y-24">
              {featuredSection.portfolio_items.map((project, index) => (
                <FeaturedProject
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))}
            </div>
          )}

        <div className="my-24">
          <Separator />
        </div>

        <div className="mx-auto max-w-6xl">
          <ProjectsComponent showTitle={true} />
        </div>
      </main>
    </Layout>
  );
}
