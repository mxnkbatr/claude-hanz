export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Soft fade + scale page switch.
 * Exit stays opacity-only (no scale) so shared-element media can morph cleanly.
 */
export const pageTransition = {
  initial: { opacity: 0, scale: 0.985 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16, ease },
  },
};
