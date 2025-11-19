import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { ArrowUpRight, Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/supabase/client";
import { PortfolioItem } from "@/types";
import { siteContent } from "@/lib/site-content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ExperienceProps = PropsWithChildren<{
  showTitle?: boolean;
}>;

export default function Experience({ children, showTitle = true }: ExperienceProps) {
  const [experienceItems, setExperienceItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_sections')
          .select('portfolio_items(*)')
          .eq('title', 'Experience')
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true });

        if (fetchError) throw new Error(fetchError.message);
        
        if (data && data.length > 0 && data[0].portfolio_items) {
          setExperienceItems(data[0].portfolio_items as PortfolioItem[]);
        } else {
          setExperienceItems([]);
        }

      } catch (err: any) {
        setError(err.message || "Could not load experience data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperience();
  }, []);

  return (
    <section className="my-16 py-16">
      {showTitle && (
        <motion.div
          className="relative mb-24 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-black text-foreground md:text-5xl">
            {siteContent.experience.mainTitle}
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-24 bg-gradient-to-r from-primary to-fuchsia-500" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[6rem] font-black text-foreground/5 -z-1 select-none" aria-hidden="true">
            {siteContent.experience.mainSubtitle}
          </span>
        </motion.div>
      )}

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="size-8 animate-spin" /></div>}
      {error && <div className="text-center text-destructive">{error}</div>}

      {!isLoading && !error && experienceItems.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
            <Briefcase className="size-8" />
          </div>
          <p className="mt-4">A detailed timeline of my professional journey will appear here soon.</p>
        </div>
      )}

      {!isLoading && !error && experienceItems.length > 0 && (
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />
          <div className="space-y-12">
            {experienceItems.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="group relative flex items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-border transition-all duration-300 group-hover:bg-primary group-hover:scale-125" />
                <div className={`w-[calc(50%-2rem)] ${index % 2 === 0 ? 'mr-auto text-right' : 'ml-auto text-left'}`}>
                  <div className="rounded-lg bg-blueprint-bg p-6 shadow-lg transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/10 group-hover:-translate-y-1">
                    <p className="font-mono text-sm font-semibold text-muted-foreground">{exp.date_from} - {exp.date_to}</p>
                    <h3 className="text-xl font-bold text-foreground">{exp.subtitle}</h3>
                    {exp.link_url ? (
                        <Link href={exp.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-md font-medium text-primary transition-opacity hover:opacity-80">
                            {exp.title} <ArrowUpRight className="size-3" />
                        </Link>
                    ) : (
                      <span className="text-md font-medium text-foreground">{exp.title}</span>
                    )}
                    {exp.description && (
                      <div className={`prose prose-sm dark:prose-invert mt-3 max-w-none text-muted-foreground prose-ul:list-none prose-li:mb-2 ${index % 2 === 0 ? 'text-right prose-ul:text-right prose-li:text-right' : 'text-left'}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {exp.description}
                        </ReactMarkdown>
                      </div>
                    )}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className={`mt-4 flex flex-wrap gap-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        {exp.tags.map(tech => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {children && <div className="mt-16">{children}</div>}
    </section>
  );
}