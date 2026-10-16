import { AppLink } from "../components/AppLink";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";

export function Travel() {
  const { t } = useI18n();
  const { travelLive } = useSiteContent();

  return (
    <PageShell className="page-travel is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow">{t("nav_travel")}</p>
          <h1 className="h1">{t("travel_page")}</h1>
          <p className="lead">{t("travel_lead")}</p>
        </Reveal>
      </header>

      <section className="section tight section-last">
        <Stagger className="ios-feed ios-feed-stack travel-desk-grid">
          {travelLive.map((p) => (
            <StaggerItem key={p.id}>
              <AppLink to={`/travel/${p.id}`} className="ios-card ios-travel-card">
                <div className="ios-card-media ios-travel-media">
                  <SharedMedia
                    id={`travel-${p.id}`}
                    src={p.image}
                    alt={t(p.titleKey)}
                  />
                  <span className="ios-badge ios-badge-soft">{t(p.tagKey)}</span>
                </div>
                <div className="ios-card-body">
                  <h3>{t(p.titleKey)}</h3>
                  <p className="ios-card-desc">{t(p.descKey)}</p>
                  <ul className="ios-card-points">
                    {p.highlights.slice(0, 2).map((h) => (
                      <li key={h}>{t(h)}</li>
                    ))}
                  </ul>
                  <span className="ios-card-cta">
                    {t("view")} <i aria-hidden>→</i>
                  </span>
                </div>
              </AppLink>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageShell>
  );
}
