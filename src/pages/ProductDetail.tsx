import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { formatPrice, getProductById } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { ease } from "../lib/motion";

export function ProductDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const { productsLive } = useSiteContent();
  const reduce = useReducedMotion();
  const p = productsLive.find((x) => x.id === id) ?? getProductById(id);

  if (!p) return <Navigate to="/shop" replace />;

  const related = productsLive.filter((x) => x.id !== p.id).slice(0, 3);
  const paragraphs = t(p.bodyKey)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-shop is-app ios-app">
      <Reveal>
        <Link to="/shop" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="product-detail desk-detail">
        <Reveal className="product-detail-media">
          <div className="desk-detail-hero app-detail-hero-square product-hero-anim">
            <SharedMedia
              id={`shop-${p.id}`}
              src={p.image}
              alt={t(p.titleKey)}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05} className="product-detail-body desk-detail-body">
          <motion.p
            className="app-pill"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease }}
          >
            {t(p.cat === "porcelain" ? "cat_porcelain" : "cat_books")} ·{" "}
            {p.inStock ? t("in_stock") : t("out_stock")}
          </motion.p>
          <h1 className="h1">{t(p.titleKey)}</h1>
          <motion.p
            className="app-price"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 380, damping: 28 }}
          >
            {formatPrice(p.price, lang)}
          </motion.p>
          <p className="app-sub">{t(p.descKey)}</p>

          <div className="desk-article-copy">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 28)}>{para}</p>
            ))}
          </div>

          <h2 className="desk-detail-label">{t("detail_specs")}</h2>
          <ul className="app-chips product-spec-chips">
            {p.specs.map((s, i) => (
              <motion.li
                key={s}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + i * 0.06, duration: 0.3, ease }}
              >
                {t(s)}
              </motion.li>
            ))}
          </ul>

          <div className="app-sticky-actions desk-detail-actions product-cta-row">
            <motion.a
              href={p.href}
              className="btn btn-seal"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <span>{t("buy")}</span>
            </motion.a>
            <motion.div
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <Link to="/contact" className="btn btn-ink">
                <span>{t("ask_product")}</span>
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </article>

      {related.length > 0 && (
        <section className="section tight section-last related-block">
          <Reveal>
            <h2 className="app-section-title">{t("related")}</h2>
          </Reveal>

          <Stagger className="app-list app-mobile">
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/shop/${item.id}`} className="app-row app-row-media">
                  <span className="app-row-thumb">
                    <SafeImage src={item.image} alt="" />
                  </span>
                  <span className="app-row-body">
                    <strong>{t(item.titleKey)}</strong>
                    <em>{formatPrice(item.price, lang)}</em>
                  </span>
                  <span className="app-row-chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger className="shop-grid desk-only desk-grid">
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <ProductCard product={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </PageShell>
  );
}
