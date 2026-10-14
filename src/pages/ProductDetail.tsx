import { Link, Navigate, useParams } from "react-router-dom";
import { formatPrice, getProductById, shopProductsMeta } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";

export function ProductDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const p = getProductById(id);

  if (!p) return <Navigate to="/shop" replace />;

  const related = shopProductsMeta
    .filter((x) => x.id !== p.id && x.cat === p.cat)
    .concat(shopProductsMeta.filter((x) => x.id !== p.id && x.cat !== p.cat))
    .slice(0, 2);
  const body = t(p.bodyKey).split("\n").filter(Boolean);

  return (
    <PageShell className="page-detail page-shop">
      <Reveal>
        <Link to="/shop" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <section className="product-detail">
        <Reveal>
          <div className="product-detail-media">
            <SafeImage src={p.image} alt={t(p.titleKey)} loading="eager" />
            <span className="tag">{t(p.tagKey)}</span>
            {!p.inStock && (
              <em className="badge-stock">{t("out_stock")}</em>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="product-detail-body">
            <p className="eyebrow">
              {t(p.cat === "porcelain" ? "cat_porcelain" : "cat_books")}
            </p>
            <h1 className="h1">{t(p.titleKey)}</h1>
            <p className="muted">{t(p.unitKey)}</p>

            <div className="product-price-row">
              <p className="price xl">{formatPrice(p.price, lang)}</p>
              <p className={`stock${p.inStock ? " is-ok" : " is-out"}`}>
                {p.inStock ? t("in_stock") : t("out_stock")}
              </p>
            </div>

            <p className="lead">{t(p.descKey)}</p>

            <div className="detail-panel">
              <h2 className="h3">{t("detail_more")}</h2>
              {body.map((para) => (
                <p key={para.slice(0, 24)} className="detail-copy">
                  {para}
                </p>
              ))}
            </div>

            <div className="detail-panel">
              <h2 className="h3">{t("detail_specs")}</h2>
              <ul className="spec-list">
                {p.specs.map((s) => (
                  <li key={s}>
                    <i aria-hidden>◇</i>
                    <span>{t(s)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="article-actions sticky-actions">
              <Link to="/contact" className="btn btn-seal">
                <span>{t("ask_product")}</span>
              </Link>
              <Link to="/shop" className="btn btn-ink">
                <span>{t("nav_shop")}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="related-block">
          <Reveal>
            <div className="section-row">
              <h2 className="h2">{t("related")}</h2>
              <Link to="/shop" className="text-link">
                {t("see_all")} <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="shop-grid home-shop">
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
