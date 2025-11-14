import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import Container from "./container";

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

  const linkClasses = (href: string) =>
    `cursor-pointer px-3 py-1.5 last-of-type:mr-0 transform transition-all duration-150 text-sm font-bold rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${router.pathname === href ? "bg-black text-white shadow-[1px_1px_0px_hsl(var(--primary-foreground))_inset]" : "text-black hover:bg-yellow-300 hover:text-black hover:shadow-[1px_1px_0px_#000] active:bg-yellow-400"}`;

  return (
    <header className="fixed left-0 top-0 z-50 hidden w-full border-b border-border bg-background/80 py-3 backdrop-blur-sm md:block">
      <Container>
      <div className="flex h-10 max-w-7xl items-center justify-between ">
        <nav className="flex items-center gap-x-1 rounded-lg bg-secondary/50 p-1">
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