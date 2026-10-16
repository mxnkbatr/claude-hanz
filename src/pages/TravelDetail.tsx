import { Link, Navigate, useParams } from "react-router-dom";
import { getTravelById } from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";

export function TravelDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const { travelLive } = useSiteContent();
  const pack = travelLive.find((x) => x.id === id) ?? getTravelById(id);

  if (!pack) return <Navigate to="/travel" replace />;

  const other = travelLive.find((x) => x.id !== pack.id);
  const interest = pack.id === "china" ? "travel_china" : "travel_poland";
  const paragraphs = t(pack.bodyKey)
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-travel is-app ios-app">
      <Reveal>
        <Link to="/travel" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="desk-article desk-article-split">
        <Reveal>
          <div className="desk-article-hero">
            <SharedMedia
              id={`travel-${pack.id}`}
              src={pack.image}
              alt={t(pack.titleKey)}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="desk-article-body">
            <p className="app-pill">{t(pack.tagKey)}</p>
            <h1 className="h1">{t(pack.titleKey)}</h1>
            <p className="app-sub desk-article-lead">{t(pack.descKey)}</p>

            <div className="desk-article-copy">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 28)}>{p}</p>
              ))}
            </div>

            <h2 className="desk-detail-label">{t("detail_more")}</h2>
            <ul className="desk-point-list">
              {pack.highlights.map((h) => (
                <li key={h}>{t(h)}</li>
              ))}
            </ul>

            <div className="app-sticky-actions desk-detail-actions">
              <Link to={`/enroll?interest=${interest}`} className="btn btn-seal">
                <span>{t("travel_cta")}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </article>

      {other && (
        <Reveal delay={0.08}>
          <Link
            to={`/travel/${other.id}`}
            className="app-row app-row-media app-related"
          >
            <span className="app-row-thumb">
              <SafeImage src={other.image} alt="" />
            </span>
            <span className="app-row-body">
              <strong>{t(other.titleKey)}</strong>
              <em>{t("related")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </Reveal>
      )}
    </PageShell>
  );
}
