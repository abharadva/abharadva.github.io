import { PropsWithChildren } from "react";
import { ArrowUpRight } from "lucide-react";

type ToolsProps = PropsWithChildren;

interface ToolItem {
  name: string;
  href: string;
  desc: string;
}

const USED_TOOLS: ToolItem[] = [
  { name: "Visual Studio Code", href: "https://code.visualstudio.com/", desc: "My all-time favorite text editor with superpowers. Indispensable for daily coding tasks." },
  { name: "Figma", href: "https://www.figma.com/", desc: "For turning UI/UX designs into real, functional products. Excellent for collaboration." },
  { name: "GitHub", href: "https://github.com/", desc: "Essential for version control, remote backups, and collaborating with other developers." },
  { name: "Slack", href: "https://slack.com/", desc: "Communication is key. Also, many Open-Source communities use it for interaction." },
  { name: "Discord", href: "https://discord.com/", desc: "Initially joined for gaming, but later discovered many awesome developer communities." },
  { name: "Postman", href: "https://www.postman.com/", desc: "The go-to tool for API testing and development. Simplifies debugging endpoints significantly." },
];

export default function Tools({ children }: ToolsProps) {
  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 border-b-2 pb-3 text-3xl font-black text-foreground">
        Tools I Use
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {USED_TOOLS.map((tool) => (
           <div
            key={tool.href}
            className="group flex flex-col rounded-lg border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
          >
            <a
              href={tool.href}
              rel="noopener noreferrer"
              target="_blank"
              className="mb-1 inline-flex items-center self-start text-xl font-bold text-foreground transition-colors group-hover:text-primary"
            >
              <span>{tool.name}</span>
              <ArrowUpRight className="ml-1.5 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="grow text-sm leading-relaxed text-muted-foreground">
              {tool.desc}
            </p>
          </div>
        ))}
      </div>
      {children && <div className="mt-6">{children}</div>}
       <p className="mt-8 text-center font-medium text-muted-foreground">
        ...plus a healthy dose of coffee and curiosity!
      </p>
    </section>
  );
}