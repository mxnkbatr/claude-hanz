import { Link } from "react-router-dom";
import { academy } from "../data/content";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

const FEATS = [
  { t: "trans_feat_1_t", d: "trans_feat_1_d", ico: "文" },
  { t: "trans_feat_2_t", d: "trans_feat_2_d", ico: "言" },
  { t: "trans_feat_3_t", d: "trans_feat_3_d", ico: "书" },
  { t: "trans_feat_4_t", d: "trans_feat_4_d", ico: "✓" },
] as const;

export function Translation() {
  const { t } = useI18n();

  return (
    <PageShell className="page-translation is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow desk-only">{t("nav_translation")}</p>
          <h1 className="h1">{t("service_title")}</h1>
          <p className="lead">{t("service_body")}</p>
        </Reveal>
      </header>

      <section className="section tight">
        <Reveal>
          <p className="eyebrow">{t("trans_services")}</p>
          <h2 className="h2 desk-only">{t("trans_services_lead")}</h2>
        </Reveal>
        <Stagger className="app-list">
          {FEATS.map((f) => (
            <StaggerItem key={f.t}>
              <div className="app-row app-row-static">
                <span className="app-row-icon" aria-hidden>
                  {f.ico}
                </span>
                <span className="app-row-body">
                  <strong>{t(f.t)}</strong>
                  <em>{t(f.d)}</em>
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

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
            <Link to="/contact" className="app-row">
              <span className="app-row-icon" aria-hidden>
                址
              </span>
              <span className="app-row-body">
                <strong>{t("nav_contact")}</strong>
                <em>{t("contact_lead")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="section tight section-last">
        <Reveal>
          <p className="eyebrow">{t("trans_request")}</p>
          <h2 className="h2">{t("trans_request_lead")}</h2>
          <div className="content-panel" style={{ marginTop: "1rem" }}>
            <ConsultForm presetInterest="translation" />
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
