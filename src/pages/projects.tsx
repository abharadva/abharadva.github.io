

import Layout from "@/components/layout";
import ProjectsComponent from "@/components/projects";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { motion } from "framer-motion";

export default function ProjectsPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `My Projects | ${siteConfig.title}`;
  const pageDescription = `A collection of projects developed by Akshay Bharadva, showcasing skills in various technologies.`;
  const pageUrl = `${siteConfig.url}/projects/`;

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
      </Head>

      <main className="py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b border-border pb-8 text-center"
        >
          <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">
            Projects
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A selection of my open-source work from GitHub.
          </p>
        </motion.header>
        <ProjectsComponent showTitle={false} />
      </main>
    </Layout>
  );
}
