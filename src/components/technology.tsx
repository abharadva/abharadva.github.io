// src/components/technology.tsx
import { ArrowUpRight, Loader2, Cpu } from "lucide-react";
import { PropsWithChildren } from "react";
import { useGetSectionsByPathQuery } from "@/store/api/publicApi";
import type { PortfolioItem } from "@/types";

type ToolsProps = PropsWithChildren;

export default function Technology({ children }: ToolsProps) {
  const { data: sections, isLoading, error } = useGetSectionsByPathQuery("/");
  const techSection = sections?.find((s) => s.title === "Tech Stack");
  const techItems: PortfolioItem[] =
    (techSection?.portfolio_items as PortfolioItem[]) || [];

  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 font-mono text-3xl font-bold text-foreground">
        / Tech Stack
      </h2>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}
      {!!error && (
        <div className="text-center text-destructive">
          Could not load tech stack.
        </div>
      )}

      {!isLoading && !error && techItems.length === 0 && (
        <div className="py-8 text-center text-muted-foreground rounded-lg bg-secondary/30 border border-dashed">
          <Cpu className="mx-auto size-8 mb-2" />
          <p>
            A list of technologies I frequently work with will be displayed
            here.
          </p>
        </div>
      )}

      {!isLoading && !error && techItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {techItems.map((tech) => (
            <a
              key={tech.id}
              href={tech.link_url || "#"}
              rel="noopener noreferrer"
              target="_blank"
              className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {tech.title}
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tech.description}
              </p>
            </a>
          ))}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
