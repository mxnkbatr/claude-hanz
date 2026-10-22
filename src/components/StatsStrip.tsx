import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";

type Stat = {
  value: number;
  suffix?: string;
  labelKey:
    | "stat_branches"
    | "stat_unis"
    | "stat_scholarship"
    | "stat_students";
};

function parseStat(
  raw: string | undefined,
  fallback: string,
): { value: number; suffix?: string } {
  const s = (raw || fallback).trim();
  const m = s.match(/^(\d+)(.*)$/);
  if (!m) return { value: 0 };
  return { value: Number(m[1]), suffix: m[2] || undefined };
}

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
  const n = useCountUp(stat.value, active, reduce);

  return (
    <div className="stats-item">
      <strong className="stats-num">
        {n}
        {stat.suffix}
      </strong>
      <span className="stats-label">{t(stat.labelKey)}</span>
    </div>
  );
}

export function StatsStrip() {
  const { t } = useI18n();
  const { academyLive: a } = useSiteContent();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const stats: Stat[] = useMemo(() => {
    const students = parseStat(a.graduates, "7300+");
    const scholarship = parseStat(a.scholarshipStudents, "1080+");
    const unis = parseStat(a.partnerUniversities, "300+");
    const branches = parseStat(a.branchCount, "4");
    return [
      { ...students, labelKey: "stat_students" },
      { ...scholarship, labelKey: "stat_scholarship" },
      { ...unis, labelKey: "stat_unis" },
      { ...branches, labelKey: "stat_branches" },
    ];
  }, [a]);

  return (
    <section className="stats-strip section" ref={ref} aria-label={t("stats_title")}>
      <div className="stats-strip-inner">
        {stats.map((s) => (
          <StatItem key={s.labelKey} stat={s} active={inView} />
        ))}
      </div>
    </section>
  );
}
