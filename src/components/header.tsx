

import Link from "next/link";
import { useRouter } from "next/router";
import Container from "./container";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavLink { href: string; label: string; }

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  const router = useRouter();

  const linkClasses = (href: string) => {
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
            AKSHAY<span className="text-primary">.</span>DEV
          </Link>
          <nav className="flex items-center gap-x-2 rounded-lg p-1">
            {NAV_LINKS.map((link) => {
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