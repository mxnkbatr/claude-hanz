import { Link } from "react-router-dom";
import { ADMIN_PAGES } from "../../lib/cms";
import { useI18n } from "../../i18n/I18nContext";

const marks: Record<string, string> = {
  home: "汉",
  courses: "课",
  news: "新",
  university: "学",
  travel: "✈",
  shop: "店",
  quiz: "测",
  about: "院",
  contact: "☎",
  translation: "译",
  enroll: "✓",
};

export function AdminPages() {
  const { t } = useI18n();

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_pages")}</h1>
        <p>{t("admin_pages_lead")}</p>
      </header>

      <div className="admin-page-grid is-large">
        {ADMIN_PAGES.map((p) => (
          <article key={p.id} className="admin-page-tile">
            <span className="admin-page-tile-mark" aria-hidden>
              {marks[p.id] || "·"}
            </span>
            <strong>{t(p.key)}</strong>
            <p>{p.to}</p>
            <div className="admin-page-tile-actions">
              <Link to={p.adminTo} className="admin-btn is-seal">
                {t("admin_manage")}
              </Link>
              <a
                className="admin-btn"
                href={p.to}
                target="_blank"
                rel="noreferrer"
              >
                {t("admin_preview")}
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
