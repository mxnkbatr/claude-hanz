import { Link, Navigate, useParams } from "react-router-dom";
import { getNewsById, newsIds } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { useI18n } from "../i18n/I18nContext";
import { toDateTime } from "../lib/date";

export function NewsDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const item = getNewsById(id);

  if (!item) return <Navigate to="/medee" replace />;

  const related = newsIds.filter((n) => n.id !== item.id).slice(0, 3);
  const paragraphs = t(item.bodyKey).split("\n").filter(Boolean);

  return (
    <PageShell className="page-detail page-news">
      <article className="article">
        <Reveal>
          <Link to="/medee" className="text-link back-link">
            ← {t("back")}
          </Link>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="article-hero">
            <div className="article-media">
              <SafeImage
                src={item.image}
                alt={t(item.titleKey)}
                loading="eager"
              />
            </div>
            <div className="article-hero-copy">
              <div className="news-meta">
                <span>{t(item.tagKey)}</span>
                <time dateTime={toDateTime(item.date)}>{item.date}</time>
              </div>
              <h1 className="h1">{t(item.titleKey)}</h1>
              <p className="lead">{t(item.excerptKey)}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="article-body">
            <p className="eyebrow">{t("detail_more")}</p>
            {paragraphs.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
            <div className="article-actions">
              <Link to="/contact" className="btn btn-seal">
                <span>{t("hero_cta_consult")}</span>
              </Link>
              <Link to="/medee" className="btn btn-ink">
                <span>{t("nav_news")}</span>
              </Link>
            </div>
          </div>
        </Reveal>

        {related.length > 0 && (
          <section className="related-block">
            <Reveal>
              <div className="section-row">
                <h2 className="h2">{t("related")}</h2>
                <Link to="/medee" className="text-link">
                  {t("see_all")} <i aria-hidden>→</i>
                </Link>
              </div>
            </Reveal>
            <Stagger className="news-grid related-grid">
              {related.map((n) => (
                <StaggerItem key={n.id}>
                  <TiltCard>
                    <Link to={`/medee/${n.id}`} className="news-card news-card-compact">
                      <div className="news-card-media">
                        <SafeImage src={n.image} alt={t(n.titleKey)} />
                      </div>
                      <div className="news-card-body">
                        <div className="news-meta">
                          <span>{t(n.tagKey)}</span>
                          <time dateTime={toDateTime(n.date)}>{n.date}</time>
                        </div>
                        <h3>{t(n.titleKey)}</h3>
                        <em className="card-cta">
                          {t("read_on_site")} <i aria-hidden>→</i>
                        </em>
                      </div>
                    </Link>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </article>
    </PageShell>
  );
}
