export const ease = [0.22, 1, 0.36, 1] as const;
export const easeOut = [0.16, 1, 0.3, 1] as const;

/** Soft spring for nav pills — buttery, not bouncy. */
export const navSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

/**
 * Clean page switch — soft fade + light lift.
 * Exit is short so wait-mode feels snappy; enter is slightly longer.
 */
export const pageTransition = {
  initial: { opacity: 0, y: 14, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.36, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(1px)",
    transition: { duration: 0.2, ease },
  },
};

export const sheetEase = [0.32, 0.72, 0, 1] as const;
