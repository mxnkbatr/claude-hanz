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
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px 160px 0px" }}
      transition={{
        delay: reduce ? 0 : delay,
        duration: 0.5,
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
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px 200px 0px" }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
