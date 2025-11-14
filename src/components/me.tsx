
import Image from "next/image";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type MeProps = PropsWithChildren;

export default function Me({ children }: MeProps) {
return (
<motion.section 
  className="py-8"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
<div className="mb-10 flex size-full flex-col items-center justify-center gap-5">
<div className="flex flex-col items-center gap-4 rounded-none border-2 border-black bg-white p-4 shadow-[8px_8px_0_#000] sm:flex-row sm:gap-6">
<Image
src={"https://avatars.githubusercontent.com/u/52954931?v=4"}
alt="Akshay Bharadva avatar"
width={128}
height={128}
className="size-32 rounded-none border-2 border-black object-cover"
priority
/>
<h2 className="font-tahu mb-0 text-5xl text-black sm:text-6xl -rotate-6 text-center sm:text-left">
Akshay
<br />
Bharadva
</h2>
</div>
{children && <div className="mt-4 text-center">{children}</div>}
</div>
</motion.section>
);
}