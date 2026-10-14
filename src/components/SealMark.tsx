import { motion, useReducedMotion } from "framer-motion";

export function SealMark({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`seal-mark ${className}`}
      aria-hidden
      initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <span className="seal-mark-ring" />
      <span className="seal-mark-core">汉</span>
    </motion.div>
  );
}
