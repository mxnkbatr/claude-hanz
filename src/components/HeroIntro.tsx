import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { ease } from "../lib/motion";

const STORAGE_KEY = "hanz-intro-seen";

/** Simplified brush strokes for 汉 (stroke-dashoffset draw). */
const STROKES = [
  "M42 28 C78 22 118 26 148 38",
  "M52 58 C88 52 128 54 156 68",
  "M96 22 L96 168",
  "M58 92 C78 108 88 128 92 168",
  "M134 92 C114 108 104 128 100 168",
  "M48 118 C72 112 110 110 148 118",
];

type Phase = "draw" | "seal" | "title" | "done";

export function HeroIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "done" : "draw");
  const [visible, setVisible] = useState(!reduce);

  useEffect(() => {
    if (reduce) {
      onComplete();
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setPhase("seal"), 1600);
    const t2 = window.setTimeout(() => setPhase("title"), 2300);
    const t3 = window.setTimeout(() => finish(), 3400);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [reduce]);

  function finish() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setPhase("done");
    setVisible(false);
    onComplete();
  }

  function skip() {
    finish();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="hero-intro"
          role="dialog"
          aria-label={t("intro_aria")}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <button type="button" className="hero-intro-skip" onClick={skip}>
            {t("intro_skip")}
          </button>

          <div className="hero-intro-stage">
            <svg
              className={`hero-intro-han${phase !== "draw" ? " is-drawn" : ""}`}
              viewBox="0 0 200 190"
              aria-hidden
            >
              <defs>
                <filter id="ink-grain">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="2"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="1.4"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
              {STROKES.map((d, i) => (
                <path
                  key={d}
                  d={d}
                  className="hero-intro-stroke"
                  style={{ animationDelay: `${i * 0.18}s` }}
                  filter="url(#ink-grain)"
                />
              ))}
            </svg>

            <motion.div
              className="hero-intro-seal"
              initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
              animate={
                phase === "seal" || phase === "title"
                  ? { opacity: 1, scale: [1.6, 0.92, 1.04, 1], rotate: 8 }
                  : { opacity: 0, scale: 1.6 }
              }
              transition={{ duration: 0.55, ease }}
              aria-hidden
            >
              <span className="hero-intro-seal-press" />
              <span className="hero-intro-seal-mark">汉</span>
            </motion.div>

            <motion.p
              className="hero-intro-title"
              initial={{ opacity: 0, y: 24 }}
              animate={
                phase === "title"
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 24 }
              }
              transition={{ duration: 0.5, ease }}
            >
              {t("hero_headline")}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function shouldPlayHeroIntro() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  /* Mobile uses the dedicated onboard screen instead. */
  if (window.matchMedia("(max-width: 899px)").matches) {
    return false;
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}
