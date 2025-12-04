import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  onLinkClick?: () => void; // ADD THIS PROP
}

export function TableOfContents({
  content,
  onLinkClick,
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));

    const extractedHeadings = matches.map((match) => {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      return { id, text, level };
    });

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    elements.forEach((el) => el && observer.observe(el));

    return () => {
      elements.forEach((el) => el && observer.unobserve(el));
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2 text-sm">
      <div className="flex items-center gap-2 mb-4 text-primary font-mono text-xs uppercase tracking-widest font-bold">
        <List className="h-4 w-4" />
        Table of Contents
      </div>
      <div className="relative pl-3">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

        <ul className="space-y-3">
          {headings.map((heading) => (
            <li key={heading.id} className="relative">
              {activeId === heading.id && (
                <div className="absolute -left-[13px] top-1.5 h-4 w-0.5 bg-primary rounded-full transition-all duration-300" />
              )}

              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    const y =
                      element.getBoundingClientRect().top +
                      window.pageYOffset -
                      100;
                    window.scrollTo({ top: y, behavior: "smooth" });
                    setActiveId(heading.id);
                  }
                  onLinkClick?.(); // <-- CALL THE CALLBACK HERE
                }}
                className={cn(
                  "block transition-colors duration-200 line-clamp-2 leading-snug hover:text-primary",
                  heading.level === 3 && "ml-4 text-xs",
                  activeId === heading.id
                    ? "text-primary font-medium translate-x-1"
                    : "text-muted-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
