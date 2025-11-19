// src/pages/index.tsx

import Layout from "@/components/layout";
import Hero from "@/components/hero";
import SectionRenderer from "@/components/SectionRenderer";
import { supabase } from "@/supabase/client";
import { PortfolioSection } from "@/types";
import { useEffect, useState } from "react";
import { config as appConfig } from "@/lib/config";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import Cta from "@/components/cta";

export default function HomePage() {
  const { site: siteConfig } = appConfig;
  const [homeSections, setHomeSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const webhookUrl = process.env.NEXT_PUBLIC_VISIT_NOTIFIER_URL || "";
    if (process.env.NODE_ENV === "production" && webhookUrl) {
      if (!sessionStorage.getItem("visitNotified")) {
        const userAgent = navigator.userAgent || "Unknown";
        const referrer = document.referrer || "Direct visit";
        const embed = {
          title: "🚀 New Portfolio Visitor!",
          color: 3447003,
          description: "Someone just landed on the portfolio.",
          fields: [
            { name: "🔗 Referrer", value: `\`${referrer}\``, inline: false },
            { name: "🖥️ User Agent", value: `\`\`\`${userAgent}\`\`\`` },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Visit Notification" }
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Portfolio Bot",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [embed],
          }),
        })
          .then(() => sessionStorage.setItem("visitNotified", "true"))
          .catch((err) => console.error("Failed to send visit notification:", err));
      }
    }

  }, []);

  useEffect(() => {
    const fetchHomeSections = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*, portfolio_items(*)')
        .eq('display_location', 'home')
        .order('display_order', { ascending: true })
        .order('display_order', { foreignTable: 'portfolio_items', ascending: true });

      if (error) {
        console.error("Error fetching home page sections:", error);
      } else {
        setHomeSections(data || []);
      }
      setIsLoading(false);
    };

    fetchHomeSections();
  }, []);

  return (
    <Layout>
      <Head>
        <link rel="canonical" href={siteConfig.url} />
      </Head>
      <div className="py-12 md:py-20">
        <Hero />

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && homeSections.map(section => (
          <SectionRenderer key={section.id} section={section} />
        ))}

        <Cta />
      </div>
    </Layout>
  );
}