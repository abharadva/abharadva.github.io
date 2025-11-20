// src/pages/_app.tsx
import "@/styles/globals.css";
import "prism-themes/themes/prism-one-dark.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { LearningSessionManager } from "@/components/LearningSessionManager";

const tahuFont = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
    },
  };

  const isAdminPage = router.pathname.startsWith("/admin");

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => window.scrollTo(0, 0)}
        >
          <main className={`${tahuFont.variable}`}>
            {isAdminPage && <LearningSessionManager />}
            <motion.div
              key={router.asPath}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Component {...pageProps} />
            </motion.div>
          </main>
        </AnimatePresence>
      </ThemeProvider>
    </Provider>
  );
}
