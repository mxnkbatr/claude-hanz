import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Portals fixed bottom CTAs out of PageShell transform traps. */
export function StickyCta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, y: [0, -4, 0] }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : {
              opacity: { duration: 0.25 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }
      }
    >
      {children}
    </motion.div>,
    document.body,
  );
}
