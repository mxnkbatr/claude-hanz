import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SealMark } from "../components/SealMark";
import { Marquee } from "../components/Marquee";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { ProductCard } from "../components/ProductCard";
import { HeroIntro, shouldPlayHeroIntro } from "../components/HeroIntro";
import { LearnScroll } from "../components/LearnScroll";
import { StatsStrip } from "../components/StatsStrip";
import { MagneticButton } from "../components/MagneticButton";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";
import { ease } from "../lib/motion";

const HERO_IMG = "/images/hero-wall.webp";

export function Home() {
  const { t, lang } = useI18n();
  const { academyLive: academy, newsLive, productsLive } = useSiteContent();
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

      <section className="hero-cinema" ref={heroRef}>
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
            <SealMark className="hero-seal-inline desk-only" />
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

      <div className="home-below">
        <Reveal>
          <Marquee />
        </Reveal>

        <StatsStrip />

        <LearnScroll />

        <section className="section">
          <Stagger className="split-promo">
            <StaggerItem>
              <TiltCard>
                <Link to="/courses" className="promo-panel">
                  <SafeImage src="/courses/image4.webp" alt={t("courses_title")} />
                  <div>
                    <p className="eyebrow light">{t("nav_courses")}</p>
                    <h3>{t("courses_title")}</h3>
                    <span>
                      {t("view")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
            <StaggerItem>
              <TiltCard>
                <Link to="/university" className="promo-panel">
                  <SafeImage src="/courses/image12.webp" alt={t("uni_title")} />
                  <div>
                    <p className="eyebrow light">{t("nav_uni")}</p>
                    <h3>{t("china_home_title")}</h3>
                    <span>
                      {t("uni_more")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
          </Stagger>
        </section>

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
                    <SafeImage
                      src={item.image}
                      alt={loc(lang, t, item.title, item.titleKey)}
                    />
                  </div>
                  <div className="news-card-body">
                    <div className="news-meta">
                      <span>{loc(lang, t, item.tag, item.tagKey)}</span>
                      <time dateTime={toDateTime(item.date)}>{item.date}</time>
                    </div>
                    <h3>{loc(lang, t, item.title, item.titleKey)}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="section section-last">
          <Reveal>
            <div className="section-row">
              <div>
                <p className="eyebrow">{t("nav_shop")}</p>
                <h2 className="h2">{t("home_shop")}</h2>
              </div>
              <Link to="/shop" className="text-link">
                {t("shop_link")}
                <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="shop-grid home-shop">
            {productsLive.slice(0, 4).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </div>
    </PageShell>
  );
}
