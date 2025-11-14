import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type HeroProps = PropsWithChildren;

export default function Hero({ children }: HeroProps) {
  return (
    <motion.section 
      className="my-8 rounded-lg border border-border bg-card p-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          Heya! I'm a full-stack developer and life-long learner from
          India, currently living in ON, Canada. I enjoy learning new
          technologies and collaborating with other developers to make products
          a reality. I also enjoy open-source; despite having a full-time job, I
          devote time to exploring open-source projects and studying their tech
          stack and coding conventions.
        </p>
        <p>
          Fun but sad fact: I often misspell the return keyword (e.g.,{" "}
          <code className="rounded-sm border bg-secondary px-1.5 py-1 font-semibold text-secondary-foreground">
            reutrn
          </code>
          ). Let me know if you have any tricks to avoid this mistake! (P.S.
          Thanks to linters for preventing me from breaking deployment pipelines
          😅)
        </p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.section>
  );
}