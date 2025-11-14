
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";

const name = "Akshay Bharadva";
const title = "Full-stack Developer.";

const nameVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const titleVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: name.length * 0.05 } },
};
const letterVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  
  return (
    <section className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-5 lg:gap-8">
      <motion.div 
        className="lg:col-span-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          variants={nameVariants}
          aria-label={name}
          className="text-5xl font-black text-foreground sm:text-6xl md:text-7xl"
        >
          {name.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariant} className="inline-block">{char === " " ? "\u00A0" : char}</motion.span>
          ))}
        </motion.h1>
        
        <motion.p
          aria-label={title}
          variants={titleVariants}
          className="mt-2 text-3xl font-mono font-medium text-primary sm:text-4xl"
        >
          {title.split("").map((char, index) => (
             <motion.span key={index} variants={letterVariant} className="inline-block">{char}</motion.span>
          ))}
          <span className="ml-2 animate-caret-blink">|</span>
        </motion.p>

        <motion.p variants={itemVariants} className="mt-8 max-w-xl text-lg text-muted-foreground">
          I build robust, scalable, and user-centric web applications. With a passion for clean code and open-source, I turn complex problems into elegant digital solutions.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 flex gap-3">
          <Button asChild size="icon" variant="secondary" aria-label="GitHub Profile">
            <a href="https://github.com/akshay-bharadva" rel="noopener noreferrer" target="_blank"><Github className="size-5" /></a>
          </Button>
          <Button asChild size="icon" variant="secondary" aria-label="LinkedIn Profile">
            <a href="https://www.linkedin.com/in/akshay-bharadva/" rel="noopener noreferrer" target="_blank"><Linkedin className="size-5" /></a>
          </Button>
          <Button asChild size="icon" variant="secondary" aria-label="Email Akshay">
            <a href="mailto:akshaybharadva19@gmail.com"><Mail className="size-5" /></a>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="lg:col-span-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="h-full rounded-lg bg-blueprint-bg p-6">
          <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Status Panel</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <p className="text-sm">Available for new opportunities</p>
            </div>
             <div className="space-y-2">
                <p className="font-mono text-xs uppercase text-muted-foreground">Currently Exploring</p>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Advanced TypeScript</Badge>
                    <Badge variant="outline">Web Assembly (WASM)</Badge>
                </div>
            </div>
            <div className="border-t border-border pt-4">
               <p className="font-mono text-xs uppercase text-muted-foreground mb-2">Latest Project</p>
                <Link href="/projects" className="group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-secondary">
                  <div>
                    <p className="font-semibold">Portfolio Redesign</p>
                    <p className="text-sm text-muted-foreground">See all projects</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"/>
                </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
