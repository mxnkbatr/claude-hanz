import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";

type Stat = {
  value: number;
  suffix?: string;
  labelKey: "stat_branches" | "stat_unis" | "stat_scholarship" | "stat_students";
  todo?: boolean;
};

const STATS: Stat[] = [
  { value: 4, labelKey: "stat_branches" },
  { value: 4, labelKey: "stat_unis" },
  { value: 100, suffix: "%", labelKey: "stat_scholarship" },
  // TODO: replace with real student count when available
  { value: 0, suffix: "+", labelKey: "stat_students", todo: true },
];

function useCountUp(target: number, active: boolean, reduce: boolean | null) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduce || target === 0) {
      setN(target);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, reduce]);

  return n;
}

function StatItem({
  stat,
  active,
}: {
  stat: Stat;
  active: boolean;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const n = useCountUp(stat.value, active && !stat.todo, reduce);

  return (
    <div className={`stats-item${stat.todo ? " is-todo" : ""}`}>
      <strong className="stats-num">
        {stat.todo ? (
          <span title="TODO">{t("stat_todo")}</span>
        ) : (
          <>
            {n}
            {stat.suffix}
          </>
        )}
      </strong>
      <span className="stats-label">{t(stat.labelKey)}</span>
    </div>
  );
}

export function StatsStrip() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section className="stats-strip section" ref={ref} aria-label={t("stats_title")}>
      <div className="stats-strip-inner">
        {STATS.map((s) => (
          <StatItem key={s.labelKey} stat={s} active={inView} />
        ))}
      </div>
    </section>
  );
}
