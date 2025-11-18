
import Link from "next/link";
import Container from "./container";
import { siteContent } from "@/lib/site-content";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 py-16 text-sm text-muted-foreground">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <p className="text-center md:text-left">
            &copy; {currentYear} Akshay Bharadva. <br />
            {siteContent.footer.copyrightText}
          </p>

          <div className="flex items-center gap-6">
            {siteContent.footer.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={social.label}
                className="text-2xl transition-colors hover:text-primary"
              >
                <social.icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}