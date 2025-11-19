import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, AppWindow, Code, BookOpen, User, Send } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/supabase/client";
import { useSiteContent } from "@/context/SiteContentContext"; // --- ADD ---
import { Skeleton } from "./ui/skeleton"; // --- ADD ---

type NavLink = { href: string; label: string };

export default function MobileHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 py-3 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex items-center justify-between px-4">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tighter" onClick={() => setIsOpen(false)}>
          {/* --- MODIFIED BLOCK START --- */}
          {isLoading || !content ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <>
              {content.profile_data.logo.main}
              <span className="text-primary">{content.profile_data.logo.highlight}</span>
            </>
          )}
          {/* --- MODIFIED BLOCK END --- */}
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          {/* ... Sheet content remains the same ... */}
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-blueprint-bg">
            <SheetHeader>
              <SheetTitle className="font-mono text-base uppercase">Navigation</SheetTitle>
              <SheetClose>
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>
            <div className="mt-6 flex h-full flex-col pb-12">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = router.pathname === link.href || (link.href !== "/" && router.pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`-mx-3 flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}