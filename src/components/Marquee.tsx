import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";

export function Marquee() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const items = [
    t("marquee_1"),
    t("marquee_2"),
    t("marquee_3"),
    t("marquee_4"),
    t("marquee_5"),
    t("marquee_6"),
  ];
  const row = [...items, ...items];

  return (
    <div className="marquee" aria-hidden>
      <motion.div
        className="marquee-track"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: 40, ease: "linear", repeat: Infinity }
        }
      >
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
            <em>·</em>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
