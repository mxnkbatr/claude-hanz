import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { PageShell } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { ProductCard } from "../components/ProductCard";
import { MobileHome } from "../components/MobileHome";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";
import { ease, easeOut } from "../lib/motion";
import { coursesMeta } from "../data/content";
import "../styles/home.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d="M5 12h13M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Hero: full-width video banner, headline and actions on paper below ─── */

function HomeHero() {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Respect reduced motion: keep the poster frame instead of looping the clip
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) v.pause();
    else void v.play().catch(() => {});
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const lines = t("hero_headline").split("\n");

  return (
    <section className="hz-hero" ref={ref} aria-labelledby="hz-hero-title">
      <motion.div
        className="hz-hero-banner"
        initial={reduce ? false : { clipPath: "inset(0% 0% 14% 0%)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
      >
        <motion.video
          ref={videoRef}
          src="/videos/hero-banner.mp4"
          poster="/images/hero-banner-poster.webp"
          autoPlay={!reduce}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          style={{ scale: reduce ? 1 : videoScale }}
        />
      </motion.div>

      <motion.div
        className="hz-intro"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.45 } } }}
      >
        <h1 id="hz-hero-title" className="hz-hero-title">
          {lines.map((line) => (
            <span className="hz-line" key={line}>
              <motion.span
                variants={{
                  hidden: { y: "110%" },
                  show: { y: "0%", transition: { duration: 0.9, ease: easeOut } },
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="hz-intro-side"
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
          }}
        >
          <p className="hz-hero-lead">{t("home_hero_lead")}</p>
          <div className="hz-hero-actions">
            <a
              href={academy.registerUrl}
              className="hz-btn hz-btn-red"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <ArrowIcon />
            </a>
            <Link to="/quiz" className="hz-btn hz-btn-outline">
              {t("home_cta_quiz")}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Ledger: the academy's numbers, told as one sentence ─── */

function parseCount(raw: string | undefined, fallback: string) {
  const m = (raw || fallback).trim().match(/^(\d+)(.*)$/);
  return m ? { value: Number(m[1]), suffix: m[2] } : { value: 0, suffix: raw ?? "" };
}

function CountUp({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!active || reduce) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, reduce]);

  return (
    <strong className="hz-num">
      {n}
      {suffix}
    </strong>
  );
}

function Ledger() {
  const { t } = useI18n();
  const { academyLive: a } = useSiteContent();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const values: Record<string, { value: number; suffix: string } | string> = {
    since: a.founded || "2014",
    grads: parseCount(a.graduates, "7300+"),
    sch: parseCount(a.scholarshipStudents, "1080+"),
    unis: parseCount(a.partnerUniversities, "300+"),
  };

  const parts = t("home_ledger").split(/(\{\w+\})/);

  return (
    <section className="hz-ledger">
      <p ref={ref} className="hz-ledger-text">
        {parts.map((part, i) => {
          const key = part.match(/^\{(\w+)\}$/)?.[1];
          if (!key) return <span key={i}>{part}</span>;
          const v = values[key];
          if (typeof v === "string" || v === undefined)
            return (
              <strong key={i} className="hz-num">
                {v ?? part}
              </strong>
            );
          return <CountUp key={i} value={v.value} suffix={v.suffix} active={inView} />;
        })}
      </p>
    </section>
  );
}

/* ─── Programs: an index list; hovering a row floats its photo beside the cursor ─── */

function Programs() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const courses = coursesLive.slice(0, 6);
  const icons = useMemo(
    () => Object.fromEntries(coursesMeta.map((c) => [c.id, c.icon])),
    [],
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const fx = useSpring(mx, { stiffness: 260, damping: 28 });
  const fy = useSpring(my, { stiffness: 260, damping: 28 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = listRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const active = courses.find((c) => c.id === hovered);

  return (
    <section className="hz-section hz-programs" aria-labelledby="hz-programs-title">
      <div className="hz-head">
        <h2 id="hz-programs-title" className="hz-h2">
          {t("home_programs_title")}
        </h2>
        <Link to="/courses" className="hz-link">
          {t("home_programs_all")}
          <ArrowIcon />
        </Link>
      </div>

      <div
        className="hz-index"
        ref={listRef}
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
      >
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/courses/${c.id}`}
            className="hz-index-row"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(c.id)}
          >
            <span className="hz-index-icon" lang="zh" aria-hidden>
              {icons[c.id] ?? "学"}
            </span>
            <span className="hz-index-text">
              <strong>{loc(lang, t, c.title, c.titleKey)}</strong>
              <span>{loc(lang, t, c.body, c.descKey) || t(c.unitKey)}</span>
            </span>
            <span className="hz-index-thumb" aria-hidden>
              <SafeImage src={c.image} alt="" />
            </span>
            <span className="hz-index-go" aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
        ))}

        {!reduce && (
          <motion.div
            className="hz-float"
            aria-hidden
            style={{ x: fx, y: fy }}
            initial={false}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.85 }}
            transition={{ duration: 0.25, ease }}
          >
            <AnimatePresence initial={false}>
              {active && (
                <motion.img
                  key={active.id}
                  src={active.image}
                  alt=""
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ─── Study in China ─── */

function StudyChina() {
  const { t, lang } = useI18n();
  const { universitiesLive } = useSiteContent();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const unis = universitiesLive.slice(0, 4);

  return (
    <section className="hz-section hz-china" ref={ref} aria-labelledby="hz-china-title">
      <motion.div
        className="hz-china-media"
        initial={reduce ? false : { clipPath: "inset(12% 12% 12% 12% round 28px)" }}
        animate={
          inView || reduce
            ? { clipPath: "inset(0% 0% 0% 0% round 28px)" }
            : undefined
        }
        transition={{ duration: 1.1, ease: easeOut }}
      >
        <SafeImage src="/courses/image12.webp" alt={t("home_china_title")} />
      </motion.div>

      <div className="hz-china-copy">
        <h2 id="hz-china-title" className="hz-h2">
          {t("home_china_title")}
        </h2>
        <p className="hz-body">{t("home_china_body")}</p>

        {unis.length > 0 && (
          <ul className="hz-uni-list">
            {unis.map((u) => (
              <li key={u.id}>
                <Link to={`/university/${u.id}`}>
                  <span>{loc(lang, t, u.title, u.titleKey)}</span>
                  {(u.city || u.cityKey) && (
                    <em>{loc(lang, t, u.city, u.cityKey)}</em>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link to="/university" className="hz-btn hz-btn-ink">
          <span>{t("home_china_cta")}</span>
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

/* ─── Page ─── */

export function Home() {
  const { t, lang } = useI18n();
  const { academyLive: academy, newsLive, productsLive } = useSiteContent();
  const [lead, ...rest] = newsLive.slice(0, 3);

  return (
    <PageShell className="page-home hz-home">
      <MobileHome />
      <HomeHero />

      <div className="hz-paper">
        <Ledger />
        <Programs />
        <StudyChina />

        {lead && (
          <section className="hz-section" aria-labelledby="hz-news-title">
            <div className="hz-head">
              <h2 id="hz-news-title" className="hz-h2">
                {t("home_news")}
              </h2>
              <Link to="/medee" className="hz-link">
                {t("see_all")}
                <ArrowIcon />
              </Link>
            </div>

            <div className="hz-news">
              <Link to={`/medee/${lead.id}`} className="hz-news-lead">
                <div className="hz-news-media">
                  <SafeImage src={lead.image} alt={loc(lang, t, lead.title, lead.titleKey)} />
                </div>
                <div className="hz-news-meta">
                  <span>{loc(lang, t, lead.tag, lead.tagKey)}</span>
                  <time dateTime={toDateTime(lead.date)}>{lead.date}</time>
                </div>
                <h3>{loc(lang, t, lead.title, lead.titleKey)}</h3>
              </Link>

              <div className="hz-news-side">
                {rest.map((item) => (
                  <Link key={item.id} to={`/medee/${item.id}`} className="hz-news-row">
                    <div className="hz-news-thumb">
                      <SafeImage src={item.image} alt="" />
                    </div>
                    <div>
                      <div className="hz-news-meta">
                        <span>{loc(lang, t, item.tag, item.tagKey)}</span>
                        <time dateTime={toDateTime(item.date)}>{item.date}</time>
                      </div>
                      <h3>{loc(lang, t, item.title, item.titleKey)}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {productsLive.length > 0 && (
          <section className="hz-section" aria-labelledby="hz-shop-title">
            <div className="hz-head">
              <h2 id="hz-shop-title" className="hz-h2">
                {t("home_shop")}
              </h2>
              <Link to="/shop" className="hz-link">
                {t("shop_link")}
                <ArrowIcon />
              </Link>
            </div>
            <div className="shop-grid home-shop">
              {productsLive.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="hz-final" aria-labelledby="hz-final-title">
        <span className="hz-final-glyph" lang="zh" aria-hidden>
          学
        </span>
        <div className="hz-final-inner">
          <h2 id="hz-final-title" className="hz-final-title">
            {t("home_final_title")}
          </h2>
          <p>{t("home_final_body")}</p>
          <div className="hz-hero-actions">
            <a
              href={academy.registerUrl}
              className="hz-btn hz-btn-red"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <ArrowIcon />
            </a>
            <a href={`tel:${academy.phoneRaw[0]}`} className="hz-btn hz-btn-ghost">
              {academy.phone[0]}
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
