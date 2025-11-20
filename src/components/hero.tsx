// src/components/hero.tsx
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

const socialIcons: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const HeroSkeleton = () => (
  <section className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-5 lg:gap-8">
    <div className="lg:col-span-3 space-y-6">
      <Skeleton className="h-20 w-full max-w-lg" />
      <Skeleton className="h-12 w-full max-w-md" />
      <Skeleton className="h-24 w-full max-w-xl" />
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </div>
    </div>
    <div className="lg:col-span-2">
      <Skeleton className="h-full w-full rounded-lg min-h-[250px]" />
    </div>
  </section>
);

export default function Hero() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  const nameVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const titleVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: (content?.profile_data.name.length || 0) * 0.05,
      },
    },
  };
  const letterVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (isLoading || !content) {
    return <HeroSkeleton />;
  }

  const { profile_data: hero, social_links: socials } = content;
  const { status_panel } = hero;

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
          aria-label={hero.name}
          className="text-5xl font-black text-foreground sm:text-6xl md:text-7xl"
        >
          {hero.name.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariant}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          aria-label={hero.title}
          variants={titleVariants}
          className="mt-2 text-3xl font-mono font-medium text-primary sm:text-4xl"
        >
          {hero.title.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariant}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          ))}
          <span className="ml-2 animate-caret-blink">|</span>
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="prose prose-lg dark:prose-invert mt-8 max-w-xl text-muted-foreground"
        >
          <ReactMarkdown>{hero.description}</ReactMarkdown>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 flex gap-3">
          {socials
            .filter((s) => s.is_visible)
            .map((social) => {
              const Icon = socialIcons[social.id.toLowerCase()];
              return Icon ? (
                <Button
                  asChild
                  size="icon"
                  variant="secondary"
                  aria-label={social.label}
                  key={social.url}
                >
                  <a
                    href={social.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon className="size-5" />
                  </a>
                </Button>
              ) : null;
            })}
        </motion.div>
      </motion.div>

      <motion.div
        className="lg:col-span-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="h-full rounded-lg bg-blueprint-bg p-6">
          <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {status_panel.title || "Status Panel"}
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <p className="text-sm">{status_panel.availability}</p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                {status_panel.currently_exploring.title || "Exploring"}
              </p>
              <div className="flex flex-wrap gap-2">
                {status_panel.currently_exploring.items.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="font-mono text-xs uppercase text-muted-foreground mb-2">
                Latest Project
              </p>
              <Link
                href={status_panel.latestProject.href}
                className="group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-secondary"
              >
                <div>
                  <p className="font-semibold">
                    {status_panel.latestProject.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status_panel.latestProject.linkText}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
