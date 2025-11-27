// src/components/cta.tsx
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";

export default function Cta() {
  const { data: content } = useGetSiteIdentityQuery();
  const emailLink =
    content?.social_links.find((s) => s.id === "email")?.url ||
    "mailto:example@example.com";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="my-24"
    >
      <div className="relative overflow-hidden rounded-lg bg-blueprint-bg p-8 text-center md:p-12">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 z-0 h-16 w-16 rounded-full bg-primary/10" />
        <div className="absolute -bottom-8 -right-8 z-0 h-24 w-24 rounded-lg bg-primary/10" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-foreground md:text-4xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of an amazing team. Let's build something
            great together.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <a href={emailLink}>
                Get In Touch <Mail className="ml-2 size-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                More Ways to Connect <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
