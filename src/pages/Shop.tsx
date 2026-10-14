import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { shopProductsMeta, type ShopCat } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { ease } from "../lib/motion";

const cats: ShopCat[] = ["all", "porcelain", "books"];

export function Shop() {
  const { t } = useI18n();
  const [cat, setCat] = useState<ShopCat>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: shopProductsMeta.length };
    for (const p of shopProductsMeta) {
      map[p.cat] = (map[p.cat] || 0) + 1;
    }
    return map;
  }, []);

  const list = useMemo(
    () =>
      cat === "all"
        ? shopProductsMeta
        : shopProductsMeta.filter((p) => p.cat === cat),
    [cat],
  );

  return (
    <PageShell className="page-shop">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_shop")}</p>
          <h1 className="h1">{t("shop_page")}</h1>
          <p className="lead">{t("shop_lead")}</p>
        </Reveal>
      </header>

      <Reveal>
        <div className="shop-banner">
          <SafeImage src="/images/shop-hero.jpg" alt={t("shop_hero_t")} />
          <div>
            <p className="eyebrow light">{t("shop_featured")}</p>
            <h2>{t("shop_hero_t")}</h2>
            <p>{t("shop_hero_d")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="filter-bar">
          <div className="filter-row" role="tablist">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={cat === c}
                className={`filter-chip${cat === c ? " is-active" : ""}`}
                onClick={() => setCat(c)}
              >
                <span>
                  {c === "all"
                    ? t("filter_all")
                    : c === "porcelain"
                      ? t("cat_porcelain")
                      : t("cat_books")}
                </span>
                <em>{counts[c] ?? 0}</em>
              </button>
            ))}
          </div>
          <p className="filter-meta">
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
              <p className="empty-state">{t("empty_shop")}</p>
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
