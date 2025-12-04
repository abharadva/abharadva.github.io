import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import MobileHeader from "./mobile-header";

type LayoutProps = PropsWithChildren & {
  isAdmin?: boolean;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://abharadva.github.io";
const DEFAULT_OG_TITLE = "Akshay Bharadva - Fullstack Developer";
const DEFAULT_OG_DESCRIPTION =
  "Portfolio and Blog of Akshay Bharadva, showcasing projects and thoughts on web development.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/default-og-image.png`;

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  // Optimization: Use CSS variable for mouse position to avoid React re-renders on mousemove
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    if (!isAdmin) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <>
        <Head>
          <title>Admin Panel | Akshay Bharadva</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="font-sans bg-background min-h-screen">{children}</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Akshay Bharadva</title>
        <meta name="description" content={DEFAULT_OG_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
        {/* Add other meta tags as needed */}
      </Head>

      <div className="relative flex min-h-screen flex-col justify-between font-sans">
        {/* Background Layers */}
        <div className="fixed inset-0 z-[-1] bg-background" />

        {/* Grid Pattern */}
        <div className="fixed inset-0 z-[-1] bg-grid-pattern opacity-[0.6]" />

        {/* Spotlight Effect using CSS Variables */}
        <div
          className="pointer-events-none fixed inset-0 z-[-1] opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.15), transparent 40%)`,
          }}
        />

        <Header />
        <MobileHeader />

        <main className="mt-20 w-full grow md:mt-24 relative z-10">
          <Container>{children}</Container>
        </main>

        <Footer />
      </div>
    </>
  );
}
