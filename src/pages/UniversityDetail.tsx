import { Link, Navigate, useParams } from "react-router-dom";
import { getUniversityById, universitiesMeta } from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";

export function UniversityDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const u = getUniversityById(id);

  if (!u) return <Navigate to="/university" replace />;

  const other = universitiesMeta.find((x) => x.id !== u.id);

  return (
    <PageShell className="page-detail page-uni is-app">
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
            <p className="app-pill">{t(u.countryKey)}</p>
            <h1 className="h1">{t(u.titleKey)}</h1>
            <p className="app-sub">{t(u.descKey)}</p>

            <ul className="app-chips">
              {u.points.map((p) => (
                <li key={p}>{t(p)}</li>
              ))}
            </ul>

            <div className="app-sticky-actions">
              <Link to="/enroll?interest=consult" className="btn btn-seal">
                <span>{t("uni_cta")}</span>
              </Link>
            </div>
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
    </PageShell>
  );
}
