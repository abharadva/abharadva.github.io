import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Terminal,
  CircleDashed,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const socialIcons: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const HeroSkeleton = () => (
  <section className="py-12 lg:py-20 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
    <div className="lg:col-span-7 space-y-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full max-w-2xl" />
      <Skeleton className="h-8 w-full max-w-lg" />
      <Skeleton className="h-32 w-full max-w-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
    <div className="lg:col-span-5">
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  </section>
);

export default function Hero() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  if (isLoading || !content) return <HeroSkeleton />;

  const { profile_data: hero, social_links: socials } = content;
  const { status_panel } = hero;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-12 lg:py-24 relative">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Content */}
        <div
          className={cn(
            "flex flex-col gap-6 relative z-10",
            status_panel.show
              ? "lg:col-span-7"
              : "lg:col-span-12 text-center items-center",
          )}
        >
          {/* Decorator */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase"
          >
            <Terminal className="size-4" />
            <span>System Online</span>
          </motion.div>

          {/* Name Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-black text-foreground tracking-tighter leading-[0.9]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)" }}
          >
            {hero.name}
            <span className="text-primary">.</span>
          </motion.h1>

          {/* Title */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <div className="h-px w-12 bg-primary/50" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono text-muted-foreground">
              {hero.title}
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "max-w-xl prose prose-lg prose-invert prose-p:text-muted-foreground prose-a:text-primary",
              !status_panel.show && "mx-auto",
            )}
          >
            <ReactMarkdown>{hero.description}</ReactMarkdown>
          </motion.div>

          {/* Actions & Socials */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "flex flex-wrap gap-4 pt-4",
              !status_panel.show && "justify-center",
            )}
          >
            {socials
              .filter((s) => s.is_visible)
              .map((social) => {
                const Icon = socialIcons[social.id.toLowerCase()];
                if (!Icon) return null;
                return (
                  <Button
                    key={social.url}
                    asChild
                    variant="outline"
                    size="lg"
                    className="gap-2 border-border/50 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300"
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="size-4" />
                      {social.label}
                    </a>
                  </Button>
                );
              })}
          </motion.div>
        </div>

        {/* Right Content - The HUD */}
        {status_panel.show && (
          <motion.div className="lg:col-span-5 w-full" variants={itemVariants}>
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

              <div className="relative bg-background/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 md:p-8 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      {status_panel.title || "Live Status"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-red-500/20" />
                    <span className="size-2 rounded-full bg-yellow-500/20" />
                    <span className="size-2 rounded-full bg-green-500/80 animate-pulse" />
                  </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-6">
                  {/* Availability */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <CircleDashed className="size-3" /> Availability
                    </span>
                    <div className="flex items-center gap-3 text-sm font-medium text-green-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      {status_panel.availability}
                    </div>
                  </div>

                  {/* Exploring */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <Layers className="size-3" />{" "}
                      {status_panel.currently_exploring.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {status_panel.currently_exploring.items.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-mono text-xs"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Latest Project Link */}
                  <div className="pt-4 mt-2 border-t border-white/5">
                    <Link
                      href={status_panel.latestProject.href}
                      className="flex items-center justify-between group/link p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          LATEST DEPLOY
                        </p>
                        <p className="font-bold text-foreground">
                          {status_panel.latestProject.name}
                        </p>
                      </div>
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-background transition-all">
                        <ArrowRight className="size-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
