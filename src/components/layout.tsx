// src/components/layout.tsx
import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import MobileHeader from "./mobile-header";
import { useGetLockdownStatusQuery } from "@/store/api/publicApi";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { supabase } from "@/supabase/client";

type LayoutProps = PropsWithChildren & {
  isAdmin?: boolean;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://abharadva.github.io";
const DEFAULT_OG_TITLE = "Akshay Bharadva - Fullstack Developer";
const DEFAULT_OG_DESCRIPTION =
  "Portfolio and Blog of Akshay Bharadva, showcasing projects and thoughts on web development.";

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const { data: lockdownLevel = 0 } = useGetLockdownStatusQuery();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsAuthChecking(false);
    };
    checkUser();
  }, []);

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

  const isLockdownActive = lockdownLevel >= 1;
  const shouldBlockAccess =
    isLockdownActive && !isAuthChecking && !isAuthenticated;

  if (!isAdmin && shouldBlockAccess) {
    return (
      <>
        <Head>
          <title>System Offline</title>
          <meta name="robots" content="noindex" />
        </Head>
        <MaintenanceScreen level={lockdownLevel} />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <Head>
          <title>Admin Panel | Akshay Bharadva</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
        </Head>
        <div className="font-sans bg-background min-h-[100dvh]">{children}</div>
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
      </Head>

      <div className="relative flex min-h-[100dvh] flex-col justify-between font-sans">
        <div className="fixed inset-0 z-[-1] bg-background" />
        <div className="fixed inset-0 z-[-1] bg-grid-pattern opacity-[0.6]" />
        <div
          className="pointer-events-none fixed inset-0 z-[-1] opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.15), transparent 40%)`,
          }}
        />

        <Header />
        <MobileHeader />

        <main className="mt-20 w-full grow md:mt-24 relative z-10 flex flex-col">
          <Container className="flex-grow">{children}</Container>
        </main>

        <Footer />
      </div>
    </>
  );
}
