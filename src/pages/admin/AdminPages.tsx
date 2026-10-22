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
  branches: "址",
  windows: "日",
  kids: "童",
  media: "图",
  staff: "人",
};

/** Extra CMS tools shown in the mobile/content hub */
const CMS_EXTRA = [
  {
    id: "branches",
    to: "/about",
    key: "admin_branches",
    adminTo: "/admin/branches",
  },
  {
    id: "windows",
    to: "/travel",
    key: "admin_windows",
    adminTo: "/admin/windows",
  },
  { id: "kids", to: "/courses/kids", key: "admin_kids", adminTo: "/admin/kids" },
  { id: "media", to: "/", key: "admin_media", adminTo: "/admin/media" },
  { id: "staff", to: "/admin/staff", key: "admin_staff", adminTo: "/admin/staff" },
] as const;

export function AdminPages() {
  const { t } = useI18n();
  const hub = [...ADMIN_PAGES, ...CMS_EXTRA];

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_pages")}</h1>
        <p>{t("admin_pages_lead")}</p>
      </header>

      {/* Phone: RN-style inset list */}
      <section className="admin-hub-list" aria-label={t("admin_cms")}>
        {hub.map((p) => (
          <Link key={p.id} to={p.adminTo} className="admin-hub-row">
            <span className="admin-hub-mark" aria-hidden>
              {marks[p.id] || "·"}
            </span>
            <span className="admin-hub-body">
              <strong>{t(p.key)}</strong>
              <em>{p.to}</em>
            </span>
            <span className="admin-hub-chevron" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </section>

      {/* Desktop: tile grid */}
      <div className="admin-page-grid is-large admin-hub-grid">
        {hub.map((p) => (
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
