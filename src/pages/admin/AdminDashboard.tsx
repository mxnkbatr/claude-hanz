import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ADMIN_PAGES, type EnrollmentRow } from "../../lib/cms";
import { useI18n } from "../../i18n/I18nContext";

const pageMarks: Record<string, string> = {
  home: "汉",
  courses: "课",
  news: "新",
  university: "学",
  travel: "✈",
  shop: "店",
  quiz: "测",
  about: "院",
  contact: "☎",
  enroll: "✓",
};

export function AdminDashboard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    void supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (error) {
          setErr(error.message);
          return;
        }
        setRows((data as EnrollmentRow[]) ?? []);
      });
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const neu = rows.filter((r) => (r.status || "new") === "new").length;
    const course = rows.filter((r) => r.kind === "course").length;
    const travel = rows.filter((r) => r.kind === "travel").length;
    const consult = rows.filter((r) => r.kind === "consult").length;
    return { total, neu, course, travel, consult };
  }, [rows]);

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_dash")}</h1>
        <p>{t("admin_dash_lead")}</p>
      </header>

      {err && <p className="admin-err">{err}</p>}

      <div className="admin-stats">
        <article>
          <em>{t("admin_stat_total")}</em>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <em>{t("admin_stat_new")}</em>
          <strong>{stats.neu}</strong>
        </article>
        <article>
          <em>{t("nav_courses")}</em>
          <strong>{stats.course}</strong>
        </article>
        <article>
          <em>{t("nav_travel")}</em>
          <strong>{stats.travel}</strong>
        </article>
        <article>
          <em>{t("enroll_interest_consult")}</em>
          <strong>{stats.consult}</strong>
        </article>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{t("admin_pages")}</h2>
          <Link to="/admin/pages">{t("admin_manage")}</Link>
        </div>
        <div className="admin-page-grid">
          {ADMIN_PAGES.map((p) => (
            <div key={p.id} className="admin-page-tile">
              <span className="admin-page-tile-mark" aria-hidden>
                {pageMarks[p.id] || "·"}
              </span>
              <strong>{t(p.key)}</strong>
              <div className="admin-page-tile-actions">
                <Link to={p.adminTo} className="admin-btn is-seal">
                  {t("admin_manage")}
                </Link>
                <a className="admin-btn" href={p.to} target="_blank" rel="noreferrer">
                  {t("admin_preview")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{t("admin_recent_leads")}</h2>
          <Link to="/admin/leads">{t("admin_all_leads")}</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("form_name")}</th>
                <th>{t("form_phone")}</th>
                <th>{t("form_interest")}</th>
                <th>{t("admin_status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    <a href={`tel:${r.phone}`}>{r.phone}</a>
                  </td>
                  <td>{r.interest}</td>
                  <td>
                    <span className={`admin-badge is-${r.status || "new"}`}>
                      {t(`admin_status_${r.status || "new"}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4}>{t("admin_empty_leads")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
