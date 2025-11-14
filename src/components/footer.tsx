import Link from "next/link";
import { BsGithub, BsLinkedin } from "react-icons/bs";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 py-16 text-sm text-muted-foreground md:py-20">
      <div className="mx-auto flex flex-col items-center justify-between gap-8 px-4 sm:px-8 md:flex-row">
        <p className="text-center md:text-left">
          &copy; {currentYear} Akshay Bharadva. <br />
          Built with love, Next.js, and a lot of coffee.
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/akshay-bharadva"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="GitHub Profile"
            className="text-2xl transition-colors hover:text-accent"
          >
            <BsGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/akshay-bharadva/"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="LinkedIn Profile"
            className="text-2xl transition-colors hover:text-accent"
          >
            <BsLinkedin />
          </a>
          <a
            href="mailto:akshaybharadva19@gmail.com"
            aria-label="Email Akshay"
            className="font-bold transition-colors hover:text-accent"
          >
            akshaybharadva19@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}