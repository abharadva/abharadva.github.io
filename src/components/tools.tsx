
import { ArrowUpRight } from "lucide-react";
import { PropsWithChildren } from "react";

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
            <h2 className="mb-8 font-mono text-3xl font-bold text-foreground">
                / Tools
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {USED_TOOLS.map((tool) => (
                    <a
                        key={tool.href}
                        href={tool.href}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-mono text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                                {tool.name}
                            </h3>
                            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {tool.desc}
                        </p>
                    </a>
                ))}
            </div>
            {children && <div className="mt-6">{children}</div>}
        </section>
    );
}
