import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type TechnologyProps = PropsWithChildren;

interface TechItem {
name: string;
href: string;
desc: string;
}

const TECHNOLOGIES: TechItem[] = [
{
name: "React",
href: "https://react.dev/",
desc: "My go-to library for crafting dynamic and interactive single-page applications (SPAs).",
},
{
href: "https://redux-toolkit.js.org/",
name: "Redux Toolkit",
desc: "Essential for managing complex application state, ensuring predictability and maintainability.",
},
{
href: "https://nextjs.org/",
name: "Next.js",
desc: "Powers this website! Perfect for server-side rendering, static sites, and a great developer experience.",
},
{
href: "https://www.mysql.com/",
name: "MySQL",
desc: "A classic, reliable relational database management system. Widely adopted and robust.",
},
{
href: "https://www.prisma.io/",
name: "Prisma",
desc: "Modern TypeScript ORM that makes database interactions type-safe, intuitive, and enjoyable.",
},
{
href: "https://www.python.org/",
name: "Python",
desc: "A versatile language for backend development, scripting, and data science. Continuously learning!",
},
{
href: "https://tailwindcss.com/",
name: "Tailwind CSS",
desc: "A utility-first CSS framework that accelerates UI development and makes styling enjoyable.",
},
{
href: "https://supabase.com/",
name: "Supabase",
desc: "The open-source Firebase alternative. Backend-as-a-Service built on PostgreSQL.",
},
];

export default function Technology({ children }: TechnologyProps) {
return (
<section className="my-12 ">
<h2 className="mb-6 border-b-4 border-black pb-2 text-3xl font-black text-black">
Tech Stack
</h2>
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
{TECHNOLOGIES.map((tech) => (
<div
key={tech.href}
className="flex flex-col rounded-none border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] transition-shadow duration-150 hover:shadow-[6px_6px_0px_#4f46e5]"
>
<a
href={tech.href}
rel="noopener noreferrer"
target="_blank"
className="group mb-1 inline-flex items-center self-start text-xl font-bold text-indigo-700 transition-colors hover:bg-yellow-200 hover:text-indigo-900 hover:underline"
>
<span>{tech.name}</span>
<BsArrowUpRight className="ml-1.5 inline-block size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
</a>
<p className="grow text-sm leading-relaxed text-gray-700">
{tech.desc}
</p>
</div>
))}
</div>
{children && <div className="mt-6">{children}</div>}
<p className="mt-8 text-center font-semibold text-black">
...and always eager to learn more to get the job done right!
</p>
</section>
);
}