import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { pageTransition, ease } from "../lib/motion";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`page ${className}`}
      initial={reduce ? false : pageTransition.initial}
      animate={pageTransition.animate}
      exit={reduce ? undefined : pageTransition.exit}
      layout={false}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`reveal-block ${className}`}
      initial={reduce ? false : { opacity: 0, y: Math.min(y, 14) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px 80px 0px" }}
      transition={{
        delay: reduce ? 0 : delay,
        duration: 0.35,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`stagger-item ${className}`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px 80px 0px" }}
      transition={{ duration: 0.32, ease }}
    >
      {children}
    </motion.div>
  );
}
