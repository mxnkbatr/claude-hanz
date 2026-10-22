import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { mergeQuizQuestions, type QuizQuestionCms } from "../../lib/cms";
import { emptyI18nText } from "../../lib/i18nText";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";

export function AdminQuizCms() {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [rows, setRows] = useState<QuizQuestionCms[]>(() =>
    mergeQuizQuestions(bundle),
  );
  const [filter, setFilter] = useState<"all" | "hsk1" | "hsk2" | "hsk3">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = rows.filter((r) => {
    if (filter !== "all" && r.level !== filter) return false;
    const hay = `${r.hanzi} ${r.pinyin} ${r.id}`.toLowerCase();
    return !q.trim() || hay.includes(q.trim().toLowerCase());
  });

  async function save() {
    setBusy(true);
    setErr("");
    const res = await saveBundle({ ...bundle, quizQuestions: rows });
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  function addQuestion() {
    const id = `q-${Date.now().toString(36)}`;
    const next: QuizQuestionCms = {
      id,
      level: "hsk1",
      kind: "meaning",
      hanzi: "",
      pinyin: "",
      options: [
        emptyI18nText(),
        emptyI18nText(),
        emptyI18nText(),
        emptyI18nText(),
      ],
      correct: 0,
    };
    setRows((prev) => [next, ...prev]);
    setOpenId(id);
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_quiz")}</h1>
        <p>{t("admin_quiz_lead")}</p>
        <div className="admin-toolbar" style={{ marginTop: 8 }}>
          <button type="button" className="admin-btn" onClick={addQuestion}>
            + {t("admin_add")}
          </button>
          <button
            type="button"
            className="admin-btn is-seal"
            disabled={busy}
            onClick={() => void save()}
          >
            {t("admin_save")}
          </button>
        </div>
      </header>

      <div className="admin-toolbar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="汉字 / pinyin…"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">{t("filter_all")}</option>
          <option value="hsk1">HSK 1</option>
          <option value="hsk2">HSK 2</option>
          <option value="hsk3">HSK 3</option>
        </select>
      </div>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}
      <p className="admin-muted">
        {list.length}/{rows.length}
      </p>

      {list.map((r) => {
        const i = rows.findIndex((x) => x.id === r.id);
        const open = openId === r.id;
        return (
          <section key={r.id} className="admin-card admin-cms-form">
            <div className="admin-card-head">
              <h3>
                {r.hanzi || r.id} · {r.level} · {r.kind}
              </h3>
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() => setOpenId(open ? null : r.id)}
              >
                {open ? t("admin_cancel") : t("admin_edit")}
              </button>
            </div>
            {open && i >= 0 && (
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>汉字</span>
                  <input
                    value={r.hanzi}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, hanzi: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Pinyin</span>
                  <input
                    value={r.pinyin}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, pinyin: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Level</span>
                  <select
                    value={r.level}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, idx) =>
                          idx === i
                            ? {
                                ...x,
                                level: e.target.value as QuizQuestionCms["level"],
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="hsk1">hsk1</option>
                    <option value="hsk2">hsk2</option>
                    <option value="hsk3">hsk3</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Correct index (0–3)</span>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={r.correct}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, idx) =>
                          idx === i
                            ? { ...x, correct: Number(e.target.value) || 0 }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
                {r.options.map((opt, oi) => (
                  <MultiLangField
                    key={oi}
                    label={`Option ${oi + 1}`}
                    value={opt || emptyI18nText()}
                    onChange={(next) =>
                      setRows((prev) =>
                        prev.map((x, idx) => {
                          if (idx !== i) return x;
                          const options = [...x.options];
                          options[oi] = next;
                          return { ...x, options };
                        }),
                      )
                    }
                  />
                ))}
                <button
                  type="button"
                  className="admin-btn is-danger"
                  onClick={() => {
                    setRows((prev) => prev.filter((x) => x.id !== r.id));
                    setOpenId(null);
                  }}
                >
                  {t("admin_delete")}
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
