export const ease = [0.22, 1, 0.36, 1] as const;

/** Soft fade page switch — no scale (scale felt like scroll jank on Safari). */
export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.22, ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease },
  },
};

export const sheetEase = [0.32, 0.72, 0, 1] as const;
