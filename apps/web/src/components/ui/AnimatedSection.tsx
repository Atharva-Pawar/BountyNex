import { motion } from "motion/react";

let prefersReduced = false;
if (typeof window !== "undefined") {
  prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
