import { PropsWithChildren } from "react";
import { ArrowUpRight } from "lucide-react";

type TechnologyProps = PropsWithChildren;

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

export default function Technology({ children }: TechnologyProps) {
  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 border-b-2 pb-3 text-3xl font-black text-foreground">
        Tech Stack
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TECHNOLOGIES.map((tech) => (
          <div
            key={tech.href}
            className="group flex flex-col rounded-lg border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <a
              href={tech.href}
              rel="noopener noreferrer"
              target="_blank"
              className="mb-1 inline-flex items-center self-start text-xl font-bold text-foreground transition-colors group-hover:text-primary"
            >
              <span>{tech.name}</span>
              <ArrowUpRight className="ml-1.5 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="grow text-sm leading-relaxed text-muted-foreground">
              {tech.desc}
            </p>
          </div>
        ))}
      </div>
      {children && <div className="mt-6">{children}</div>}
      <p className="mt-8 text-center font-medium text-muted-foreground">
        ...and always eager to learn more to get the job done right!
      </p>
    </section>
  );
}