import Link from "next/link";
import { PropsWithChildren } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type LittleAboutMyselfProps = PropsWithChildren;

export default function LittleAboutMyself({
children,
}: LittleAboutMyselfProps) {
return (
<section className="py-16 ">
<div className="flex size-full flex-col items-center justify-center gap-8 text-center">
<motion.div 
  className="flex flex-col gap-1 text-5xl sm:text-6xl md:text-7xl"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
<p className="text-4xl text-muted-foreground sm:text-5xl">Heya, I'm</p>
<h1 className="font-black text-foreground">
Akshay Bharadva
</h1>
<p className="mt-1 text-3xl font-bold text-accent sm:text-4xl md:text-5xl">
Fullstack Developer.
</p>
</motion.div>

<motion.div 
  className="flex gap-3 sm:gap-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.5 }}
>
      <Button asChild size="icon" variant="outline" aria-label="GitHub Profile">
        <a
          href="https://github.com/akshay-bharadva"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Github className="size-5" />
        </a>
      </Button>
      <Button asChild size="icon" variant="outline" aria-label="LinkedIn Profile">
        <a
          href="https://www.linkedin.com/in/akshay-bharadva/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Linkedin className="size-5" />
        </a>
      </Button>
      <Button asChild size="icon" variant="outline" aria-label="Email Akshay">
        <a
          href="mailto:akshaybharadva19@gmail.com"
        >
          <Mail className="size-5" />
        </a>
      </Button>
    </motion.div>

    {children && (
      <div className="mt-4 max-w-2xl px-4 text-lg text-muted-foreground">
        {children}
      </div>
    )}
  </div>
</section>
);
}