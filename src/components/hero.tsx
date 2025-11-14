import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type HeroProps = PropsWithChildren;

export default function Hero({ children }: HeroProps) {
  return (
    <motion.section 
      className="my-8 rounded-none border-2 border-black bg-white p-6 py-8 shadow-[8px_8px_0_#000]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="prose prose-lg max-w-none">
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
          <code className="rounded-none border-2 border-black bg-neutral-100 px-1.5 py-1 font-bold text-black">
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