import { Link } from "react-router-dom";
import { academy } from "../data/content";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

const MAP_SRC =
  "https://maps.google.com/maps?q=Union%20Building%20Ulaanbaatar&t=&z=15&ie=UTF8&iwloc=&output=embed";

export function Contact() {
  const { t } = useI18n();

  return (
    <PageShell className="page-contact is-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("contact_page")}</h1>
        </Reveal>
      </header>

      <section className="section tight">
        <Reveal>
          <div className="app-list">
            <a href={`tel:${academy.phoneRaw[0]}`} className="app-row">
              <span className="app-row-icon" aria-hidden>
                ☎
              </span>
              <span className="app-row-body">
                <strong>{academy.phone[0]}</strong>
                <em>{t("call")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </a>
            <a href={`tel:${academy.phoneRaw[1]}`} className="app-row">
              <span className="app-row-icon" aria-hidden>
                ☎
              </span>
              <span className="app-row-body">
                <strong>{academy.phone[1]}</strong>
                <em>{t("call")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </a>
            <a href={`mailto:${academy.email}`} className="app-row">
              <span className="app-row-icon" aria-hidden>
                @
              </span>
              <span className="app-row-body">
                <strong>{academy.email}</strong>
                <em>Email</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </a>
            <div className="app-row app-row-static">
              <span className="app-row-icon" aria-hidden>
                地
              </span>
              <span className="app-row-body">
                <strong>{t("hours_label")}</strong>
                <em>{academy.hours}</em>
              </span>
            </div>
            <div className="app-row app-row-static">
              <span className="app-row-icon" aria-hidden>
                址
              </span>
              <span className="app-row-body">
                <strong>{t("footer_address")}</strong>
                <em>{academy.address}</em>
              </span>
            </div>
            <Link to="/enroll" className="app-row">
              <span className="app-row-icon" aria-hidden>
                汉
              </span>
              <span className="app-row-body">
                <strong>{t("register_cta")}</strong>
                <em>{t("enroll_page")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="section tight">
        <Reveal>
          <div className="contact-map app-map">
            <iframe
              title="Union Building, Ulaanbaatar"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>

      <section className="section tight section-last enroll-wrap">
        <Reveal>
          <ConsultForm compact />
        </Reveal>
      </section>
    </PageShell>
  );
}
