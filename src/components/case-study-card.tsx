// src/components/case-study-card.tsx

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import type { PortfolioItem } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface FeaturedProjectProps {
  project: PortfolioItem;
  index: number;
}

export default function FeaturedProject({
  project,
  index,
}: FeaturedProjectProps) {
  const isReversed = index % 2 !== 0;

  // Extract GitHub link from markdown if it exists
  const descriptionWithoutGithub =
    project.description
      ?.replace(/\[View Source on GitHub\]\(.*\)/, "")
      .trim() || "";
  const githubMatch = project.description?.match(
    /\[View Source on GitHub\]\((.*?)\)/,
  );
  const githubUrl = githubMatch ? githubMatch[1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-1 items-center gap-8 md:grid-cols-10"
    >
      {/* Image Column */}
      <div
        className={cn(
          "group relative md:col-span-6",
          isReversed ? "md:col-start-5" : "",
        )}
      >
        <a
          href={project.link_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden bg-secondary shadow-lg transition-all duration-300 hover:shadow-primary/20"
        >
          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.title}
              className="aspect-video w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </a>
      </div>

      {/* Text Content Column */}
      <div
        className={cn(
          "relative md:col-span-4",
          isReversed ? "md:col-start-1 md:row-start-1 md:text-right" : "",
        )}
      >
        <p className="font-mono text-sm text-primary">Featured Project</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">
          <a
            href={project.link_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {project.title}
          </a>
        </h3>
        <div className="my-4 rounded-md bg-card p-6 shadow-md">
          <div className="prose prose-sm prose-ul:list-none prose-ul:p-0 dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {descriptionWithoutGithub}
            </ReactMarkdown>
          </div>
        </div>
        {project.tags && project.tags.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2 font-mono text-sm text-muted-foreground",
              isReversed ? "md:justify-end" : "",
            )}
          >
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div
          className={cn(
            "mt-4 flex items-center gap-3",
            isReversed ? "md:justify-end" : "",
          )}
        >
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Github className="size-5" />
            </a>
          )}
          {project.link_url && (
            <a
              href={project.link_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live Site"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="size-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
