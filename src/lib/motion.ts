export const ease = [0.22, 1, 0.36, 1] as const;

export const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease },
  },
};
