

import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import Container from "./container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 py-16 text-sm text-muted-foreground">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <p className="text-center md:text-left">
            &copy; {currentYear} Akshay Bharadva. <br />
            Built with Next.js, Tailwind, and a lot of coffee.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/akshay-bharadva"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="GitHub Profile"
              className="text-2xl transition-colors hover:text-primary"
            >
              <Github className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/akshay-bharadva/"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="LinkedIn Profile"
              className="text-2xl transition-colors hover:text-primary"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              href="mailto:akshaybharadva19@gmail.com"
              aria-label="Email Akshay"
              className="text-2xl transition-colors hover:text-primary"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

