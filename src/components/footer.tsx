
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-2 border-foreground py-16 text-sm text-muted-foreground md:py-20">
      <div className="mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        <p className="text-center font-bold md:text-left">
          &copy; {currentYear} Akshay Bharadva. <br />
          Built with love, Next.js, and a lot of coffee.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/akshay-bharadva"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="GitHub Profile"
            className="text-muted-foreground transition-colors hover:text-accent"
          >
            <Github className="size-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/akshay-bharadva/"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="LinkedIn Profile"
            className="text-muted-foreground transition-colors hover:text-accent"
          >
            <Linkedin className="size-6" />
          </a>
          <a
            href="mailto:akshaybharadva19@gmail.com"
            aria-label="Email Akshay"
            className="text-muted-foreground transition-colors hover:text-accent"
          >
            <Mail className="size-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}