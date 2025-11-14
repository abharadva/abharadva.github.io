
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import Container from "./container";
import { cn } from "@/lib/utils";

type HeaderProps = PropsWithChildren;

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Header({ children }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const linkClasses = (href: string) => {
    const isActive = router.pathname === href || (href !== "/" && router.pathname.startsWith(href));
    return cn(
      "cursor-pointer px-3 py-1.5 text-sm font-bold uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-none border-2 border-transparent",
      isActive
        ? "bg-primary text-primary-foreground border-foreground"
        : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground hover:border-foreground"
    );
  };

  return (
    <header className="fixed left-0 top-0 z-50 hidden w-full border-b-2 border-foreground bg-background py-3 md:block">
      <Container>
        <div className="flex h-10 max-w-7xl items-center justify-between">
          <nav className="flex items-center gap-x-1 rounded-none border-2 border-foreground bg-secondary/20 p-1">
            {NAV_LINKS.map((link) => (
              <Link
                className={linkClasses(link.href)}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </Container>
    </header>
  );
}