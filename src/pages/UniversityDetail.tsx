import { Link, Navigate, useParams } from "react-router-dom";
import {
  getUniversityById,
  universitiesMeta,
} from "../data/content";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";

export function UniversityDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const u = getUniversityById(id);

  if (!u) return <Navigate to="/university" replace />;

  const other = universitiesMeta.find((x) => x.id !== u.id);
  const paragraphs = t(u.bodyKey).split("\n").filter(Boolean);

  return (
    <PageShell className="page-detail page-uni">
      <Reveal>
        <Link to="/university" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <article className="uni-detail">
        <Reveal>
          <div className="uni-detail-hero">
            <SafeImage src={u.image} alt={t(u.titleKey)} loading="eager" />
            <div className="uni-detail-hero-copy">
              <span className="uni-flag">{t(u.countryKey)}</span>
              <h1 className="h1">{t(u.titleKey)}</h1>
              <p className="lead">{t(u.descKey)}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="uni-detail-body">
            <div className="detail-panel">
              <p className="eyebrow">{t("detail_more")}</p>
              {paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="detail-copy">
                  {p}
                </p>
              ))}
            </div>

            <ul className="uni-points">
              {u.points.map((p) => (
                <li key={p}>
                  <i aria-hidden>◇</i>
                  <span>{t(p)}</span>
                </li>
              ))}
            </ul>

            <div className="article-actions">
              <Link to="/contact" className="btn btn-seal">
                <span>{t("uni_cta")}</span>
              </Link>
              <Link to="/university" className="btn btn-ink">
                <span>{t("nav_uni")}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </article>

      {other && (
        <Reveal delay={0.1}>
          <section className="related-block">
            <h2 className="h2">{t("related")}</h2>
            <Link to={`/university/${other.id}`} className="uni-card uni-card-mini">
              <div className="uni-media">
                <SafeImage src={other.image} alt={t(other.titleKey)} />
                <span>{t(other.countryKey)}</span>
              </div>
              <div className="uni-body">
                <h3>{t(other.titleKey)}</h3>
                <p>{t(other.descKey)}</p>
                <em className="card-cta">
                  {t("view_detail")} <i aria-hidden>→</i>
                </em>
              </div>
            </Link>
          </section>
        </Reveal>
      )}
    </PageShell>
  );
}
