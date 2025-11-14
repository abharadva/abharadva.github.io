
import Layout from "@/components/layout";
import ProjectsComponent from "@/components/projects";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";

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
      <ProjectsComponent />
    </Layout>
  );
}
