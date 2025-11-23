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

  // Get theme from DB
  const dbTheme = siteIdentity?.profile_data?.default_theme;
  const finalTheme = dbTheme?.startsWith("theme-") ? dbTheme : `theme-${dbTheme || "blueprint"}`;

  // Apply theme to document directly - bypass next-themes issues
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    if (siteIdentity) {
      html.classList.remove("dark", "light", "theme-blueprint", "theme-matrix", "theme-solarized-light", "theme-monokai",
        "theme-cyberpunk", "theme-ocean", "theme-sunset", "theme-forest",
        "theme-royal", "theme-crimson", "theme-arctic", "theme-dracula",
        "theme-coffee", "theme-violet", "theme-vaporwave", "theme-tokyo", "theme-aurora", "theme-candy",
        "theme-synthwave", "theme-tropical", "theme-cosmic", "theme-sakura",
        "theme-gruvbox", "theme-outrun",
        // Developer Favorites
        "theme-nord", "theme-catppuccin-mocha", "theme-catppuccin-latte",
        "theme-tokyo-night", "theme-tokyo-storm", "theme-kanagawa",
        "theme-rose-pine", "theme-rose-pine-dawn", "theme-onedark-pro", "theme-nightfox",

        // Modern & Trending
        "theme-github-dark", "theme-ayu-dark", "theme-everforest-dark",
        "theme-material-palenight", "theme-vesper",

        // Light Themes
        "theme-everforest-light", "theme-github-light", "theme-ayu-light",

        // Retro & Vintage
        "theme-retrowave", "theme-blade-runner", "theme-terminal-green", "theme-amber-crt",

        // Nature & Organic
        "theme-lavender", "theme-midnight-blue", "theme-autumn", "theme-jade", "theme-desert",

        // High Contrast
        "theme-hc-dark", "theme-hc-light",

        // Minimalist
        "theme-paper", "theme-charcoal",

        // Creative
        "theme-nebula", "theme-neon-noir", "theme-peacock", "theme-flame",

        // Seasonal
        "theme-winter", "theme-spring", "theme-summer",

        // Professional
        "theme-corporate", "theme-executive",

        // Gaming
        "theme-razer", "theme-discord", "theme-steam",

        // Social Media
        "theme-twitter-dark", "theme-instagram",

        // Tech Brands
        "theme-apple-dark", "theme-microsoft",

        // Artistic
        "theme-watermelon", "theme-mint-chocolate", "theme-bubblegum",

        // Luxury
        "theme-gold-noir", "theme-platinum", "theme-rose-gold", "theme-emerald-luxe", "theme-sapphire",

        // Pastel
        "theme-pastel-rainbow", "theme-peach-cream", "theme-cotton-candy",

        // Earth Tones
        "theme-terracotta", "theme-moss",

        // Cosmic
        "theme-galactic", "theme-alien", "theme-starlight",

        // Food & Beverage
        "theme-espresso", "theme-matcha", "theme-berry",

        // Neobrutalism
        "theme-neobrutalism-light", "theme-neobrutalism-dark",
        "theme-neobrutalism-color", "theme-neobrutalism-retro",
        "theme-neobrutalism-punk",

        // Glassmorphism
        "theme-glass-light", "theme-glass-dark", "theme-glass-aurora",
        "theme-glass-ocean", "theme-glass-frost", "theme-glass-sunset",
        "theme-glass-neon", "theme-glass-mint",
      );
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
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={router.asPath}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="w-full" 
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
        themes={["theme-blueprint", "theme-matrix", "theme-solarized-light", "theme-monokai",
          "theme-cyberpunk", "theme-ocean", "theme-sunset", "theme-forest",
          "theme-royal", "theme-crimson", "theme-arctic", "theme-dracula",
          "theme-coffee", "theme-violet", "theme-vaporwave", "theme-tokyo", "theme-aurora", "theme-candy",
          "theme-synthwave", "theme-tropical", "theme-cosmic", "theme-sakura",
          "theme-gruvbox", "theme-outrun",
          // Developer Favorites
          "theme-nord", "theme-catppuccin-mocha", "theme-catppuccin-latte",
          "theme-tokyo-night", "theme-tokyo-storm", "theme-kanagawa",
          "theme-rose-pine", "theme-rose-pine-dawn", "theme-onedark-pro", "theme-nightfox",

          // Modern & Trending
          "theme-github-dark", "theme-ayu-dark", "theme-everforest-dark",
          "theme-material-palenight", "theme-vesper",

          // Light Themes
          "theme-everforest-light", "theme-github-light", "theme-ayu-light",

          // Retro & Vintage
          "theme-retrowave", "theme-blade-runner", "theme-terminal-green", "theme-amber-crt",

          // Nature & Organic
          "theme-lavender", "theme-midnight-blue", "theme-autumn", "theme-jade", "theme-desert",

          // High Contrast
          "theme-hc-dark", "theme-hc-light",

          // Minimalist
          "theme-paper", "theme-charcoal",

          // Creative
          "theme-nebula", "theme-neon-noir", "theme-peacock", "theme-flame",

          // Seasonal
          "theme-winter", "theme-spring", "theme-summer",

          // Professional
          "theme-corporate", "theme-executive",

          // Gaming
          "theme-razer", "theme-discord", "theme-steam",

          // Social Media
          "theme-twitter-dark", "theme-instagram",

          // Tech Brands
          "theme-apple-dark", "theme-microsoft",

          // Artistic
          "theme-watermelon", "theme-mint-chocolate", "theme-bubblegum",

          // Luxury
          "theme-gold-noir", "theme-platinum", "theme-rose-gold", "theme-emerald-luxe", "theme-sapphire",

          // Pastel
          "theme-pastel-rainbow", "theme-peach-cream", "theme-cotton-candy",

          // Earth Tones
          "theme-terracotta", "theme-moss",

          // Cosmic
          "theme-galactic", "theme-alien", "theme-starlight",

          // Food & Beverage
          "theme-espresso", "theme-matcha", "theme-berry",

          // Neobrutalism
          "theme-neobrutalism-light", "theme-neobrutalism-dark",
          "theme-neobrutalism-color", "theme-neobrutalism-retro",
          "theme-neobrutalism-punk",

          // Glassmorphism
          "theme-glass-light", "theme-glass-dark", "theme-glass-aurora",
          "theme-glass-ocean", "theme-glass-frost", "theme-glass-sunset",
          "theme-glass-neon", "theme-glass-mint",
        ]}
      >
        <ThemedApp {...props} />
      </ThemeProvider>
    </Provider>
  );
}