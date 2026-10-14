import { Link } from "react-router-dom";
import { academy } from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function Translation() {
  const { t } = useI18n();

  return (
    <PageShell className="page-translation">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_translation")}</p>
          <h1 className="h1">{t("service_title")}</h1>
          <p className="lead">{t("service_body")}</p>
        </Reveal>
      </header>

      <section className="section tight section-last">
        <Reveal>
          <div className="content-panel">
            <div className="article-actions">
              <a href={`mailto:${academy.email}`} className="btn btn-seal">
                <span>{academy.email}</span>
              </a>
              <a href={`tel:${academy.phoneRaw[0]}`} className="btn btn-ink">
                <span>{academy.phone[0]}</span>
              </a>
              <Link to="/contact" className="btn btn-ink">
                <span>{t("nav_contact")}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
