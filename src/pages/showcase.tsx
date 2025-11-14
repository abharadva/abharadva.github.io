import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";

const ShowcaseItemCard: React.FC<{ item: PortfolioItem }> = ({ item }) => {
  const isTimelineItem = item.subtitle && /\d{4}/.test(item.subtitle);

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]">
      {item.image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-black bg-neutral-100">
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-3 border-b-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold leading-tight tracking-tight">{item.title}</h3>
            {item.subtitle && (
              <div className={cn("flex items-center text-sm text-neutral-600", isTimelineItem && "text-xs uppercase tracking-wider")}>
                {isTimelineItem && <Calendar className="mr-1.5 size-3.5" />}
                {item.subtitle}
              </div>
            )}
          </div>
          {item.link_url && (
             <div className="rounded-none border-2 border-black bg-white p-2 text-black opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="size-4" />
             </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-6 pb-4">
        {item.description && (
          <div className="prose-sm prose text-neutral-700 line-clamp-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 border-t-2 border-black bg-neutral-50 pt-4">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] uppercase">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {item.link_url && (
          <Link href={item.link_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
            <span className="sr-only">View {item.title}</span>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export const getStaticProps: GetStaticProps<{ sections: PortfolioSection[] }> = async () => {
  const { data, error } = await supabase
    .from("portfolio_sections")
    .select(`*, portfolio_items (*)`)
    .order("display_order", { ascending: true })
    .order("display_order", { foreignTable: "portfolio_items", ascending: true });

  if (error) { console.error("Error fetching all sections:", error.message); }

  return { props: { sections: data || [] }, revalidate: 60 };
};

export default function ShowcasePage({ sections }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { site: siteConfig } = appConfig;

  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <Layout>
      <Head>
        <title>{`Showcase | ${siteConfig.title}`}</title>
        <meta name="description" content="A curated collection of my work, skills, and professional journey." />
      </Head>
      <main className="py-16 md:py-24">
        <motion.header 
           initial="hidden" animate="visible" variants={fadeInUp}
           className="container mx-auto mb-24 max-w-4xl px-4 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">
            Showcase.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-neutral-600 font-normal leading-relaxed">
            A deep dive into my professional journey, featured projects, and technical expertise.
          </p>
        </motion.header>

        <div className="container mx-auto max-w-6xl px-4 space-y-32">
          {sections.map((section, index) => (
            <motion.section 
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-12 flex items-baseline gap-4 border-b-2 border-black pb-4">
                 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border-2 border-black bg-yellow-300 text-lg font-bold text-black">
                    {String(index + 1).padStart(2, '0')}
                 </span>
                <h2 className="text-4xl font-bold tracking-tight">{section.title}</h2>
              </motion.div>

              {section.type === "markdown" && section.content && (
                <motion.div variants={fadeInUp}>
                  <div className="prose max-w-3xl rounded-none border-2 border-black bg-white p-8 shadow-[8px_8px_0_#000] md:p-10">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {section.type === "list_items" && section.portfolio_items && (
                <motion.div 
                  variants={staggerContainer}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {section.portfolio_items.map((item) => (
                    <motion.div key={item.id} variants={fadeInUp} className="h-full">
                      <ShowcaseItemCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.section>
          ))}
        </div>
        
        {sections.length === 0 && (
          <div className="py-20 text-center text-neutral-500">
            No content found. Time to add some in the admin panel!
          </div>
        )}
      </main>
    </Layout>
  );
}
