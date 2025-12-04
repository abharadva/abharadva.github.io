// src/components/mobile-header.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  useGetSiteIdentityQuery,
  useGetNavLinksQuery,
} from "@/store/api/publicApi";
import { Skeleton } from "./ui/skeleton";

export default function MobileHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: content, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();
  const { data: navLinks, isLoading: isNavLoading } = useGetNavLinksQuery();
  const isLoading = isContentLoading || isNavLoading;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 py-3 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex items-center justify-between px-4">
        <Link
          href="/"
          className="font-mono text-lg font-semibold tracking-tighter"
          onClick={() => setIsOpen(false)}
        >
          {isLoading || !content ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <>
              {content.profile_data.logo.main}
              <span className="text-primary">
                {content.profile_data.logo.highlight}
              </span>
            </>
          )}
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-blueprint-bg">
            <SheetHeader className="flex-row justify-between">
              <SheetTitle className="font-mono text-base uppercase">
                Navigation
              </SheetTitle>
              <SheetClose>
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>
            <div className="mt-6 flex h-full flex-col pb-12">
              <nav className="flex flex-col gap-2">
                {navLinks?.map((link) => {
                  const isActive =
                    router.pathname === link.href ||
                    (link.href !== "/" &&
                      router.pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`-mx-3 flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        isActive
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
