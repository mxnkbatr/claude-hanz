import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { newsIds, type NewsTag } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { useI18n } from "../i18n/I18nContext";
import { toDateTime } from "../lib/date";
import { ease } from "../lib/motion";

const filters: NewsTag[] = [
  "all",
  "tag_study",
  "tag_course",
  "tag_academy",
];

function isNew(date: string) {
  return date.startsWith("2026");
}

export function News() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<NewsTag>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: newsIds.length };
    for (const n of newsIds) {
      map[n.tagKey] = (map[n.tagKey] || 0) + 1;
    }
    return map;
  }, []);

  const list = useMemo(
    () =>
      filter === "all" ? newsIds : newsIds.filter((n) => n.tagKey === filter),
    [filter],
  );
  const [featured, ...rest] = list;

  return (
    <PageShell className="page-news">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_news")}</p>
          <h1 className="h1">{t("news_title")}</h1>
          <p className="lead">{t("news_lead")}</p>
        </Reveal>
      </header>

      <Reveal>
        <div className="filter-bar">
          <div className="filter-row" role="tablist" aria-label={t("nav_news")}>
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={`filter-chip${filter === f ? " is-active" : ""}`}
                onClick={() => setFilter(f)}
              >
                <span>{f === "all" ? t("filter_all") : t(f)}</span>
                <em>{counts[f] ?? 0}</em>
              </button>
            ))}
          </div>
          <p className="filter-meta">
            {t("results_count")}: <strong>{list.length}</strong>
          </p>
        </div>
      </Reveal>

      <section className="section tight section-last">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease }}
          >
            {featured ? (
              <>
                <Reveal>
                  <TiltCard>
                    <Link to={`/medee/${featured.id}`} className="news-featured">
                      <div className="news-featured-media">
                        <SafeImage
                          src={featured.image}
                          alt={t(featured.titleKey)}
                        />
                        {isNew(featured.date) && (
                          <em className="badge-new">{t("badge_new")}</em>
                        )}
                      </div>
                      <div className="news-featured-body">
                        <div className="news-meta">
                          <span>{t(featured.tagKey)}</span>
                          <time
                            className="date-badge"
                            dateTime={toDateTime(featured.date)}
                          >
                            {featured.date}
                          </time>
                        </div>
                        <h2>{t(featured.titleKey)}</h2>
                        <p>{t(featured.excerptKey)}</p>
                        <em className="card-cta">
                          {t("read_on_site")} <i aria-hidden>→</i>
                        </em>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>

                <Stagger className="news-grid">
                  {rest.map((item) => (
                    <StaggerItem key={item.id}>
                      <TiltCard>
                        <Link to={`/medee/${item.id}`} className="news-card">
                          <div className="news-card-media">
                            <SafeImage
                              src={item.image}
                              alt={t(item.titleKey)}
                            />
                            {isNew(item.date) && (
                              <em className="badge-new">{t("badge_new")}</em>
                            )}
                          </div>
                          <div className="news-card-body">
                            <div className="news-meta">
                              <span>{t(item.tagKey)}</span>
                              <time
                                className="date-badge"
                                dateTime={toDateTime(item.date)}
                              >
                                {item.date}
                              </time>
                            </div>
                            <h3>{t(item.titleKey)}</h3>
                            <p>{t(item.excerptKey)}</p>
                            <em className="card-cta">
                              {t("read_on_site")} <i aria-hidden>→</i>
                            </em>
                          </div>
                        </Link>
                      </TiltCard>
                    </StaggerItem>
                  ))}
                </Stagger>
              </>
            ) : (
              <p className="empty-state">{t("empty_filter")}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </PageShell>
  );
}
