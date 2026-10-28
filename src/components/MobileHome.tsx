import { Link } from "react-router-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "./SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";
import { coursesMeta } from "../data/content";
import { ease, navSpring } from "../lib/motion";

const BANNER_MS = 5000;

const CHIP_ICONS: Record<string, string> = {
  classroom: "堂",
  online: "网",
  corporate: "企",
  short: "暑",
  kids: "童",
};

function helloKey(h: number) {
  if (h < 5) return "m_hello_night";
  if (h < 12) return "m_hello_morning";
  if (h < 18) return "m_hello_day";
  return "m_hello_evening";
}

const rise = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
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

/** Auto-rotating featured-course card; swipe or wait to advance. */
function FeaturedBanner() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();
  const slides = coursesLive.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + slides.length) % slides.length);
  };

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setTimeout(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, BANNER_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, slides.length]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setPaused(false);
    if (info.offset.x < -50) go(1);
    else if (info.offset.x > 50) go(-1);
  };

  if (!slide) return null;
  const title = loc(lang, t, slide.title, slide.titleKey);

  return (
    <div className="mh-banner">
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${slide.id}`}
          className="mh-banner-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      </AnimatePresence>

      <motion.div
        className="mh-banner-drag"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setPaused(true)}
        onDragEnd={onDragEnd}
      >
        <Link to={`/courses/${slide.id}`} draggable={false} className="mh-banner-link">
          <div className="mh-banner-media">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={slide.id}
                className="mh-banner-slide"
                initial={{ x: `${dir * 100}%` }}
                animate={{ x: "0%" }}
                exit={{ x: `${dir * -30}%`, opacity: 0.4 }}
                transition={{ duration: 0.55, ease }}
              >
                <SafeImage src={slide.image} alt={title} loading="eager" />
              </motion.div>
            </AnimatePresence>
            <div className="mh-banner-shade" />
            <span className="mh-pill mh-pill-light mh-banner-tag">
              {loc(lang, t, slide.tag, slide.tagKey)}
            </span>
            <p className="mh-banner-unit">{t(slide.unitKey)}</p>
          </div>

          <div className="mh-banner-copy">
            <p className="mh-eyebrow mh-eyebrow-gold">{t("m_featured")}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mh-banner-title">{title}</p>
                <p className="mh-banner-desc">{loc(lang, t, slide.body, slide.descKey)}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
      </motion.div>

      <div className="mh-banner-bars">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={loc(lang, t, s.title, s.titleKey)}
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
          >
            {i < index && <span className="is-done" />}
            {i === index && (
              <span
                key={`${index}-${paused}`}
                className="is-running"
                style={{
                  animationDuration: `${BANNER_MS}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Phone home: an app-style start screen instead of the long desktop landing. */
export function MobileHome() {
  const { t, lang } = useI18n();
  const { coursesLive, universitiesLive, newsLive, academyLive: academy } =
    useSiteContent();
  const [hello] = useState(() => t(helloKey(new Date().getHours())));
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const chips = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of coursesLive) {
      if (!seen.has(c.filter)) seen.set(c.filter, loc(lang, t, c.tag, c.tagKey));
    }
    return [
      { key: "all", label: t("filter_all"), icon: "✦" },
      ...[...seen].map(([key, label]) => ({
        key,
        label,
        icon: CHIP_ICONS[key] ?? "学",
      })),
    ];
  }, [coursesLive, lang, t]);

  const icons = useMemo(
    () => Object.fromEntries(coursesMeta.map((c) => [c.id, c.icon])),
    [],
  );

  const query = q.trim().toLowerCase();
  const results = query
    ? [
        ...coursesLive.map((c) => ({
          id: `c-${c.id}`,
          to: `/courses/${c.id}`,
          image: c.image,
          title: loc(lang, t, c.title, c.titleKey),
          meta: loc(lang, t, c.tag, c.tagKey),
          text: loc(lang, t, c.body, c.descKey),
        })),
        ...universitiesLive.map((u) => ({
          id: `u-${u.id}`,
          to: `/university/${u.id}`,
          image: u.image,
          title: loc(lang, t, u.title, u.titleKey),
          meta: loc(lang, t, u.city, u.cityKey),
          text: loc(lang, t, u.body, u.descKey),
        })),
        ...newsLive.map((n) => ({
          id: `n-${n.id}`,
          to: `/medee/${n.id}`,
          image: n.image,
          title: loc(lang, t, n.title, n.titleKey),
          meta: loc(lang, t, n.tag, n.tagKey),
          text: "",
        })),
      ].filter((r) => `${r.title} ${r.meta} ${r.text}`.toLowerCase().includes(query))
    : [];

  const filtered =
    cat === "all" ? coursesLive : coursesLive.filter((c) => c.filter === cat);
  const catLabel = chips.find((c) => c.key === cat)?.label ?? "";

  return (
    <div className="mh">
      <motion.div {...rise} transition={{ duration: 0.5 }}>
        <p className="mh-hello">{hello} 👋</p>
        <h1 className="mh-title">
          {t("m_title_before")} <em>{t("m_title_em")}</em> {t("m_title_after")}
        </h1>
      </motion.div>

      <motion.div {...rise} transition={{ delay: 0.06, duration: 0.5 }} className="mh-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("m_search_ph")}
          enterKeyHint="search"
          aria-label={t("m_search_ph")}
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label={t("m_clear")}>
            ×
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.ul
            key="results"
            className="mh-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {results.length ? (
              results.map((r) => (
                <li key={r.id}>
                  <Link to={r.to}>
                    <span className="mh-thumb mh-thumb-sm">
                      <SafeImage src={r.image} alt="" />
                    </span>
                    <span className="mh-results-text">
                      <strong>{r.title}</strong>
                      <span>{r.meta}</span>
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="mh-results-empty">{t("m_search_empty").replace("{q}", q)}</li>
            )}
          </motion.ul>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FeaturedBanner />

            <div className="mh-chips" role="tablist">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.key}
                  className={cat === c.key ? "is-active" : undefined}
                  onClick={() => setCat(c.key)}
                >
                  {cat === c.key && (
                    <motion.span className="mh-chip-pill" layoutId="mh-chip" transition={navSpring} />
                  )}
                  <span className="mh-chip-icon" lang="zh">
                    {c.icon}
                  </span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {cat === "all" && universitiesLive.length > 0 && (
              <section className="mh-section">
                <div className="mh-head">
                  <h2>{t("m_unis_title")}</h2>
                  <Link to="/university">{t("see_all")}</Link>
                </div>
                <div className="mh-rail">
                  {universitiesLive.map((u, i) => (
                    <motion.div
                      key={u.id}
                      className="mh-rail-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      <Link to={`/university/${u.id}`} className="mh-poster">
                        <SafeImage src={u.image} alt={loc(lang, t, u.title, u.titleKey)} />
                        <span className="mh-poster-shade" />
                        <span className="mh-pill mh-pill-light mh-poster-badge">
                          <i aria-hidden />
                          {loc(lang, t, u.city, u.cityKey)}
                        </span>
                        <span className="mh-poster-copy">
                          <span className="mh-eyebrow mh-eyebrow-sand">{t("china")}</span>
                          <strong>{loc(lang, t, u.title, u.titleKey)}</strong>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {cat === "all" && (
              <Link to="/quiz" className="mh-promo">
                <span>
                  <span className="mh-eyebrow">{t("m_promo_eyebrow")}</span>
                  <strong>{t("m_promo_title")}</strong>
                </span>
                <span className="mh-promo-go">
                  <Chevron />
                </span>
              </Link>
            )}

            <section className="mh-section">
              <div className="mh-head">
                <h2>{cat === "all" ? t("home_programs_all") : catLabel}</h2>
                <Link to="/courses">{t("see_all")}</Link>
              </div>
              <motion.ul layout className="mh-list">
                <AnimatePresence mode="popLayout">
                  {filtered.map((c) => (
                    <motion.li
                      key={c.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <Link to={`/courses/${c.id}`} className="mh-row">
                        <span className="mh-thumb">
                          <SafeImage src={c.image} alt="" />
                          <span className="mh-thumb-mark" lang="zh">
                            {icons[c.id] ?? "学"}
                          </span>
                        </span>
                        <span className="mh-row-text">
                          <span className="mh-eyebrow">{loc(lang, t, c.tag, c.tagKey)}</span>
                          <strong>{loc(lang, t, c.title, c.titleKey)}</strong>
                          <span className="mh-row-meta">{t(c.unitKey)}</span>
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </section>

            {cat === "all" && newsLive.length > 0 && (
              <section className="mh-section">
                <div className="mh-head">
                  <h2>{t("home_news")}</h2>
                  <Link to="/medee">{t("see_all")}</Link>
                </div>
                <div className="mh-rail">
                  {newsLive.slice(0, 4).map((n) => (
                    <Link key={n.id} to={`/medee/${n.id}`} className="mh-news">
                      <span className="mh-news-media">
                        <SafeImage src={n.image} alt="" />
                      </span>
                      <span className="mh-eyebrow">
                        {loc(lang, t, n.tag, n.tagKey)} ·{" "}
                        <time dateTime={toDateTime(n.date)}>{n.date}</time>
                      </span>
                      <strong>{loc(lang, t, n.title, n.titleKey)}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mh-help">
              <a href={`tel:${academy.phoneRaw[0]}`} className="mh-help-dark">
                ☏ {t("m_help_call")}
              </a>
              <a href={academy.messenger} target="_blank" rel="noopener noreferrer">
                {t("m_help_msg")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
