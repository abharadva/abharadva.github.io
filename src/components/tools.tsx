import { ArrowUpRight, Loader2, Terminal } from "lucide-react";
import { PropsWithChildren, useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { PortfolioItem } from "@/types";

type ToolsProps = PropsWithChildren;

export default function Tools({ children }: ToolsProps) {
  const [toolItems, setToolItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_sections')
          .select('portfolio_items(*)')
          .eq('title', 'Tools')
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true });

        if (fetchError) throw new Error(fetchError.message);
        
        if (data && data.length > 0 && data[0].portfolio_items) {
          setToolItems(data[0].portfolio_items as PortfolioItem[]);
        } else {
          setToolItems([]);
        }

      } catch (err: any) {
        setError(err.message || "Could not load tools data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 font-mono text-3xl font-bold text-foreground">
        / Tools
      </h2>
      
      {isLoading && <div className="flex justify-center py-8"><Loader2 className="size-8 animate-spin" /></div>}
      {error && <div className="text-center text-destructive">{error}</div>}

      {!isLoading && !error && toolItems.length === 0 && (
        <div className="py-8 text-center text-muted-foreground rounded-lg bg-secondary/30 border border-dashed">
          <Terminal className="mx-auto size-8 mb-2" />
          <p>My favorite development tools and software will be listed here.</p>
        </div>
      )}

      {!isLoading && !error && toolItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {toolItems.map((tool) => (
            <a
              key={tool.id}
              href={tool.link_url || "#"}
              rel="noopener noreferrer"
              target="_blank"
              className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {tool.title}
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </a>
          ))}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}