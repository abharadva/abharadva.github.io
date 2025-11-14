

import Layout from "@/components/layout";
import Technology from "@/components/technology";
import Tools from "@/components/tools";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `About Me | ${siteConfig.title}`;
  const pageDescription = "Learn more about Akshay Bharadva, the developer behind the code.";
  const pageUrl = `${siteConfig.url}/about/`;

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
             <Avatar className="h-24 w-24 border-2 sm:h-32 sm:w-32">
                <AvatarImage src={"https://avatars.githubusercontent.com/u/52954931?v=4"} alt="Akshay Bharadva" />
                <AvatarFallback>AB</AvatarFallback>
             </Avatar>
             <div className="prose prose-lg dark:prose-invert max-w-none text-center sm:text-left">
                <p>
                  I'm a full-stack developer specializing in building robust and scalable web applications. My passion lies at the intersection of clean architecture, efficient code, and intuitive user experiences.
                </p>
                <p>
                  I thrive on solving complex problems and am constantly exploring new technologies to enhance my toolkit. I am a strong advocate for open-source and contribute to projects whenever I can.
                </p>
             </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-24 max-w-5xl">
          <Technology />
          <Tools />
        </div>
      </main>
    </Layout>
  );
}
