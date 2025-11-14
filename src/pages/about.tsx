/*
This file is updated to align with the new kinetic typography design system.
- The page structure is simplified, removing the need for a separate `Me` component.
- An `Avatar` and typographic heading now introduce the page directly.
- The `Hero` component, which contained text, is replaced by a more direct `motion.div` for a clean presentation of the bio.
- The `Technology` and `Tools` sections are retained for content but will be restyled in their respective component files.
*/
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Avatar className="mx-auto h-24 w-24 border-2 border-border">
            <AvatarImage
              src={"https://avatars.githubusercontent.com/u/52954931?v=4"}
              alt="Akshay Bharadva"
            />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <h1 className="mt-6 text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            About Me
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Full-stack developer, open-source enthusiast, and lifelong learner.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="prose prose-lg dark:prose-invert mx-auto mt-12 max-w-3xl"
        >
          <p>
            Hey there! I'm a full-stack developer and life-long learner from India,
            currently living in ON, Canada. I enjoy learning new technologies
            and collaborating with other developers to make products a reality.
          </p>
          <p>
            I also enjoy open-source; despite having a full-time job, I devote
            time to exploring open-source projects and studying their tech stack
            and coding conventions.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Technology />
          <Tools />
        </div>
      </main>
    </Layout>
  );
}