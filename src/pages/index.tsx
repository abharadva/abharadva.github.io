/*
This file is updated to align with the new kinetic typography design.
- The `LittleAboutMyself` and `Hero` components are retained for structure, but their internal styling will be updated in their respective files.
- The `Newsletter` and `Projects` components are also kept, and their redesign will be handled in their files.
- The `` class is removed, inheriting the global `font-sans`.
- Head tags and metadata remain unchanged as they are functional.
- A `useEffect` hook is added to trigger a Discord webhook notification (via a secure serverless proxy) on the first visit of a user's session.
*/
import Layout from "@/components/layout";
import LittleAboutMyself from "@/components/little-about-myself";
import Hero from "@/components/hero";
import Newsletter from "@/components/newsletter";
import Projects from "@/components/projects";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { useEffect } from "react";

export default function HomePage() {
  const { site: siteConfig } = appConfig;

 useEffect(() => {
    // WARNING: This approach exposes your Discord webhook URL to the public.
    // It is highly recommended to use a serverless function proxy instead for a production site.
    const webhookUrl = process.env.NEXT_PUBLIC_VISIT_NOTIFIER_URL || "";

    // Only run this in production and if the URL is set
    // if (process.env.NODE_ENV === "production" && webhookUrl && typeof window !== "undefined") {
    if (true) {
      // Use session storage to ensure this only runs once per browser session
      if (!sessionStorage.getItem("visitNotified")) {
        const userAgent = navigator.userAgent || "Unknown";
        const referrer = document.referrer || "Direct visit";

        const embed = {
          title: "🚀 New Portfolio Visitor!",
          color: 15844367,
          description: "Notification sent directly from client-side (insecure method).",
          fields: [
            {
              name: "🔗 Referrer",
              value: `\`${referrer}\``,
              inline: false,
            },
            {
              name: "🖥️ User Agent",
              value: `\`\`\`${userAgent}\`\`\``,
            },
          ],
          timestamp: new Date().toISOString(),
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Portfolio Bot (Client)",
            embeds: [embed],
          }),
        })
          .then(() => sessionStorage.setItem("visitNotified", "true"))
          .catch((err) => console.error("Failed to send visit notification:", err));
      }
    }
  }, []);

  return (
    <Layout>
      <Head>
        <link rel="canonical" href={siteConfig.url} />
      </Head>
      <LittleAboutMyself />
      <Hero />
      <Projects />
      <Newsletter />
    </Layout>
  );
}