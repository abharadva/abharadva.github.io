
/*
This file replaces the previous `bottom-menu.tsx` and applies the neo-brutalist style to a top-fixed mobile header.
- The `Sheet` component is used for the slide-out menu, inheriting the new raw, bordered style.
- The header has a thick `border-b-2`.
- Navigation links inside the sheet are styled to be blocky and high-contrast, matching the theme's aesthetic.
- The theme toggle button is included for consistency with the desktop header.
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
    <header className="fixed top-0 z-50 w-full border-b-2 border-black bg-white/80 py-3 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight" onClick={() => setIsOpen(false)}>
          A.B.
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
               <SheetClose>
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
                      className={`-mx-3 flex items-center gap-3 rounded-none border-2 border-transparent px-3 py-2 text-lg font-bold transition-colors ${
                        isActive
                          ? "bg-yellow-300 text-black border-black"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
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