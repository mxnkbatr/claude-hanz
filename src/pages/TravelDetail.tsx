import { Link, Navigate, useParams } from "react-router-dom";
import { getTravelById, uniEnrollStatusKey } from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";

export function TravelDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const { travelLive } = useSiteContent();
  const pack = travelLive.find((x) => x.id === id) ?? getTravelById(id);

  if (!pack) return <Navigate to="/travel" replace />;

  const meta = getTravelById(pack.id);
  const windows = meta?.enrollWindows ?? [];
  const other = travelLive.find((x) => x.id !== pack.id);
  const interest = pack.id === "china" ? "travel_china" : "travel_poland";
  const enrollTo = `/enroll?interest=${interest}`;
  const hasOpen = windows.some((w) => w.status === "open");

  const paragraphs = t(pack.bodyKey)
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-travel is-app ios-app has-enroll-dock">
      <Reveal>
        <Link to="/travel" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="app-detail">
        <Reveal>
          <div className="app-detail-hero">
            <SafeImage
              src={pack.image}
              alt={t(pack.titleKey)}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="app-detail-body">
            <div className="app-detail-topline">
              <p className="app-pill">{t(pack.tagKey)}</p>
              {hasOpen && (
                <span className="uni-enroll-status is-open">
                  {t("uni_status_open")}
                </span>
              )}
            </div>

            <h1 className="h1">{t(pack.titleKey)}</h1>
            <p className="app-sub">{t(pack.descKey)}</p>

            <div className="uni-detail-copy">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 28)}>{p}</p>
              ))}
            </div>

            <section className="uni-enroll app-ios-group">
              <div className="uni-enroll-head">
                <h2>{t("detail_more")}</h2>
              </div>
              <ul className="app-ios-points">
                {pack.highlights.map((h) => (
                  <li key={h}>{t(h)}</li>
                ))}
              </ul>
            </section>

            {windows.length > 0 && (
              <section
                className="uni-enroll"
                aria-labelledby="travel-enroll-title"
              >
                <div className="uni-enroll-head">
                  <h2 id="travel-enroll-title">{t("travel_enroll_title")}</h2>
                  <p>{t("travel_enroll_lead")}</p>
                </div>
                <ul className="uni-enroll-list">
                  {windows.map((w) => (
                    <li
                      key={w.id}
                      className={`uni-enroll-row is-${w.status}`}
                    >
                      <div className="uni-enroll-row-main">
                        <strong>{t(w.labelKey)}</strong>
                        <em>{t(w.dateKey)}</em>
                      </div>
                      <span className={`uni-enroll-status is-${w.status}`}>
                        {t(uniEnrollStatusKey(w.status))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
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

      <div className="app-enroll-dock">
        <div className="app-enroll-dock-copy">
          <strong>{t("travel_cta")}</strong>
          <em>
            {hasOpen
              ? t("uni_status_open")
              : t("uni_status_soon")}
          </em>
        </div>
        <Link
          to={enrollTo}
          className="btn btn-seal app-enroll-dock-btn"
          onClick={() => void hapticLight()}
        >
          <span>{t("uni_enroll_cta")}</span>
        </Link>
      </div>
    </PageShell>
  );
}
