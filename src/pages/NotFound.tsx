import { Link } from "react-router-dom";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function NotFound() {
  const { t } = useI18n();

  return (
    <PageShell className="page-404">
      <Reveal>
        <header className="page-head page-404-head">
          <p className="eyebrow">404</p>
          <h1 className="h1">{t("not_found_title")}</h1>
          <p className="lead">{t("not_found_lead")}</p>
          <Link to="/" className="btn btn-seal">
            <span>{t("not_found_home")}</span>
          </Link>
        </header>
      </Reveal>
    </PageShell>
  );
}
