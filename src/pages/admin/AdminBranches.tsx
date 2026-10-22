import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { emptyI18nText, type I18nText } from "../../lib/i18nText";
import {
  mergeBranches,
  type BranchCms,
} from "../../lib/cms";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";
import { loc } from "../../lib/i18nText";

export function AdminBranches() {
  const { t, lang } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [rows, setRows] = useState<BranchCms[]>(() => mergeBranches(bundle));
  const [draft, setDraft] = useState<BranchCms | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function openNew() {
    setDraft({
      id: `b-${Date.now().toString(36)}`,
      title: emptyI18nText(),
      address: emptyI18nText(),
      phones: [""],
      phoneDisplay: [""],
    });
  }

  async function persist(next: BranchCms[]) {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await saveBundle({ ...bundle, branches: next });
    setBusy(false);
    if (res.error) setErr(res.error);
    else {
      setRows(next);
      setMsg(t("admin_saved"));
      setDraft(null);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    const cleaned: BranchCms = {
      ...draft,
      phones: draft.phones.map((p) => p.replace(/\D/g, "")).filter(Boolean),
      phoneDisplay: draft.phoneDisplay.filter(Boolean),
    };
    const idx = rows.findIndex((r) => r.id === cleaned.id);
    const next =
      idx >= 0
        ? rows.map((r, i) => (i === idx ? cleaned : r))
        : [...rows, cleaned];
    await persist(next);
  }

  async function remove(id: string) {
    if (!confirm(t("admin_delete_confirm"))) return;
    await persist(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_branches")}</h1>
        <p>{t("admin_branches_lead")}</p>
        <button type="button" className="admin-btn is-seal" onClick={openNew}>
          + {t("admin_add")}
        </button>
      </header>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      {draft && (
        <section className="admin-card admin-cms-form">
          <div className="admin-card-head">
            <h2>{t("admin_edit")}</h2>
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={() => setDraft(null)}
            >
              {t("admin_cancel")}
            </button>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>ID / slug</span>
              <input
                value={draft.id}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              />
            </label>
            <MultiLangField
              label={t("admin_title_field")}
              value={draft.title}
              onChange={(title: I18nText) => setDraft({ ...draft, title })}
            />
            <MultiLangField
              label={t("footer_address")}
              value={draft.address}
              onChange={(address: I18nText) => setDraft({ ...draft, address })}
              multiline
              rows={3}
            />
            <label className="admin-field">
              <span>{t("form_phone")} (raw, comma)</span>
              <input
                value={draft.phones.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    phones: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            </label>
            <label className="admin-field">
              <span>{t("form_phone")} (display, comma)</span>
              <input
                value={draft.phoneDisplay.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    phoneDisplay: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            </label>
          </div>
          <button
            type="button"
            className="admin-btn is-seal"
            disabled={busy}
            onClick={() => void saveDraft()}
          >
            {t("admin_save")}
          </button>
        </section>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("admin_title_field")}</th>
              <th>{t("form_phone")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{loc(lang, t, r.title, r.titleKey) || "—"}</td>
                <td>{r.phoneDisplay.join(", ")}</td>
                <td className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setDraft({ ...r })}
                  >
                    {t("admin_edit")}
                  </button>
                  <button
                    type="button"
                    className="admin-btn is-danger"
                    onClick={() => void remove(r.id)}
                  >
                    {t("admin_delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
