import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import DynamicPageContent from "@/components/DynamicPageContent";
import { motion } from "framer-motion";

export default function ShowcasePage() {
  const { site: siteConfig } = appConfig;
  const content = siteContent.pages.showcase;

  return (
    <Layout>
      <Head>
        <title>{`${content.title} | ${siteConfig.title}`}</title>
        <meta name="description" content={content.description} />
        <link rel="canonical" href={`${siteConfig.url}/showcase/`} />
      </Head>

      <main className="py-16 md:py-24">
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
            {content.subheading}
          </p>
        </motion.header>
        <DynamicPageContent pagePath="/showcase" />
      </main>
    </Layout>
  );
}