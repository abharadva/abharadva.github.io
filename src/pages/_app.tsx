// src/pages/_app.tsx

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
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";

const tahuFont = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
  display: "swap",
});

const VALID_THEMES = [
  "theme-blueprint",
  "theme-matrix",
  "theme-solarized-light",
  "theme-monokai",
  "theme-cyberpunk",
  "theme-ocean",
  "theme-sunset",
  "theme-forest",
  "theme-royal",
  "theme-crimson",
  "theme-arctic",
  "theme-dracula",
  "theme-coffee",
  "theme-violet",
  "theme-vaporwave",
  "theme-tokyo",
  "theme-aurora",
  "theme-candy",
  "theme-synthwave",
  "theme-tropical",
  "theme-cosmic",
  "theme-sakura",
  "theme-gruvbox",
  "theme-outrun",
  "theme-nord",
  "theme-catppuccin-mocha",
  "theme-catppuccin-latte",
  "theme-tokyo-night",
  "theme-tokyo-storm",
  "theme-kanagawa",
  "theme-rose-pine",
  "theme-rose-pine-dawn",
  "theme-onedark-pro",
  "theme-nightfox",
  "theme-github-dark",
  "theme-ayu-dark",
  "theme-everforest-dark",
  "theme-material-palenight",
  "theme-vesper",
  "theme-everforest-light",
  "theme-github-light",
  "theme-ayu-light",
  "theme-retrowave",
  "theme-blade-runner",
  "theme-terminal-green",
  "theme-amber-crt",
  "theme-lavender",
  "theme-midnight-blue",
  "theme-autumn",
  "theme-jade",
  "theme-desert",
  "theme-hc-dark",
  "theme-hc-light",
  "theme-paper",
  "theme-charcoal",
  "theme-nebula",
  "theme-neon-noir",
  "theme-peacock",
  "theme-flame",
  "theme-winter",
  "theme-spring",
  "theme-summer",
  "theme-corporate",
  "theme-executive",
  "theme-razer",
  "theme-discord",
  "theme-steam",
  "theme-twitter-dark",
  "theme-instagram",
  "theme-apple-dark",
  "theme-microsoft",
  "theme-watermelon",
  "theme-mint-chocolate",
  "theme-bubblegum",
  "theme-gold-noir",
  "theme-platinum",
  "theme-rose-gold",
  "theme-emerald-luxe",
  "theme-sapphire",
  "theme-pastel-rainbow",
  "theme-peach-cream",
  "theme-cotton-candy",
  "theme-terracotta",
  "theme-moss",
  "theme-galactic",
  "theme-alien",
  "theme-starlight",
  "theme-espresso",
  "theme-matcha",
  "theme-berry",
  "theme-neobrutalism-light",
  "theme-neobrutalism-dark",
  "theme-neobrutalism-color",
  "theme-neobrutalism-retro",
  "theme-neobrutalism-punk",
  "theme-glass-light",
  "theme-glass-dark",
  "theme-glass-aurora",
  "theme-glass-ocean",
  "theme-glass-frost",
  "theme-glass-sunset",
  "theme-glass-neon",
  "theme-glass-mint",
  "theme-pure-minimalist",
  "theme-soft-grayscale",
  "theme-monochrome-pro",
  "theme-zen-white",
  "theme-swiss-design",
  "theme-midnight-dev",
  "theme-carbon-fiber",
  "theme-slate-pro",
  "theme-obsidian-code",
  "theme-graphite-studio",
  "theme-coral-reef",
  "theme-electric-lime",
  "theme-magenta-burst",
  "theme-tangerine-dream",
  "theme-ruby-red",
  "theme-quantum-blue",
  "theme-holographic",
  "theme-cyber-matrix",
  "theme-neon-grid",
  "theme-digital-lavender",
  "theme-mocha-mousse",
  "theme-verdant-green",
  "theme-bamboo-forest",
  "theme-desert-sand",
  "theme-code-editor",
  "theme-github-pro",
  "theme-tokyo-dev",
  "theme-custom",
];

function ThemedApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

  const { data: siteIdentity } = useGetSiteIdentityQuery();

  // Get theme from DB
  const dbTheme = siteIdentity?.profile_data?.default_theme;
  const finalTheme = dbTheme?.startsWith("theme-")
    ? dbTheme
    : `theme-${dbTheme || "blueprint"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    if (siteIdentity) {
      // Clean up standard themes
      html.classList.remove(...VALID_THEMES, "dark", "light");

      if (
        finalTheme === "theme-custom" &&
        siteIdentity.profile_data.custom_theme_colors
      ) {
        const colors = siteIdentity.profile_data.custom_theme_colors;
        const root = document.documentElement;

        const hexToHslLocal = (hex: string) => {
          let r = 0,
            g = 0,
            b = 0;
          if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
          } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
          }
          r /= 255;
          g /= 255;
          b /= 255;
          const cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin;
          let h = 0,
            s = 0,
            l = 0;
          if (delta === 0) h = 0;
          else if (cmax === r) h = ((g - b) / delta) % 6;
          else if (cmax === g) h = (b - r) / delta + 2;
          else h = (r - g) / delta + 4;
          h = Math.round(h * 60);
          if (h < 0) h += 360;
          l = (cmax + cmin) / 2;
          s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
          s = +(s * 100).toFixed(1);
          l = +(l * 100).toFixed(1);
          return `${h} ${s}% ${l}%`;
        };

        const setStyle = (name: string, hex: string) => {
          root.style.setProperty(`--${name}`, hexToHslLocal(hex));
        };

        setStyle("background", colors.background);
        setStyle("foreground", colors.foreground);
        setStyle("primary", colors.primary);
        setStyle("secondary", colors.secondary);
        setStyle("accent", colors.accent);
        setStyle("card", colors.card);
        setStyle("popover", colors.background);
        setStyle("muted", colors.secondary);
        setStyle("border", colors.secondary);
        setStyle("input", colors.secondary);
        setStyle("ring", colors.primary);
      } else {
        const root = document.documentElement;
        [
          "background",
          "foreground",
          "primary",
          "secondary",
          "accent",
          "card",
          "popover",
          "muted",
          "border",
          "input",
          "ring",
        ].forEach((k) => {
          root.style.removeProperty(`--${k}`);
        });
      }

      html.classList.add(finalTheme);
      localStorage.setItem("site-theme", finalTheme);
    }
  }, [isAdminPage, siteIdentity, finalTheme]);

  const pageVariants = {
    initial: { opacity: 0, y: 5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: { duration: 0.2, ease: "easeInOut" },
      display: "none",
    },
  };

  return (
    <main className={`${tahuFont.variable}`}>
      <LearningSessionManager />
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
      <SonnerToaster />
      <ShadcnToaster />
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
        themes={VALID_THEMES}
      >
        <ConfirmDialogProvider>
          <ThemedApp {...props} />
        </ConfirmDialogProvider>
      </ThemeProvider>
    </Provider>
  );
}
