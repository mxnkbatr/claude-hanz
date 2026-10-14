import { Link } from "react-router-dom";
import { universitiesMeta } from "../data/content";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { useI18n } from "../i18n/I18nContext";

const steps = [
  ["step1", "step1_d"],
  ["step2", "step2_d"],
  ["step3", "step3_d"],
  ["step4", "step4_d"],
] as const;

const faqs = [
  ["faq1_q", "faq1_a"],
  ["faq2_q", "faq2_a"],
  ["faq3_q", "faq3_a"],
  ["faq4_q", "faq4_a"],
] as const;

const compareRows = [
  ["cmp_lang", "cmp_c1", "cmp_p1"],
  ["cmp_cost", "cmp_c2", "cmp_p2"],
  ["cmp_visa", "cmp_c3", "cmp_p3"],
  ["cmp_degree", "cmp_c4", "cmp_p4"],
] as const;

export function University() {
  const { t } = useI18n();

  return (
    <PageShell className="page-uni">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_uni")}</p>
          <h1 className="h1">{t("uni_page")}</h1>
          <p className="lead">{t("uni_lead")}</p>
        </Reveal>
      </header>

      <section className="section tight">
        <Stagger className="uni-stack">
          {universitiesMeta.map((u) => (
            <StaggerItem key={u.id}>
              <TiltCard max={5}>
                <Link to={`/university/${u.id}`} className="uni-card">
                  <div className="uni-media">
                    <SafeImage src={u.image} alt={t(u.titleKey)} />
                    <span>{t(u.countryKey)}</span>
                  </div>
                  <div className="uni-body">
                    <h2>{t(u.titleKey)}</h2>
                    <p>{t(u.descKey)}</p>
                    <ul>
                      {u.points.map((p) => (
                        <li key={p}>{t(p)}</li>
                      ))}
                    </ul>
                    <em className="card-cta">
                      {t("view_detail")} <i aria-hidden>→</i>
                    </em>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <Reveal>
          <p className="eyebrow">{t("steps_title")}</p>
          <h2 className="h2">{t("steps_title")}</h2>
        </Reveal>
        <Stagger className="steps-grid">
          {steps.map(([title, desc], i) => (
            <StaggerItem key={title}>
              <div className="step-card">
                <span className="step-num">0{i + 1}</span>
                <h3>{t(title)}</h3>
                <p>{t(desc)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <Reveal>
          <p className="eyebrow">{t("compare_title")}</p>
          <h2 className="h2">{t("compare_title")}</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="compare-table" role="table">
            <div className="compare-row compare-head" role="row">
              <span role="columnheader" />
              <span role="columnheader">{t("china")}</span>
              <span role="columnheader">{t("poland")}</span>
            </div>
            {compareRows.map(([label, c, p]) => (
              <div key={label} className="compare-row" role="row">
                <span role="rowheader">{t(label)}</span>
                <span role="cell">{t(c)}</span>
                <span role="cell">{t(p)}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <p className="eyebrow">{t("faq_title")}</p>
          <h2 className="h2">{t("faq_title")}</h2>
        </Reveal>
        <Stagger className="faq-list">
          {faqs.map(([q, a]) => (
            <StaggerItem key={q}>
              <details className="faq-item">
                <summary>{t(q)}</summary>
                <p>{t(a)}</p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section section-last uni-form-wrap">
        <Reveal>
          <ConsultForm />
        </Reveal>
      </section>
    </PageShell>
  );
}
