

import { ArrowUpRight } from "lucide-react";
import { PropsWithChildren } from "react";

interface TechItem {
  name: string;
  href: string;
  desc: string;
}

const TECHNOLOGIES: TechItem[] = [
  { name: "React", href: "https://react.dev/", desc: "My go-to library for crafting dynamic and interactive single-page applications (SPAs)." },
  { href: "https://redux-toolkit.js.org/", name: "Redux Toolkit", desc: "Essential for managing complex application state, ensuring predictability and maintainability." },
  { href: "https://nextjs.org/", name: "Next.js", desc: "Powers this website! Perfect for server-side rendering, static sites, and a great developer experience." },
  { href: "https://www.mysql.com/", name: "MySQL", desc: "A classic, reliable relational database management system. Widely adopted and robust." },
  { href: "https://www.prisma.io/", name: "Prisma", desc: "Modern TypeScript ORM that makes database interactions type-safe, intuitive, and enjoyable." },
  { href: "https://www.python.org/", name: "Python", desc: "A versatile language for backend development, scripting, and data science. Continuously learning!" },
  { href: "https://tailwindcss.com/", name: "Tailwind CSS", desc: "A utility-first CSS framework that accelerates UI development and makes styling enjoyable." },
  { href: "https://supabase.com/", name: "Supabase", desc: "The open-source Firebase alternative. Backend-as-a-Service built on PostgreSQL." },
];

export default function Technology({ children }: PropsWithChildren) {
  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 font-mono text-3xl font-bold text-foreground">
        / Tech Stack
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TECHNOLOGIES.map((tech) => (
          <a
            key={tech.href}
            href={tech.href}
            rel="noopener noreferrer"
            target="_blank"
            className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {tech.name}
              </h3>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tech.desc}
            </p>
          </a>
        ))}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
