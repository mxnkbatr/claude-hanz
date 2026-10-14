import { Link } from "react-router-dom";
import { formatPrice, shopProductsMeta } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { SafeImage } from "./SafeImage";
import { TiltCard } from "./TiltCard";

type Product = (typeof shopProductsMeta)[number];

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n();
  const catLabel =
    product.cat === "porcelain" ? t("cat_porcelain") : t("cat_books");

  return (
    <TiltCard>
      <Link
        to={`/shop/${product.id}`}
        className={`shop-card${!product.inStock ? " is-soldout" : ""}`}
      >
        <div className="shop-media">
          <SafeImage
            src={product.image}
            alt={t(product.titleKey)}
            loading="lazy"
          />
          <span className="tag">{t(product.tagKey)}</span>
          {!product.inStock ? (
            <em className="badge-stock">{t("out_stock")}</em>
          ) : (
            <em className="badge-stock is-in">{t("in_stock")}</em>
          )}
        </div>
        <div className="shop-body">
          <p className="shop-cat">{catLabel}</p>
          <h3>{t(product.titleKey)}</h3>
          <p className="muted">{t(product.unitKey)}</p>
          <div className="shop-foot">
            <p className="price">{formatPrice(product.price, lang)}</p>
            <em className="card-cta">
              {t("view_detail")} <i aria-hidden>→</i>
            </em>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
