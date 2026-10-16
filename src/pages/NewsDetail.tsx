import { Link, Navigate, useParams } from "react-router-dom";
import { getNewsById } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { toDateTime } from "../lib/date";

export function NewsDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const { newsLive } = useSiteContent();
  const item = newsLive.find((n) => n.id === id) ?? getNewsById(id);

  if (!item) return <Navigate to="/medee" replace />;

  const related = newsLive.filter((n) => n.id !== item.id).slice(0, 3);
  const paragraphs = t(item.bodyKey)
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-news is-app ios-app">
      <Reveal>
        <Link to="/medee" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="desk-article">
        <Reveal>
          <div className="desk-article-hero">
            <SharedMedia
              id={`news-${item.id}`}
              src={item.image}
              alt={t(item.titleKey)}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="desk-article-body">
            <p className="app-pill">
              {t(item.tagKey)} ·{" "}
              <time dateTime={toDateTime(item.date)}>{item.date}</time>
            </p>
            <h1 className="h1">{t(item.titleKey)}</h1>
            <p className="app-sub desk-article-lead">{t(item.excerptKey)}</p>
            <div className="desk-article-copy">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 28)}>{p}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </article>

      {related.length > 0 && (
        <section className="section tight section-last related-block">
          <Reveal>
            <h2 className="app-section-title">{t("related")}</h2>
          </Reveal>
          <Stagger className="app-list app-mobile">
            {related.map((n) => (
              <StaggerItem key={n.id}>
                <Link to={`/medee/${n.id}`} className="app-row app-row-media">
                  <span className="app-row-thumb">
                    <SafeImage src={n.image} alt="" />
                  </span>
                  <span className="app-row-body">
                    <strong>{t(n.titleKey)}</strong>
                    <em>{t(n.tagKey)}</em>
                  </span>
                  <span className="app-row-chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <Stagger className="desk-related-grid desk-only desk-grid">
            {related.map((n) => (
              <StaggerItem key={n.id}>
                <Link to={`/medee/${n.id}`} className="ios-card">
                  <div className="ios-card-media">
                    <SafeImage src={n.image} alt="" />
                  </div>
                  <div className="ios-card-body">
                    <p className="ios-meta">{t(n.tagKey)}</p>
                    <h3>{t(n.titleKey)}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </PageShell>
  );
}
