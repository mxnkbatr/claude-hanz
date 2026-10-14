import { Link } from "react-router-dom";
import {
  academy,
  branchesMeta,
  chinaProgramsMeta,
  coursesMeta,
} from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function About() {
  const { t } = useI18n();

  return (
    <PageShell className="page-about">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("about_title")}</p>
          <h1 className="h1">{t("about_title")}</h1>
          <p className="lead home-about-copy">{t("about_body")}</p>
        </Reveal>
      </header>

      <section className="section">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("courses_title")}</p>
              <h2 className="h2">{t("courses_title")}</h2>
              <p className="lead">{t("courses_lead")}</p>
            </div>
            <a
              href={academy.registerUrl}
              className="text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("register_cta")}
              <i aria-hidden>→</i>
            </a>
          </div>
        </Reveal>
        <Stagger className="home-course-grid">
          {coursesMeta.map((c) => (
            <StaggerItem key={c.id}>
              <article className="home-course-card">
                <span className="home-course-icon" aria-hidden>
                  {c.icon}
                </span>
                <span className="home-course-tag">{t(c.tagKey)}</span>
                <h3>{t(c.titleKey)}</h3>
                <p>{t(c.descKey)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("nav_uni")}</p>
              <h2 className="h2">{t("china_home_title")}</h2>
              <p className="lead">{t("china_home_lead")}</p>
            </div>
            <Link to="/university/china" className="text-link">
              {t("uni_more")}
              <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="home-prog-grid">
          {chinaProgramsMeta.map((p) => (
            <StaggerItem key={p.id}>
              <article className="home-prog-card">
                <h3>{t(p.titleKey)}</h3>
                <p>{t(p.descKey)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <Reveal>
          <div className="home-service">
            <p className="eyebrow">{t("service_title")}</p>
            <h2 className="h2">{t("service_title")}</h2>
            <p className="lead">{t("service_body")}</p>
            <a href={`mailto:${academy.email}`} className="btn btn-seal">
              <span>{academy.email}</span>
            </a>
          </div>
        </Reveal>
      </section>

      <section className="section section-last">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("branches_title")}</p>
              <h2 className="h2">{t("branches_title")}</h2>
            </div>
            <Link to="/contact" className="text-link">
              {t("nav_contact")}
              <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="home-branch-grid">
          {branchesMeta.map((b) => (
            <StaggerItem key={b.id}>
              <article className="home-branch-card">
                <h3>{t(b.titleKey)}</h3>
                <p>{t(b.addrKey)}</p>
                <div className="home-branch-phones">
                  {b.phoneDisplay.map((display, i) => (
                    <a key={display} href={`tel:${b.phones[i]}`}>
                      {display}
                    </a>
                  ))}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageShell>
  );
}
