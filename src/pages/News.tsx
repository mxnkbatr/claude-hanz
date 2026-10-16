import { useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { type NewsTag } from "../data/content";
import { AppLink } from "../components/AppLink";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";

const filters: NewsTag[] = ["all", "tag_study", "tag_course", "tag_academy"];

function isNew(date: string) {
  return date.startsWith("2026");
}

export function News() {
  const { t } = useI18n();
  const { newsLive } = useSiteContent();
  const [filter, setFilter] = useState<NewsTag>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: newsLive.length };
    for (const n of newsLive) {
      map[n.tagKey] = (map[n.tagKey] || 0) + 1;
    }
    return map;
  }, [newsLive]);

  const list = useMemo(() => {
    const base =
      filter === "all" ? newsLive : newsLive.filter((n) => n.tagKey === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((n) => {
      const hay = `${t(n.titleKey)} ${t(n.excerptKey)} ${t(n.tagKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [filter, q, t, newsLive]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  return (
    <PageShell className="page-news is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow">{t("nav_news")}</p>
          <h1 className="h1">{t("news_title")}</h1>
          <p className="lead">{t("news_lead")}</p>
        </Reveal>
      </header>

      <Reveal>
        <div className="news-toolbar">
          <label className="ios-search news-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_news")}
              autoComplete="off"
            />
            {hasQuery && (
              <button
                type="button"
                className="news-search-clear"
                onClick={() => setQ("")}
                aria-label={t("news_clear")}
              >
                ×
              </button>
            )}
          </label>

          <div className="news-filter-bar">
            <LayoutGroup id="news-seg">
              <div
                className="news-filters"
                role="tablist"
                aria-label={t("news_filter_label")}
              >
                {filters.map((f) => {
                  const active = filter === f;
                  const count = counts[f] ?? 0;
                  return (
                    <button
                      key={f}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`news-chip${active ? " is-active" : ""}`}
                      onClick={() => {
                        setFilter(f);
                        void hapticLight();
                      }}
                    >
                      {active && (
                        <motion.span
                          className="news-chip-pill"
                          layoutId="news-chip-pill"
                          transition={{ type: "spring", stiffness: 480, damping: 36 }}
                        />
                      )}
                      <span className="news-chip-label">
                        {f === "all" ? t("filter_all") : t(f)}
                      </span>
                      <em>{count}</em>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {isFiltered && (
              <button
                type="button"
                className="news-reset"
                onClick={() => {
                  setFilter("all");
                  setQ("");
                  void hapticLight();
                }}
              >
                {t("news_clear")}
              </button>
            )}
          </div>

          <p className="news-result-meta desk-only">
            {t("results_count")}: <strong>{list.length}</strong>
          </p>
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          <p className="ios-empty">{t("empty_filter")}</p>
        ) : (
          <Stagger className="ios-feed ios-feed-news">
            {list.map((item) => (
              <StaggerItem key={item.id}>
                <AppLink to={`/medee/${item.id}`} className="ios-card">
                  <div className="ios-card-media">
                    <SharedMedia
                      id={`news-${item.id}`}
                      src={item.image}
                      alt={t(item.titleKey)}
                    />
                    {isNew(item.date) && (
                      <em className="ios-badge">{t("badge_new")}</em>
                    )}
                  </div>
                  <div className="ios-card-body">
                    <span className="ios-meta">
                      {t(item.tagKey)} · {item.date}
                    </span>
                    <h3>{t(item.titleKey)}</h3>
                    <p className="ios-card-desc">{t(item.excerptKey)}</p>
                  </div>
                </AppLink>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}
