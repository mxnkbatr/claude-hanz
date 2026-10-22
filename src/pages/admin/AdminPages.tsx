import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import { ADMIN_HUB_GROUPS } from "../../lib/adminNav";

export function AdminPages() {
  const { t } = useI18n();

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_cms")}</h1>
        <p>{t("admin_pages_lead")}</p>
      </header>

      {ADMIN_HUB_GROUPS.map((group) => (
        <section key={group.id} className="admin-section">
          <div className="admin-section-head">
            <h2>{t(group.titleKey)}</h2>
            <p>{t(group.hintKey)}</p>
          </div>

          {/* Phone list */}
          <div className="admin-hub-list">
            {group.items.map((p) => (
              <div key={p.id} className="admin-hub-row">
                <Link to={p.to} className="admin-hub-row-main">
                  <span className="admin-hub-mark" aria-hidden>
                    {p.ico}
                  </span>
                  <span className="admin-hub-body">
                    <strong>{t(p.key)}</strong>
                    <em>{p.preview || p.to}</em>
                  </span>
                </Link>
                {p.canAdd && (
                  <Link
                    to={`${p.to}?new=1`}
                    className="admin-hub-add"
                    aria-label={t("admin_add")}
                  >
                    +
                  </Link>
                )}
                <Link to={p.to} className="admin-hub-chevron" aria-hidden>
                  ›
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop cards */}
          <div className="admin-page-grid is-large admin-hub-grid">
            {group.items.map((p) => (
              <article key={p.id} className="admin-page-tile">
                <span className="admin-page-tile-mark" aria-hidden>
                  {p.ico}
                </span>
                <strong>{t(p.key)}</strong>
                <p>{p.preview || p.to}</p>
                <div className="admin-page-tile-actions">
                  <Link to={p.to} className="admin-btn is-seal">
                    {t("admin_manage")}
                  </Link>
                  {p.canAdd && (
                    <Link to={`${p.to}?new=1`} className="admin-btn">
                      + {t("admin_add")}
                    </Link>
                  )}
                  {p.preview && (
                    <a
                      className="admin-btn"
                      href={p.preview}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("admin_preview")}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
