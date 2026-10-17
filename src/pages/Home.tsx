import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SealMark } from "../components/SealMark";
import { SafeImage } from "../components/SafeImage";
import { HeroIntro, shouldPlayHeroIntro } from "../components/HeroIntro";
import { LearnScroll } from "../components/LearnScroll";
import { MagneticButton } from "../components/MagneticButton";
import { NavIcon } from "../components/Icons";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { toDateTime } from "../lib/date";
import { ease } from "../lib/motion";
import { hapticLight } from "../lib/native";

const HERO_IMG = "/images/hero-wall.jpg";

const QUICK_LINKS = [
  { to: "/courses", key: "nav_courses", icon: "courses" as const },
  { to: "/university", key: "nav_uni_short", icon: "uni" as const },
  { to: "/medee", key: "nav_news", icon: "news" as const },
  { to: "/travel", key: "nav_travel", icon: "travel" as const },
];

export function Home() {
  const { t } = useI18n();
  const { academyLive: academy, newsLive } = useSiteContent();
  const heroRef = useRef<HTMLElement>(null);
  const [introDone, setIntroDone] = useState(() => !shouldPlayHeroIntro());
  const playIntro = !introDone;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -28]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  const heroReady = introDone;

  return (
    <PageShell className="page-home">
      {playIntro && <HeroIntro onComplete={() => setIntroDone(true)} />}

      {/* ── Desktop cinema hero ── */}
      <section className="hero-cinema desk-only" ref={heroRef}>
        <div
          className="hero-cinema-media"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        >
          <motion.img
            src={HERO_IMG}
            alt={t("hero_headline")}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            loading="eager"
            draggable={false}
            style={{ y: imgY }}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease }}
          />
          <div className="hero-cinema-shade" />
        </div>

        <motion.div
          className="hero-cinema-body"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.05, duration: 0.65, ease }}
          >
            <span>{t("brand")}</span>
            <em>{t("hero_eyebrow")}</em>
          </motion.p>

          <motion.div
            className="hero-chip"
            initial={{ opacity: 0, y: 16 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.12, duration: 0.65, ease }}
          >
            <strong>{t("hero_chip")}</strong>
            <span>{t("hero_chip_meta")}</span>
          </motion.div>

          <motion.div
            className="hero-title-row"
            initial={{ opacity: 0, y: 40 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 0.18, duration: 0.85, ease }}
          >
            <h1 className="hero-cinema-title">
              <span className="hero-title-text">{t("hero_headline")}</span>
              <span className="hero-flag" aria-hidden>
                🇨🇳
              </span>
            </h1>
            <SealMark className="hero-seal-inline" />
          </motion.div>

          <motion.p
            className="hero-cinema-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.28, duration: 0.7, ease }}
          >
            {t("hero_kicker")}
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.36, duration: 0.7, ease }}
          >
            <MagneticButton
              href={academy.registerUrl}
              className="btn btn-seal btn-hero-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </MagneticButton>
            <Link to="/about" className="btn btn-glass btn-hero-secondary">
              <span>{t("about_title")}</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Mobile iOS home — 4 sections ── */}
      <div className="app-mobile home-ios">
        <section className="home-ios-hero">
          <div className="home-ios-hero-media">
            <img
              src={HERO_IMG}
              alt=""
              width={1200}
              height={1600}
              fetchPriority="high"
              decoding="async"
              loading="eager"
              draggable={false}
            />
            <div className="home-ios-hero-shade" />
          </div>
          <div className="home-ios-hero-body">
            <p className="home-ios-brand">{t("brand")}</p>
            <h1 className="home-ios-title">
              {t("hero_headline").replace(/\n/g, " ")}
            </h1>
            <p className="home-ios-kicker">{t("hero_chip")}</p>
            <Link
              to="/courses"
              className="btn btn-seal home-ios-cta-main"
              onClick={() => void hapticLight()}
            >
              <span>{t("nav_courses")}</span>
              <i aria-hidden>→</i>
            </Link>
          </div>
        </section>

        <section className="home-ios-section">
          <nav className="home-ios-list" aria-label={t("nav_main")}>
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="home-ios-row-link"
                onClick={() => void hapticLight()}
              >
                <span className="home-ios-row-icon" aria-hidden>
                  <NavIcon name={item.icon} />
                </span>
                <span className="home-ios-row-label">{t(item.key)}</span>
                <span className="home-ios-row-chevron" aria-hidden>
                  ›
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="home-ios-section">
          <div className="home-ios-row">
            <h2 className="home-ios-heading">{t("home_news")}</h2>
            <Link to="/medee" className="home-ios-more">
              {t("see_all")}
            </Link>
          </div>
          <div className="home-ios-news">
            {newsLive.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/medee/${item.id}`}
                className="home-ios-news-card"
                onClick={() => void hapticLight()}
              >
                <div className="home-ios-news-media">
                  <SafeImage src={item.image} alt={t(item.titleKey)} />
                </div>
                <div className="home-ios-news-body">
                  <span>{t(item.tagKey)}</span>
                  <strong>{t(item.titleKey)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-ios-section home-ios-section-last">
          <Link
            to="/enroll"
            className="home-ios-banner"
            onClick={() => void hapticLight()}
          >
            <div>
              <strong>{t("register_cta")}</strong>
              <em>{t("kids_detail_online")}</em>
            </div>
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>

      {/* ── Desktop below-fold: LearnScroll → News → Enroll ── */}
      <div className="home-below desk-only">
        <LearnScroll />

        <section className="section">
          <Reveal>
            <div className="section-row">
              <div>
                <p className="eyebrow">{t("nav_news")}</p>
                <h2 className="h2">{t("home_news")}</h2>
              </div>
              <Link to="/medee" className="text-link">
                {t("see_all")}
                <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="news-grid home-news">
            {newsLive.slice(0, 3).map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/medee/${item.id}`} className="news-card">
                  <div className="news-card-media">
                    <SafeImage src={item.image} alt={t(item.titleKey)} />
                  </div>
                  <div className="news-card-body">
                    <div className="news-meta">
                      <span>{t(item.tagKey)}</span>
                      <time dateTime={toDateTime(item.date)}>{item.date}</time>
                    </div>
                    <h3>{t(item.titleKey)}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="section section-last">
          <Reveal>
            <Link to="/enroll" className="home-enroll-strip">
              <div>
                <strong>{t("register_cta")}</strong>
                <em>{t("kids_detail_online")}</em>
              </div>
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </section>
      </div>
    </PageShell>
  );
}
