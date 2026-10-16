export const ease = [0.22, 1, 0.36, 1] as const;

/** Shared page enter/exit — soft exit so shared-element media can morph. */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease },
  },
};
