import { useMemo, useState } from "react";
import { chinaProgramsMeta } from "../data/content";
import { AppLink } from "../components/AppLink";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
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
  const [q, setQ] = useState("");

  const schools = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return chinaProgramsMeta;
    return chinaProgramsMeta.filter((p) => {
      const hay =
        `${t(p.titleKey)} ${t(p.nameMnKey)} ${t(p.nameZhKey)} ${t(p.cityKey)} ${t(p.descKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, t]);

  return (
    <PageShell className="page-uni is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("nav_uni")}</h1>
          <p className="lead desk-only">{t("uni_lead")}</p>
        </Reveal>
      </header>

      <section className="section tight uni-schools-section">
        <Reveal>
          <label className="ios-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_uni")}
              autoComplete="off"
            />
          </label>
        </Reveal>

        <Reveal>
          <div className="ios-section-head">
            <h2>{t("uni_schools")}</h2>
            <em>{schools.length}</em>
          </div>
        </Reveal>

        {schools.length === 0 ? (
          <p className="ios-empty">{t("empty_uni")}</p>
        ) : (
          <Stagger className="ios-feed ios-feed-schools">
            {schools.map((p) => (
              <StaggerItem key={p.id}>
                <AppLink to="/university/china" className="ios-card">
                  <div className="ios-card-media">
                    <SafeImage src={p.image} alt={t(p.nameMnKey)} />
                    <span className="ios-badge ios-badge-soft">{t(p.cityKey)}</span>
                  </div>
                  <div className="ios-card-body">
                    <h3>{t(p.nameMnKey)}</h3>
                    <p className="ios-card-sub">{t(p.titleKey)}</p>
                    <p className="ios-card-desc">{t(p.descKey)}</p>
                  </div>
                </AppLink>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="section tight section-last app-mobile">
        <Reveal>
          <AppLink to="/enroll?interest=consult" className="ios-cta">
            {t("uni_cta")}
          </AppLink>
        </Reveal>
      </section>

      <section className="section desk-only">
        <Reveal>
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

      <section className="section desk-only">
        <Reveal>
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

      <section className="section desk-only">
        <Reveal>
          <h2 className="h2">{t("faq_title")}</h2>
        </Reveal>
        <Stagger className="faq-list">
          {faqs.map(([qKey, a]) => (
            <StaggerItem key={qKey}>
              <details className="faq-item">
                <summary>{t(qKey)}</summary>
                <p>{t(a)}</p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section section-last uni-form-wrap desk-only">
        <Reveal>
          <ConsultForm />
        </Reveal>
      </section>
    </PageShell>
  );
}
