import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { supabase } from "@/supabase/client";
import type { PortfolioSection } from "@/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Mail, Briefcase, Github, Linkedin } from "lucide-react"; // --- ADD ICONS ---
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/context/SiteContentContext"; // --- ADD THIS IMPORT ---
import { Skeleton } from "@/components/ui/skeleton"; // --- ADD THIS IMPORT ---

// --- ADD THIS HELPER ---
const socialIcons: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

export default function ContactPage() {
  const { site: siteConfig } = appConfig;
  const { content, isLoading: isContentLoading } = useSiteContent(); // --- USE THE CONTEXT ---

  // Static content for the page title itself
  const pageStaticContent = {
    title: "Contact Me",
    description: "Let's build something great together. Get in touch with Akshay Bharadva.",
    heading: "Get In Touch",
    subheading: "Have a project in mind or just want to say hello? I'd love to hear from you.",
    servicesTitle: "What I Can Do For You"
  };

  const pageTitle = `${pageStaticContent.title} | ${siteConfig.title}`;
  const pageUrl = `${siteConfig.url}/contact/`;

  const [serviceSection, setServiceSection] = useState<PortfolioSection | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_sections')
          .select('*, portfolio_items(*)')
          .eq('title', 'Services')
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw new Error(fetchError.message);
        setServiceSection(data);
      } catch (err: any) { setError(err.message || "Could not load services."); }
      finally { setIsLoadingServices(false); }
    };

    fetchServices();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageStaticContent.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageStaticContent.description} />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
      </Head>
      <main className="mx-auto max-w-5xl px-4 py-16 font-sans md:py-24">
        <motion.header
          initial="hidden" animate="visible" variants={itemVariants}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-black text-foreground md:text-6xl">{pageStaticContent.heading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
            {pageStaticContent.subheading}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {/* --- MODIFIED BLOCK START --- */}
            {isContentLoading || !content ? (
              <>
                <Skeleton className="h-12 w-36" />
                <Skeleton className="size-12 rounded-md" />
                <Skeleton className="size-12 rounded-md" />
              </>
            ) : (
              content.social_links.filter(s => s.is_visible).map(social => {
                const Icon = socialIcons[social.id.toLowerCase()];
                if (!Icon) return null;
                const isEmail = social.id.toLowerCase() === 'email';
                return (
                  <Button key={social.url} asChild size={isEmail ? 'lg' : 'icon'} variant={isEmail ? 'default' : 'secondary'}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <Icon className={isEmail ? "mr-2 size-5" : "size-5"} />
                      {isEmail && "Email Me"}
                    </a>
                  </Button>
                );
              })
            )}
            {/* --- MODIFIED BLOCK END --- */}
          </div>
        </motion.header>

        <motion.div className="mt-24">
          <motion.h2 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 text-center text-4xl font-bold text-muted-foreground">{pageStaticContent.servicesTitle}</motion.h2>

          {isLoadingServices && (
            <div className="flex justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          )}

          {!isLoadingServices && serviceSection?.portfolio_items && serviceSection.portfolio_items.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {serviceSection.portfolio_items.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="flex h-full flex-col rounded-lg bg-blueprint-bg p-8 transition-transform duration-200 hover:-translate-y-1"
                >
                  <h3 className="mb-3 text-2xl font-bold text-foreground">{service.title}</h3>
                  <p className="mb-6 flex-grow text-muted-foreground">{service.subtitle}</p>
                  {service.tags && (
                    <ul className="mb-8 space-y-3">
                      {service.tags.map(tag => (
                        <li key={tag} className="flex items-start text-muted-foreground">
                          <Check className="mr-3 mt-1 size-4 shrink-0 text-primary" />
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoadingServices && (!serviceSection?.portfolio_items || serviceSection.portfolio_items.length === 0) && (
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center text-muted-foreground py-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
                <Briefcase className="size-8" />
              </div>
              <p className="mt-4">Services I offer will be listed here soon.</p>
            </motion.div>
          )}

        </motion.div>
      </main>
    </Layout>
  );
}