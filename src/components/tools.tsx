import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type ToolsProps = PropsWithChildren;

interface ToolItem {
name: string;
href: string;
desc: string;
}

const USED_TOOLS: ToolItem[] = [
{
name: "Visual Studio Code",
href: "https://code.visualstudio.com/",
desc: "My all-time favorite text editor with superpowers. Indispensable for daily coding tasks.",
},
{
name: "Figma",
href: "https://www.figma.com/",
desc: "For turning UI/UX designs into real, functional products. Excellent for collaboration.",
},
{
name: "GitHub",
href: "https://github.com/",
desc: "Essential for version control, remote backups, and collaborating with other developers.",
},
{
name: "Slack",
href: "https://slack.com/",
desc: "Communication is key. Also, many Open-Source communities use it for interaction.",
},
{
name: "Discord",
href: "https://discord.com/",
desc: "Initially joined for gaming, but later discovered many awesome developer communities.",
},
{
name: "Postman",
href: "https://www.postman.com/",
desc: "The go-to tool for API testing and development. Simplifies debugging endpoints significantly.",
},
];

export default function Tools({ children }: ToolsProps) {
return (
<section className="my-12 ">
<h2 className="mb-6 border-b-4 border-black pb-2 text-3xl font-black text-black">
Tools I Use
</h2>
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
{USED_TOOLS.map((tool) => (
<div
key={tool.href}
className="flex flex-col rounded-none border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] transition-shadow duration-150 hover:shadow-[6px_6px_0px_#4f46e5]"
>
<a
href={tool.href}
rel="noopener noreferrer"
target="_blank"
className="group mb-1 inline-flex items-center self-start text-xl font-bold text-indigo-700 transition-colors hover:bg-yellow-200 hover:text-indigo-900 hover:underline"
>
<span>{tool.name}</span>
<BsArrowUpRight className="ml-1.5 inline-block size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
</a>
<p className="grow text-sm leading-relaxed text-gray-700">
{tool.desc}
</p>
</div>
))}
</div>
{children && <div className="mt-6">{children}</div>}
<p className="mt-8 text-center font-semibold text-black">
...plus a healthy dose of coffee and curiosity!
</p>
</section>
);
}