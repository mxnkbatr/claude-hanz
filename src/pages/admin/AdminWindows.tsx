import { useMemo, useState } from "react";
import {
  mergeEnrollWindows,
  type EnrollWindowCms,
} from "../../lib/cms";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";

type Scope = { kind: "travel" | "university"; id: string; label: string };

const SCOPES: Scope[] = [
  { kind: "travel", id: "china", label: "Travel · China" },
  { kind: "travel", id: "poland", label: "Travel · Poland" },
  { kind: "university", id: "china", label: "University · China" },
  { kind: "university", id: "poland", label: "University · Poland" },
];

const STATUSES: EnrollWindowCms["status"][] = ["open", "soon", "closed"];

export function AdminWindows() {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [scopeKey, setScopeKey] = useState("travel:china");
  const scope = SCOPES.find((s) => `${s.kind}:${s.id}` === scopeKey) ?? SCOPES[0];

  const windows = useMemo(
    () => mergeEnrollWindows(bundle, scope.kind, scope.id) ?? [],
    [bundle, scope],
  );
  const [rows, setRows] = useState<EnrollWindowCms[]>(windows);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function loadScope(nextKey: string) {
    setScopeKey(nextKey);
    const s = SCOPES.find((x) => `${x.kind}:${x.id}` === nextKey) ?? SCOPES[0];
    setRows(mergeEnrollWindows(bundle, s.kind, s.id) ?? []);
    setMsg("");
  }

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    const enrollWindows = {
      ...(bundle.enrollWindows || {}),
      [scope.kind]: {
        ...(bundle.enrollWindows?.[scope.kind] || {}),
        [scope.id]: rows,
      },
    };
    const res = await saveBundle({ ...bundle, enrollWindows });
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  function updateRow(i: number, patch: Partial<EnrollWindowCms>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_windows")}</h1>
        <p>{t("admin_windows_lead")}</p>
      </header>

      <div className="admin-toolbar">
        <select value={scopeKey} onChange={(e) => loadScope(e.target.value)}>
          {SCOPES.map((s) => (
            <option key={`${s.kind}:${s.id}`} value={`${s.kind}:${s.id}`}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn is-seal"
          disabled={busy}
          onClick={() => void save()}
        >
          {t("admin_save")}
        </button>
      </div>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>labelKey</th>
              <th>dateKey</th>
              <th>{t("admin_status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  <input
                    value={r.labelKey}
                    onChange={(e) => updateRow(i, { labelKey: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={r.dateKey}
                    onChange={(e) => updateRow(i, { dateKey: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateRow(i, {
                        status: e.target.value as EnrollWindowCms["status"],
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`uni_status_${s === "closed" ? "closed" : s === "soon" ? "soon" : "open"}`)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
