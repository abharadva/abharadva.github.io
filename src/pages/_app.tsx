// src/pages/_app.tsx - NUCLEAR OPTION: Complete rewrite to fix theme

import "@/styles/globals.css";
import "prism-themes/themes/prism-one-dark.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { LearningSessionManager } from "@/components/LearningSessionManager";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import React, { useEffect } from "react";

const tahuFont = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
  display: "swap",
});

function ThemedApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

  const { data: siteIdentity } = useGetSiteIdentityQuery();

  const dbTheme = siteIdentity?.profile_data?.default_theme;
  const finalTheme = dbTheme?.startsWith("theme-") ? dbTheme : `theme-${dbTheme || "blueprint"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    if (siteIdentity) {
      html.classList.remove("dark", "light", "theme-blueprint", "theme-matrix", "theme-solarized-light", "theme-monokai");
      html.classList.add(finalTheme);
      localStorage.setItem("site-theme", finalTheme);
    }
  }, [isAdminPage, siteIdentity, finalTheme]);

  const pageVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: -5, transition: { duration: 0.2, ease: "easeInOut" } },
  };

  return (
    <main className={`${tahuFont.variable}`}>
      {!isAdminPage && <LearningSessionManager />}
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div
          key={router.asPath}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="theme-blueprint"
        enableSystem={false}
        storageKey="site-theme"
        themes={["theme-blueprint", "theme-matrix", "theme-solarized-light", "theme-monokai"]}
      >
        <ThemedApp {...props} />
      </ThemeProvider>
    </Provider>
  );
}