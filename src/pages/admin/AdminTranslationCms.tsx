import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import {
  DEFAULT_TRANS_FEATURE_KEYS,
  mergeTranslationFeatures,
  type TranslationFeatureCms,
} from "../../lib/cms";
import { emptyI18nText } from "../../lib/i18nText";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";
import { loc } from "../../lib/i18nText";

export function AdminTranslationCms() {
  const { t, lang } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const seeded = mergeTranslationFeatures(bundle).map((f, i) => {
    const def = DEFAULT_TRANS_FEATURE_KEYS[i];
    if (!def) return f;
    const hasTitle = Boolean(f.title?.mn || f.title?.en || f.title?.zh);
    return {
      ...f,
      id: def.id,
      ico: f.ico || def.ico,
      title: hasTitle
        ? f.title
        : { mn: t(def.t), en: t(def.t), zh: t(def.t) },
      body:
        f.body?.mn || f.body?.en || f.body?.zh
          ? f.body
          : { mn: t(def.d), en: t(def.d), zh: t(def.d) },
    };
  });
  const [rows, setRows] = useState<TranslationFeatureCms[]>(seeded);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    const res = await saveBundle({ ...bundle, translationFeatures: rows });
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_translation")}</h1>
        <p>{t("admin_translation_lead")}</p>
        <button
          type="button"
          className="admin-btn is-seal"
          disabled={busy}
          onClick={() => void save()}
        >
          {t("admin_save")}
        </button>
      </header>
      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      {rows.map((r, i) => (
        <section key={r.id} className="admin-card admin-cms-form">
          <h3>
            #{i + 1} · {loc(lang, t, r.title) || r.ico}
          </h3>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Icon</span>
              <input
                value={r.ico}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, ico: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <MultiLangField
              label={t("admin_title_field")}
              value={r.title || emptyI18nText()}
              onChange={(title) =>
                setRows((prev) =>
                  prev.map((x, idx) => (idx === i ? { ...x, title } : x)),
                )
              }
            />
            <MultiLangField
              label={t("admin_body_field")}
              value={r.body || emptyI18nText()}
              onChange={(body) =>
                setRows((prev) =>
                  prev.map((x, idx) => (idx === i ? { ...x, body } : x)),
                )
              }
              multiline
              rows={3}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
