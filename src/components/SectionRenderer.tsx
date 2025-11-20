import React from "react";
import { PortfolioSection, PortfolioItem } from "@/types";
import Projects from "@/components/projects";
import FeaturedProject from "@/components/case-study-card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";

const TimelineLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="relative mx-auto max-w-5xl px-4">
    <div
      className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent"
      aria-hidden="true"
    />
    <div className="space-y-12">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="group relative flex items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-border transition-all duration-300 group-hover:bg-primary group-hover:scale-125" />
          <div
            className={`w-[calc(50%-2rem)] ${index % 2 === 0 ? "mr-auto text-right" : "ml-auto text-left"}`}
          >
            <div className="rounded-lg bg-blueprint-bg p-6 shadow-lg transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/10 group-hover:-translate-y-1">
              <p className="font-mono text-sm font-semibold text-muted-foreground">
                {item.date_from} - {item.date_to}
              </p>
              <h3 className="text-xl font-bold text-foreground">
                {item.subtitle}
              </h3>
              {item.link_url ? (
                <Link
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-md font-medium text-primary transition-opacity hover:opacity-80"
                >
                  {item.title} <ArrowUpRight className="size-3" />
                </Link>
              ) : (
                <span className="text-md font-medium text-foreground">
                  {item.title}
                </span>
              )}
              {item.description && (
                <div
                  className={`prose prose-sm dark:prose-invert mt-3 max-w-none text-muted-foreground prose-ul:list-none prose-li:mb-2 ${index % 2 === 0 ? "text-right prose-ul:text-right prose-li:text-right" : "text-left"}`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.description}
                  </ReactMarkdown>
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div
                  className={`mt-4 flex flex-wrap gap-2 ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  {item.tags.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const Grid2ColLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {items.map((item) => (
      <a
        key={item.id}
        href={item.link_url || "#"}
        rel="noopener noreferrer"
        target="_blank"
        className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </a>
    ))}
  </div>
);

const FeatureAlternatingLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="mx-auto max-w-6xl space-y-24">
    {items.map((item, index) => (
      <FeaturedProject key={item.id} project={item} index={index} />
    ))}
  </div>
);

const DefaultListLayout = ({ items }: { items: PortfolioItem[] }) => (
  <div className="mx-auto max-w-3xl space-y-3">
    {items.map((item) => {
      const content = (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            )}
          </div>
          {item.date_to && (
            <p className="flex-shrink-0 font-mono text-sm text-muted-foreground">
              {item.date_to}
            </p>
          )}
        </div>
      );

      if (item.link_url) {
        return (
          <a
            key={item.id}
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg bg-card p-4 transition-colors hover:bg-secondary"
          >
            {content}
          </a>
        );
      }

      return (
        <div key={item.id} className="rounded-lg bg-card p-4">
          {content}
        </div>
      );
    })}
  </div>
);

// --- MAIN RENDERER COMPONENT ---

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
            <div className="prose dark:prose-invert max-w-3xl mx-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          );
        }
        return (
          <div className="text-center text-muted-foreground py-8">
            <p>
              Unsupported layout style "{layout_style}" for content type "{type}
              ".
            </p>
          </div>
        );
    }
  };

  return (
    <motion.section
      className="my-16 py-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-12 text-center">
        <h2 className="text-4xl font-black text-foreground md:text-5xl">
          {title}
        </h2>
        <div className="mx-auto mt-4 h-1.5 w-24 bg-gradient-to-r from-primary to-fuchsia-500" />
      </div>
      {renderContent()}
    </motion.section>
  );
}
