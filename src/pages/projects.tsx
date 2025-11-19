// src/pages/projects.tsx
import Layout from "@/components/layout";
import ProjectsComponent from "@/components/projects";
import FeaturedProject from "@/components/case-study-card"; // Updated import name
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import type { PortfolioSection } from "@/types";
import { Loader2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectsPage() {
  const { site: siteConfig } = appConfig;
  const content = siteContent.pages.projects;
  const pageTitle = `${content.title} | ${siteConfig.title}`;
  const pageUrl = `${siteConfig.url}/projects/`;

  const [featuredSection, setFeaturedSection] = useState<PortfolioSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_sections')
          .select('*, portfolio_items(*)')
          .eq('title', 'Featured Projects')
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        setFeaturedSection(data);
      } catch (err: any) {
        setError(err.message || "Could not load featured projects.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

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
        
        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto my-16">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Case Studies</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {featuredSection?.portfolio_items && featuredSection.portfolio_items.length > 0 && (
          <div className="mx-auto max-w-6xl space-y-24">
            {featuredSection.portfolio_items.map((project, index) => (
              <FeaturedProject key={project.id} project={project} index={index} />
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