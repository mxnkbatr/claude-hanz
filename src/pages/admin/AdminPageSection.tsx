import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  coursesMeta,
  newsIds,
  shopProductsMeta,
  travelPackagesMeta,
  universitiesMeta,
} from "../../data/content";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";
import { ADMIN_PAGES } from "../../lib/cms";

export function AdminPageSection() {
  const { section = "home" } = useParams();
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const meta = ADMIN_PAGES.find((p) => p.id === section);

  async function persist(next: typeof bundle) {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await saveBundle(next);
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  const note = bundle.notes?.[section] || "";

  const body = useMemo(() => {
    if (section === "news") {
      return (
        <div className="admin-list">
          {newsIds.map((n) => {
            const o = bundle.news?.[n.id] || {};
            return (
              <article key={n.id} className="admin-item-card">
                <strong>{t(n.titleKey)}</strong>
                <label>
                  <span>{t("admin_date")}</span>
                  <input
                    defaultValue={o.date || n.date}
                    onBlur={(e) => {
                      const date = e.target.value.trim();
                      void persist({
                        ...bundle,
                        news: {
                          ...bundle.news,
                          [n.id]: { ...o, date },
                        },
                      });
                    }}
                  />
                </label>
                <label>
                  <span>{t("admin_image_url")}</span>
                  <input
                    defaultValue={o.image || n.image}
                    onBlur={(e) => {
                      const image = e.target.value.trim();
                      void persist({
                        ...bundle,
                        news: {
                          ...bundle.news,
                          [n.id]: { ...o, image },
                        },
                      });
                    }}
                  />
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(o.hidden)}
                    onChange={(e) =>
                      void persist({
                        ...bundle,
                        news: {
                          ...bundle.news,
                          [n.id]: { ...o, hidden: e.target.checked },
                        },
                      })
                    }
                  />
                  <span>{t("admin_hide")}</span>
                </label>
              </article>
            );
          })}
        </div>
      );
    }

    if (section === "shop") {
      return (
        <div className="admin-list">
          {shopProductsMeta.map((p) => {
            const o = bundle.products?.[p.id] || {};
            return (
              <article key={p.id} className="admin-item-card">
                <strong>{t(p.titleKey)}</strong>
                <label>
                  <span>{t("admin_price")}</span>
                  <input
                    type="number"
                    defaultValue={o.price ?? p.price}
                    onBlur={(e) => {
                      const price = Number(e.target.value) || p.price;
                      void persist({
                        ...bundle,
                        products: {
                          ...bundle.products,
                          [p.id]: { ...o, price },
                        },
                      });
                    }}
                  />
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={o.inStock ?? p.inStock}
                    onChange={(e) =>
                      void persist({
                        ...bundle,
                        products: {
                          ...bundle.products,
                          [p.id]: { ...o, inStock: e.target.checked },
                        },
                      })
                    }
                  />
                  <span>{t("in_stock")}</span>
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(o.hidden)}
                    onChange={(e) =>
                      void persist({
                        ...bundle,
                        products: {
                          ...bundle.products,
                          [p.id]: { ...o, hidden: e.target.checked },
                        },
                      })
                    }
                  />
                  <span>{t("admin_hide")}</span>
                </label>
              </article>
            );
          })}
        </div>
      );
    }

    if (section === "courses") {
      const hidden = new Set(bundle.hiddenCourses ?? []);
      return (
        <div className="admin-list">
          {coursesMeta.map((c) => (
            <article key={c.id} className="admin-item-card is-row">
              <strong>{t(c.titleKey)}</strong>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={hidden.has(c.id)}
                  onChange={(e) => {
                    const next = new Set(hidden);
                    if (e.target.checked) next.add(c.id);
                    else next.delete(c.id);
                    void persist({
                      ...bundle,
                      hiddenCourses: Array.from(next),
                    });
                  }}
                />
                <span>{t("admin_hide")}</span>
              </label>
            </article>
          ))}
        </div>
      );
    }

    if (section === "travel") {
      const hidden = new Set(bundle.hiddenTravel ?? []);
      return (
        <div className="admin-list">
          {travelPackagesMeta.map((c) => (
            <article key={c.id} className="admin-item-card is-row">
              <strong>{t(c.titleKey)}</strong>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={hidden.has(c.id)}
                  onChange={(e) => {
                    const next = new Set(hidden);
                    if (e.target.checked) next.add(c.id);
                    else next.delete(c.id);
                    void persist({
                      ...bundle,
                      hiddenTravel: Array.from(next),
                    });
                  }}
                />
                <span>{t("admin_hide")}</span>
              </label>
            </article>
          ))}
        </div>
      );
    }

    if (section === "university") {
      const hidden = new Set(bundle.hiddenUniversity ?? []);
      return (
        <div className="admin-list">
          {universitiesMeta.map((c) => (
            <article key={c.id} className="admin-item-card is-row">
              <strong>{t(c.titleKey)}</strong>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={hidden.has(c.id)}
                  onChange={(e) => {
                    const next = new Set(hidden);
                    if (e.target.checked) next.add(c.id);
                    else next.delete(c.id);
                    void persist({
                      ...bundle,
                      hiddenUniversity: Array.from(next),
                    });
                  }}
                />
                <span>{t("admin_hide")}</span>
              </label>
            </article>
          ))}
        </div>
      );
    }

    return (
      <div className="admin-card">
        <p>{t("admin_section_note_help")}</p>
        <label>
          <span>{t("admin_internal_note")}</span>
          <textarea
            rows={5}
            defaultValue={note}
            onBlur={(e) => {
              const value = e.target.value;
              void persist({
                ...bundle,
                notes: { ...bundle.notes, [section]: value },
              });
            }}
          />
        </label>
        {section === "quiz" && <p className="admin-hint">{t("admin_quiz_hint")}</p>}
        {(section === "contact" || section === "about" || section === "home") && (
          <p className="admin-hint">
            {t("admin_settings_hint")}{" "}
            <Link to="/admin/settings">{t("admin_settings")}</Link>
          </p>
        )}
      </div>
    );
  }, [section, bundle, t, note]);

  return (
    <div className="admin-page">
      <header className="admin-head">
        <p className="admin-crumb">
          <Link to="/admin/pages">{t("admin_pages")}</Link> /{" "}
          {meta ? t(meta.key) : section}
        </p>
        <h1>{meta ? t(meta.key) : section}</h1>
        <p>{t("admin_section_lead")}</p>
        {meta && (
          <a className="admin-btn" href={meta.to} target="_blank" rel="noreferrer">
            {t("admin_preview")}
          </a>
        )}
      </header>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}
      {busy && <p className="admin-hint">{t("form_sending")}</p>}

      {body}
    </div>
  );
}
