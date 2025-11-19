// src/components/header.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "./container";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import { useSiteContent } from "@/context/SiteContentContext"; // --- ADD ---
import { Skeleton } from "./ui/skeleton"; // --- ADD ---

type NavLink = { href: string; label: string };

export default function Header() {
  const router = useRouter();
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const { content, isLoading } = useSiteContent(); // --- USE CONTEXT ---

  useEffect(() => {
    // ... useEffect to fetch nav links remains the same ...
    const fetchNavAndSettings = async () => {
      const [settingsRes, linksRes] = await Promise.all([
        supabase.from('site_settings').select('portfolio_mode').single(),
        supabase.from('navigation_links').select('label, href').eq('is_visible', true).order('display_order')
      ]);
      const portfolioMode = settingsRes.data?.portfolio_mode || 'multi-page';
      let finalLinks = linksRes.data || [];
      if (portfolioMode === 'single-page') {
        finalLinks = finalLinks.filter(link => link.href === '/' || link.href === '/contact' || link.href === '/blog');
      }
      setNavLinks(finalLinks);
    };
    fetchNavAndSettings();
  }, []);

  const linkClasses = (href: string) => {
    // ... linkClasses function remains the same ...
    const isActive = router.pathname === href || (href !== "/" && router.pathname.startsWith(href));
    return cn(
      "relative cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive && "text-foreground"
    );
  };

  return (
    <header className="fixed left-0 top-0 z-50 hidden w-full border-b border-border/50 bg-background/80 py-3 backdrop-blur-lg md:block">
      <Container>
        <div className="flex h-10 max-w-7xl items-center justify-between">
          <Link href="/" className="font-mono text-lg font-semibold tracking-tighter">
            {isLoading || !content ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <>
                {content.profile_data.logo.main}
                <span className="text-primary">{content.profile_data.logo.highlight}</span>
              </>
            )}
          </Link>
          <nav className="flex items-center gap-x-2 rounded-lg p-1">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href || (link.href !== "/" && router.pathname.startsWith(link.href));
              return (
                <Link className={linkClasses(link.href)} href={link.href} key={link.href}>
                  {isActive && (
                    <motion.span
                      layoutId="header-active-link"
                      className="absolute inset-0 z-[-1] rounded-md bg-secondary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </Container>
    </header>
  );
}