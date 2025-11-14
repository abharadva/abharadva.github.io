import { PropsWithChildren } from "react";

type HeroProps = PropsWithChildren;

export default function Hero({ children }: HeroProps) {
return (
<section className="my-8 rounded-none border-2 border-black bg-yellow-100 p-6 py-8  shadow-[6px_6px_0px_#000]">
<div className="flex flex-col gap-4">
<p className="text-base leading-relaxed text-gray-800">
Heya! I'm a full-stack developer and life-long learner from
India, currently living in ON, Canada. I enjoy learning new
technologies and collaborating with other developers to make products
a reality. I also enjoy open-source; despite having a full-time job, I
devote time to exploring open-source projects and studying their tech
stack and coding conventions.
</p>
<p className="text-base leading-relaxed text-gray-800">
Fun but sad fact: I often misspell the return keyword (e.g.,{" "}
<span className="rounded-none border border-black bg-yellow-200 px-1 py-0.5 font-bold text-indigo-700">
“reutrn”
</span>
). Let me know if you have any tricks to avoid this mistake! (P.S.
Thanks to linters for preventing me from breaking deployment pipelines
😅)
</p>
{children && <div className="mt-4">{children}</div>}
</div>
</section>
);
}