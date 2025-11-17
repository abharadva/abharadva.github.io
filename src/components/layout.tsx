
import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import MobileHeader from "./mobile-header";
import { motion } from "framer-motion";

type LayoutProps = PropsWithChildren & {
  isAdmin?: boolean;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://akshay-bharadva.github.io";
const DEFAULT_OG_TITLE = "Akshay Bharadva - Fullstack Developer";
const DEFAULT_OG_DESCRIPTION = "Portfolio and Blog of Akshay Bharadva, showcasing projects and thoughts on web development.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/default-og-image.png`;

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);

  }, []);

  if (isAdmin) {
    return (
      <>
        <Head>
          <title>Admin Panel | Akshay Bharadva</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="font-sans">
          {children}
          <SonnerToaster />
          <ShadcnToaster />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Akshay Bharadva</title>
        <meta name="description" content="Akshay Bharadva - Fullstack Developer Portfolio & Blog" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta property="og:title" content={DEFAULT_OG_TITLE} />
        <meta property="og:description" content={DEFAULT_OG_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Akshay Bharadva" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_OG_TITLE} />
        <meta name="twitter:description" content={DEFAULT_OG_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Head>
      <div className="relative flex min-h-screen flex-col justify-between font-sans selection:bg-primary selection:text-primary-foreground bg-grid-pattern">
        <motion.div
          className="pointer-events-none fixed inset-0 z-[-1] transition duration-300"
          style={{
            background: `radial - gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
          }}
        />
        <div className="fixed inset-0 z-[-2] h-full w-full bg-background" />

        <Header />
        <MobileHeader />
        <main className="mt-20 w-full grow md:mt-24">
          <Container>{children}</Container>
        </main>
        <Footer />
        <SonnerToaster />
        <ShadcnToaster />
      </div>
    </>
  );
}

