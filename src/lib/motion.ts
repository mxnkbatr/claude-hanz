export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Soft fade + scale page switch (keyed AnimatedOutlet keeps this stable).
 * Exit stays mostly opacity so shared-element media can morph.
 */
export const pageTransition = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease },
  },
};

export const sheetEase = [0.32, 0.72, 0, 1] as const;
