import ExperienceComponent from "@/components/experience";
import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";

export default function ExperiencePage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `My Experience | ${siteConfig.title}`;
  const pageDescription = `Detailed work experience of Akshay Bharadva, showcasing roles, responsibilities, and technologies used.`;
  const pageUrl = `${siteConfig.url}/experience/`;

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
      <ExperienceComponent />
    </Layout>
  );
}