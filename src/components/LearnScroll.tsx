import { useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Reveal } from "./PageShell";

const STEPS = [
  { char: "你", pinyin: "nǐ", meaningKey: "learn_ni" as const },
  { char: "好", pinyin: "hǎo", meaningKey: "learn_hao" as const },
  { char: "学", pinyin: "xué", meaningKey: "learn_xue" as const },
  { char: "中文", pinyin: "zhōngwén", meaningKey: "learn_zhongwen" as const },
];

export function LearnScroll() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
    setIndex(next);
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const step = STEPS[index];
  const labels = useMemo(
    () => STEPS.map((s) => ({ ...s, meaning: t(s.meaningKey) })),
    [t],
  );

  if (reduce) {
    return (
      <section className="learn-scroll learn-scroll-static section">
        <Reveal>
          <p className="eyebrow">{t("learn_eyebrow")}</p>
          <h2 className="h2">{t("learn_title")}</h2>
        </Reveal>
        <div className="learn-scroll-static-grid">
          {labels.map((s) => (
            <article key={s.char} className="learn-scroll-static-card">
              <span className="learn-char">{s.char}</span>
              <em>{s.pinyin}</em>
              <p>{s.meaning}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="learn-scroll" ref={ref} aria-label={t("learn_title")}>
      <div className="learn-scroll-pin">
        <div className="learn-scroll-inner">
          <p className="eyebrow">{t("learn_eyebrow")}</p>
          <h2 className="h2 learn-scroll-heading">{t("learn_title")}</h2>

          <div className="learn-scroll-stage">
            <div className="learn-char-wrap" aria-live="polite">
              {STEPS.map((s, i) => (
                <motion.span
                  key={s.char}
                  className="learn-char"
                  initial={false}
                  animate={{
                    opacity: i === index ? 1 : 0,
                    scale: i === index ? 1 : 0.88,
                    y: i === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: i === 0 ? "relative" : "absolute" }}
                >
                  {s.char}
                </motion.span>
              ))}
            </div>

            <motion.div
              key={step.char}
              className="learn-meta"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <em className="learn-pinyin">{step.pinyin}</em>
              <p className="learn-meaning">{t(step.meaningKey)}</p>
              <ol className="learn-dots" aria-hidden>
                {STEPS.map((s, i) => (
                  <li key={s.char} className={i === index ? "is-active" : ""} />
                ))}
              </ol>
            </motion.div>
          </div>

          <div className="learn-progress" aria-hidden>
            <motion.span style={{ width: progressWidth }} />
          </div>
          <p className="learn-hint muted">{t("learn_hint")}</p>
        </div>
      </div>
    </section>
  );
}
