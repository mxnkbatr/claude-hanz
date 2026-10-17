import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { type ShopCat } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

const cats: ShopCat[] = ["all", "porcelain", "books"];

function catLabel(c: ShopCat, t: (k: string) => string) {
  if (c === "all") return t("filter_all");
  if (c === "porcelain") return t("cat_porcelain");
  return t("cat_books");
}

export function Shop() {
  const { t } = useI18n();
  const { productsLive } = useSiteContent();
  const [cat, setCat] = useState<ShopCat>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: productsLive.length };
    for (const p of productsLive) {
      const key = p.cat || "all";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [productsLive]);

  const list = useMemo(
    () =>
      cat === "all"
        ? productsLive
        : productsLive.filter((p) => (p.cat || "") === cat),
    [cat, productsLive],
  );

  const isFiltered = cat !== "all";

  return (
    <PageShell className="page-shop is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow">{t("nav_shop")}</p>
          <h1 className="h1">{t("shop_page")}</h1>
          <p className="lead">{t("shop_lead")}</p>
        </Reveal>
      </header>

      <Reveal className="desk-only">
        <div className="shop-banner">
          <div className="shop-banner-media">
            <SafeImage src="/images/shop-hero.webp" alt={t("shop_hero_t")} />
          </div>
          <div className="shop-banner-copy">
            <p className="eyebrow light">{t("shop_featured")}</p>
            <h2>{t("shop_hero_t")}</h2>
            <p>{t("shop_hero_d")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="shop-toolbar">
          <div className="news-filter-bar shop-filter-bar">
            <LayoutGroup id="shop-seg">
              <div
                className="news-filters shop-filters"
                role="tablist"
                aria-label={t("nav_shop")}
              >
                {cats.map((c) => {
                  const active = cat === c;
                  const count = counts[c] ?? 0;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`news-chip${active ? " is-active" : ""}`}
                      onClick={() => {
                        setCat(c);
                        void hapticLight();
                      }}
                    >
                      {active && (
                        <motion.span
                          className="news-chip-pill"
                          layoutId="shop-chip-pill"
                          transition={{ type: "spring", stiffness: 480, damping: 36 }}
                        />
                      )}
                      <span className="news-chip-label">{catLabel(c, t)}</span>
                      <em>{count}</em>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {isFiltered && (
              <button
                type="button"
                className="news-reset"
                onClick={() => {
                  setCat("all");
                  void hapticLight();
                }}
              >
                {t("news_clear")}
              </button>
            )}
          </div>

          <p className="news-result-meta desk-only">
            {t("results_count")}: <strong>{list.length}</strong>
          </p>
        </div>
      </Reveal>

      <section className="section tight section-last">
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
          >
            {list.length === 0 ? (
              <p className="ios-empty">{t("empty_shop")}</p>
            ) : (
              <Stagger className="shop-grid">
                {list.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </PageShell>
  );
}
