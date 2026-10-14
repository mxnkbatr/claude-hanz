export const ease = [0.22, 1, 0.36, 1] as const;

export const pageTransition = {
  initial: { opacity: 0, y: 18, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(2px)",
    transition: { duration: 0.3, ease },
  },
};
