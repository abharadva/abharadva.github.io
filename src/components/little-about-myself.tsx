import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BsGithub, BsLinkedin } from "react-icons/bs";

type LittleAboutMyselfProps = PropsWithChildren;

export default function LittleAboutMyself({
children,
}: LittleAboutMyselfProps) {
return (
<section className="py-16 ">
<div className="flex size-full flex-col items-center justify-center gap-8 text-center">
<div className="flex flex-col gap-1 text-5xl sm:text-6xl md:text-7xl">
<p className="text-4xl text-gray-700 sm:text-5xl">Heya, I'm</p>
<h1 className="font-black text-black">
Akshay Bharadva
</h1>
<p className="mt-1 text-3xl font-bold text-indigo-700 sm:text-4xl md:text-5xl">
Fullstack Developer.
</p>
</div>

<div className="flex gap-3 sm:gap-4">
      <Link
        className="rounded-none border-2 border-black bg-white p-3 text-2xl text-black shadow-[3px_3px_0px_#000] transition-all duration-150 hover:bg-yellow-300 hover:shadow-[3px_3px_0px_#4f46e5] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_#4f46e5] sm:text-3xl"
        href="https://github.com/akshay-bharadva"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="GitHub Profile"
      >
        <BsGithub />
      </Link>
      <Link
        className="rounded-none border-2 border-black bg-white p-3 text-2xl text-black shadow-[3px_3px_0px_#000] transition-all duration-150 hover:bg-yellow-300 hover:shadow-[3px_3px_0px_#4f46e5] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_#4f46e5] sm:text-3xl"
        href="https://www.linkedin.com/in/akshay-bharadva/"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="LinkedIn Profile"
      >
        <BsLinkedin />
      </Link>
      <Link
        className="rounded-none border-2 border-black bg-white p-3 text-2xl text-black shadow-[3px_3px_0px_#000] transition-all duration-150 hover:bg-yellow-300 hover:shadow-[3px_3px_0px_#4f46e5] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_#4f46e5] sm:text-3xl"
        href="mailto:akshaybharadva19@gmail.com"
        aria-label="Email Akshay"
      >
        <AiOutlineMail />
      </Link>
    </div>

    {children && (
      <div className="mt-4 max-w-2xl px-4 text-lg text-gray-700">
        {children}
      </div>
    )}
  </div>
</section>


);
}