import { Link } from "react-router-dom";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function NotFound() {
  const { t } = useI18n();

  return (
    <PageShell className="page-404 is-app">
      <Reveal>
        <header className="page-head app-head">
          <h1 className="h1">{t("not_found_title")}</h1>
        </header>
        <div className="app-list">
          <Link to="/" className="app-row">
            <span className="app-row-icon" aria-hidden>
              汉
            </span>
            <span className="app-row-body">
              <strong>{t("not_found_home")}</strong>
              <em>{t("nav_home")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <Link to="/courses" className="app-row">
            <span className="app-row-icon" aria-hidden>
              学
            </span>
            <span className="app-row-body">
              <strong>{t("nav_courses")}</strong>
              <em>{t("register_cta")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <Link to="/travel" className="app-row">
            <span className="app-row-icon" aria-hidden>
              行
            </span>
            <span className="app-row-body">
              <strong>{t("nav_travel")}</strong>
              <em>{t("travel_page")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </div>
      </Reveal>
    </PageShell>
  );
}
