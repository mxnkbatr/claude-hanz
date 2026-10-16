export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Snappy page switch — short fade/slide.
 * Paired with AnimatePresence popLayout so enter doesn’t wait on exit.
 */
export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease },
  },
};

export const sheetEase = [0.32, 0.72, 0, 1] as const;
