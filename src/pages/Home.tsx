import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  academy,
  formatPrice,
  newsIds,
  shopProductsMeta,
} from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SealMark } from "../components/SealMark";
import { Marquee } from "../components/Marquee";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { useI18n } from "../i18n/I18nContext";
import { useDesktop } from "../hooks/useDesktop";
import { toDateTime } from "../lib/date";
import { ease } from "../lib/motion";

export function Home() {
  const { t, lang } = useI18n();
  const isDesktop = useDesktop();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -28]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <PageShell className="page-home">
      <section className="hero-cinema" ref={heroRef}>
        <div className="hero-cinema-media">
          <motion.img
            src="/images/hero-wall.jpg"
            alt={t("hero_headline")}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            style={{ y: imgY, scale: imgScale }}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.1, ease }}
          />
          <div className="hero-cinema-shade" />
          {isDesktop && <SealMark className="hero-seal" />}
        </div>

        <motion.div
          className="hero-cinema-body"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.65, ease }}
          >
            <span>{t("brand")}</span>
            <em>{t("hero_eyebrow")}</em>
          </motion.p>

          <motion.div
            className="hero-chip"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease }}
          >
            <strong>{t("hero_chip")}</strong>
            <span>{t("hero_chip_meta")}</span>
          </motion.div>

          <motion.h1
            className="hero-cinema-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.85, ease }}
          >
            <span>
              {t("hero_headline")}{" "}
              <span className="hero-flag" aria-hidden>
                🇨🇳
              </span>
            </span>
          </motion.h1>

          <motion.p
            className="hero-cinema-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease }}
          >
            {t("hero_kicker")}
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease }}
          >
            <a
              href={academy.registerUrl}
              className="btn btn-seal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </a>
            <Link to="/about" className="btn btn-glass">
              <span>{t("about_title")}</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="home-below">
        <Reveal>
          <Marquee />
        </Reveal>

        <section className="section">
          <Stagger className="split-promo">
            <StaggerItem>
              <TiltCard max={7}>
                <Link to="/about" className="promo-panel">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                    alt={t("about_title")}
                  />
                  <div>
                    <p className="eyebrow light">{t("about_title")}</p>
                    <h3>{t("courses_title")}</h3>
                    <span>
                      {t("view")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
            <StaggerItem>
              <TiltCard max={7}>
                <Link to="/university" className="promo-panel">
                  <img
                    src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=80"
                    alt={t("uni_title")}
                  />
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
            {newsIds.slice(0, 3).map((item) => (
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
            {shopProductsMeta.slice(0, 2).map((p) => (
              <StaggerItem key={p.id}>
                <TiltCard max={7}>
                  <Link to={`/shop/${p.id}`} className="shop-card">
                    <div className="shop-media">
                      <SafeImage src={p.image} alt={t(p.titleKey)} />
                      <span className="tag">{t(p.tagKey)}</span>
                      <span className="price-badge">
                        {formatPrice(p.price, lang)}
                      </span>
                    </div>
                    <div className="shop-body">
                      <h3>{t(p.titleKey)}</h3>
                      <div className="shop-foot">
                        <p className="price">{formatPrice(p.price, lang)}</p>
                        <em className="card-cta">
                          {t("view_detail")} <i aria-hidden>→</i>
                        </em>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </div>
    </PageShell>
  );
}
