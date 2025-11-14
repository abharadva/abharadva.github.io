
/*
This file is updated to align with the new neo-brutalist design.
- The page structure is updated to use the bold, blocky `Me` component for the introduction.
- The `Hero` component presents the main bio text in a container with a hard shadow and thick border.
- `Technology` and `Tools` components are retained for content, with their styling updated in their respective files to match the new aesthetic.
*/
import Layout from "@/components/layout";
import Me from "@/components/me";
import Hero from "@/components/hero";
import Technology from "@/components/technology";
import Tools from "@/components/tools";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `About Me | ${siteConfig.title}`;
  const pageDescription = `Learn more about Akshay Bharadva, a full-stack developer, his skills, and the tools he uses.`;
  const pageUrl = `${siteConfig.url}/about/`;

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
      </Head>

      <main className="py-12 md:py-16">
        <Me>
            <h1 className="mt-6 text-4xl font-bold tracking-tighter text-black sm:text-5xl text-center">
                About Me
            </h1>
        </Me>
        
        <Hero />

        <div className="mx-auto mt-16 max-w-5xl">
          <Technology />
          <Tools />
        </div>
      </main>
    </Layout>
  );
}