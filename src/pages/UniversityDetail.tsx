import { Link, Navigate, useParams } from "react-router-dom";
import {
  getUniversityById,
  uniEnrollStatusKey,
  universitiesMeta,
} from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

export function UniversityDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const u = getUniversityById(id);

  if (!u) return <Navigate to="/university" replace />;

  const other = universitiesMeta.find((x) => x.id !== u.id);
  const hasOpen = u.enrollWindows.some((w) => w.status === "open");
  const enrollTo = `/enroll?interest=consult&uni=${u.id}`;

  const bodyParas = t(u.bodyKey)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-uni is-app ios-app has-enroll-dock">
      <Reveal>
        <Link to="/university" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="app-detail">
        <Reveal>
          <div className="app-detail-hero">
            <SafeImage src={u.image} alt={t(u.titleKey)} loading="eager" />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="app-detail-body">
            <div className="app-detail-topline">
              <p className="app-pill">{t(u.countryKey)}</p>
              {hasOpen && (
                <span className="uni-enroll-status is-open">
                  {t("uni_status_open")}
                </span>
              )}
            </div>
            <h1 className="h1">{t(u.titleKey)}</h1>
            <p className="app-sub">{t(u.descKey)}</p>

            <ul className="app-chips">
              {u.points.map((p) => (
                <li key={p}>{t(p)}</li>
              ))}
            </ul>

            {bodyParas.length > 0 && (
              <div className="uni-detail-copy">
                {bodyParas.map((p) => (
                  <p key={p.slice(0, 28)}>{p}</p>
                ))}
              </div>
            )}

            <section className="uni-enroll" aria-labelledby="uni-enroll-title">
              <div className="uni-enroll-head">
                <h2 id="uni-enroll-title">{t("uni_enroll_title")}</h2>
                <p>{t("uni_enroll_lead")}</p>
              </div>

              <ul className="uni-enroll-list">
                {u.enrollWindows.map((w) => (
                  <li
                    key={w.id}
                    className={`uni-enroll-row is-${w.status}`}
                  >
                    <div className="uni-enroll-row-main">
                      <strong>{t(w.labelKey)}</strong>
                      <em>{t(w.dateKey)}</em>
                    </div>
                    <span
                      className={`uni-enroll-status is-${w.status}`}
                    >
                      {t(uniEnrollStatusKey(w.status))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Reveal>
      </article>

      {other && (
        <Reveal delay={0.08}>
          <Link
            to={`/university/${other.id}`}
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
          <strong>
            {hasOpen ? t("uni_enroll_cta") : t("uni_cta")}
          </strong>
          <em>
            {hasOpen ? t("uni_status_open") : t("uni_status_soon")}
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
