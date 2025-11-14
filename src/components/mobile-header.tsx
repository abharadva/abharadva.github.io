/*
This file replaces the previous `bottom-menu.tsx` to create a modern, top-fixed mobile header.
- It features a hamburger menu icon that triggers a slide-out navigation panel using the `Sheet` component.
- The navigation links are displayed vertically within the sheet for easy tapping.
- Clicking a link now closes the menu for a smoother user experience.
- A theme toggle button is included in the mobile menu for consistency with the desktop header.
- The design is clean, minimalist, and uses a backdrop blur for a modern aesthetic.
*/
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, X, Home, AppWindow, Code, BookOpen, User, Send } from "lucide-react";
import type { Icon as LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/showcase", label: "Showcase", icon: AppWindow },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About", icon: User },
  { href: "/contact", label: "Contact", icon: Send  },
];

export default function MobileHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 py-3 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight" onClick={() => setIsOpen(false)}>
          AB.
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="flex flex-row items-center justify-between">
              <SheetTitle>Navigation</SheetTitle>
               <SheetClose>
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>
            <div className="mt-6 flex h-full flex-col pb-12">
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive = router.pathname === link.href || (link.href !== "/" && router.pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`-mx-3 flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                      }`}
                    >
                      <link.icon className="size-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-3"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 block dark:hidden" />
                  <Moon className="size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 hidden dark:block" />
                  <span className="ml-1">Toggle Theme</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}