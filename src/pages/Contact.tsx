import { academy } from "../data/content";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "react-router-dom";

const MAP_SRC =
  "https://maps.google.com/maps?q=Union%20Building%20Ulaanbaatar&t=&z=15&ie=UTF8&iwloc=&output=embed";

export function Contact() {
  const { t } = useI18n();

  return (
    <PageShell className="page-contact">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_contact")}</p>
          <h1 className="h1">{t("contact_page")}</h1>
          <p className="lead">{t("contact_lead")}</p>
        </Reveal>
      </header>

      <section className="section tight section-last contact-grid">
        <Reveal className="contact-col">
          <div className="contact-card">
            <h3>{t("footer_contact")}</h3>
            <a href={`tel:${academy.phoneRaw[0]}`}>{academy.phone[0]}</a>
            <a href={`tel:${academy.phoneRaw[1]}`}>{academy.phone[1]}</a>
            <a href={`mailto:${academy.email}`}>{academy.email}</a>
            <p>
              <strong>{t("footer_address")}</strong>
              <br />
              {academy.address}
            </p>
            <p>
              <Link to="/about" className="text-link">
                {t("branches_title")} →
              </Link>
            </p>
            <div className="contact-map">
              <iframe
                title="Union Building, Ulaanbaatar"
                src={MAP_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="contact-social">
              <a
                className="btn btn-seal"
                href={academy.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t("register_cta")}</span>
              </a>
              <a
                className="btn btn-ink"
                href={academy.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Facebook</span>
              </a>
              <a
                className="btn btn-ink"
                href={academy.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="contact-col">
          <ConsultForm />
        </Reveal>
      </section>
    </PageShell>
  );
}
