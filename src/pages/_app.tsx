import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion"; // motion is needed now
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/theme-provider";

const tahuFont = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Define the animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 5, // Start slightly below
    },
    animate: {
      opacity: 1,
      y: 0, // Animate to original position
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      y: -5, // Exit slightly above
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <main className={`${tahuFont.variable} `}>
          {/* Wrap the component with motion.div */}
          <motion.div
            key={router.asPath} // Key is crucial for AnimatePresence to detect page changes
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
  );
}