import Image from "next/image";
import { PropsWithChildren } from "react";

type MeProps = PropsWithChildren;

export default function Me({ children }: MeProps) {
return (
<section className="py-8 ">
<div className="mb-10 flex size-full flex-col items-center justify-center gap-5">
<div className="flex flex-col items-center gap-4 rounded-none border-2 border-black bg-white p-4 shadow-[6px_6px_0px_#000] sm:flex-row sm:gap-6">
<Image
src={"https://avatars.githubusercontent.com/u/52954931?v=4"}
alt="Akshay Bharadva avatar"
width={128}
height={128}
className="size-32 rounded-none border-2 border-black object-cover"
priority
/>
<h2 className="text-4xl sm:text-5xl text-black font-tahu mb-0 -rotate-6 line-clamp-5 text-center sm:text-left font-medium">
Akshay
<br />
Bharadva
</h2>
</div>
{children && <div className="mt-4 text-center">{children}</div>}
</div>
</section>
);
}