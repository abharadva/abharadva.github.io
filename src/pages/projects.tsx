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

  const hasFeaturedProjects =
    featuredSection?.portfolio_items &&
    featuredSection.portfolio_items.length > 0;

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
        {/* Only show the main page header if we HAVE featured projects.
            Otherwise, the GitHub projects component will show its own header below. */}
        {hasFeaturedProjects && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">
              Featured Work
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              A curated showcase of my proudest work and technical deep-dives.
            </p>
          </motion.header>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!!error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto my-16">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Projects</AlertTitle>
            <AlertDescription>
              {error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "An unknown error occurred."}
            </AlertDescription>
          </Alert>
        )}

        {hasFeaturedProjects && (
          <div className="mx-auto max-w-6xl space-y-24">
            {featuredSection.portfolio_items!.map((project, index) => (
              <FeaturedProject
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}

        {hasFeaturedProjects && (
          <div className="my-24">
            <Separator />
          </div>
        )}

        <div className="mx-auto max-w-6xl">
          {/* Always show title for GitHub projects if it's the only section, 
              or if it follows featured projects. 
              The internal component handles "My Projects" title. */}
          <ProjectsComponent showTitle={true} />
        </div>
      </main>
    </Layout>
  );
}