import React from "react";
import { PortfolioSection, PortfolioItem } from "@/types";
import Projects from "@/components/projects";
import FeaturedProject from "@/components/case-study-card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";

// 1. TIMELINE LAYOUT (Similar to Experience but generic)
const TimelineLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="relative border-l border-border ml-3 md:ml-6 space-y-12">
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        className="relative pl-8 md:pl-12"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-primary ring-4 ring-background" />

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
          {(item.date_from || item.date_to) && (
            <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded flex items-center gap-2">
              <Calendar className="size-3" />
              {item.date_from} {item.date_to && `— ${item.date_to}`}
            </span>
          )}
        </div>

        {item.subtitle && (
          <p className="text-lg font-medium text-primary mb-4">
            {item.subtitle}
          </p>
        )}

        {item.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.description}
            </ReactMarkdown>
          </div>
        )}

        {item.link_url && (
          <Link
            href={item.link_url}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors mt-2"
          >
            View Details <ArrowUpRight className="size-4" />
          </Link>
        )}
      </motion.div>
    ))}
  </div>
);

// 2. GRID LAYOUT
const Grid2ColLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {items.map((item) => (
      <a
        key={item.id}
        href={item.link_url || "#"}
        rel="noopener noreferrer"
        target="_blank"
        className="group flex flex-col h-full rounded-lg border border-border bg-card/50 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-mono text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground flex-grow">
          {item.description}
        </p>
        {item.tags && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border/50">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </a>
    ))}
  </div>
);

// 3. FEATURED LAYOUT
const FeatureAlternatingLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="space-y-32">
    {items.map((item, index) => (
      <FeaturedProject key={item.id} project={item} index={index} />
    ))}
  </div>
);

// 4. DEFAULT LIST
const DefaultListLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="space-y-4">
    {items.map((item) => (
      <div
        key={item.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/60 transition-colors"
      >
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            {item.title}
            {item.link_url && (
              <ArrowUpRight className="size-4 text-muted-foreground" />
            )}
          </h3>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          )}
        </div>
        {item.date_to && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground border border-border rounded px-2 py-1">
            {item.date_to}
          </span>
        )}
        {item.link_url && (
          <a
            href={item.link_url}
            target="_blank"
            className="absolute inset-0 z-10"
          >
            <span className="sr-only">View</span>
          </a>
        )}
      </div>
    ))}
  </div>
);

// --- MAIN RENDERER ---

interface SectionRendererProps {
  section: PortfolioSection;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const { title, layout_style, type, content, portfolio_items } = section;
  const items = portfolio_items || [];

  const renderContent = () => {
    switch (layout_style) {
      case "timeline":
        return <TimelineLayout items={items} />;
      case "grid-2-col":
        return <Grid2ColLayout items={items} />;
      case "feature-alternating":
        return <FeatureAlternatingLayout items={items} />;
      case "github-grid":
        return <Projects showTitle={false} />;
      case "default":
      default:
        if (type === "list_items") {
          return <DefaultListLayout items={items} />;
        }
        if (type === "markdown" && content) {
          return (
            <div
              className="prose prose-lg dark:prose-invert max-w-3xl mx-auto
              prose-headings:font-mono prose-headings:tracking-tight
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline
              prose-blockquote:border-l-primary prose-blockquote:bg-secondary/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <motion.section
      className="py-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-12 flex items-center gap-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-mono">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>

      {renderContent()}
    </motion.section>
  );
}
