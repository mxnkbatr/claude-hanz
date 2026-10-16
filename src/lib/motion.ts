export const ease = [0.22, 1, 0.36, 1] as const;

/** iOS-like push curve */
export const iosEase = [0.32, 0.72, 0, 1] as const;

/**
 * Native-app page push (horizontal) — feels like iOS navigation.
 * Exit stays light so shared-element media can still morph.
 */
export const pageTransition = {
  initial: { opacity: 0, x: 22 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: iosEase },
  },
  exit: {
    opacity: 0,
    x: -14,
    transition: { duration: 0.2, ease: iosEase },
  },
};

export const sheetEase = iosEase;
