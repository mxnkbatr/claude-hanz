import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { ImageUpload } from "../../components/admin/ImageUpload";
import {
  mergeKidsLevels,
  mergeKidsSchedules,
  mergeKidsTeachers,
  type KidsLevelCms,
  type KidsScheduleCms,
  type KidsTeacherCms,
} from "../../lib/cms";
import { emptyI18nText } from "../../lib/i18nText";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";

type Tab = "teachers" | "levels" | "schedules";

export function AdminKids() {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [tab, setTab] = useState<Tab>("teachers");
  const [teachers, setTeachers] = useState(() => mergeKidsTeachers(bundle));
  const [levels, setLevels] = useState(() => mergeKidsLevels(bundle));
  const [schedules, setSchedules] = useState(() => mergeKidsSchedules(bundle));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    const res = await saveBundle({
      ...bundle,
      kidsTeachers: teachers,
      kidsLevels: levels,
      kidsSchedules: schedules,
    });
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_kids")}</h1>
        <p>{t("admin_kids_lead")}</p>
        <button
          type="button"
          className="admin-btn is-seal"
          disabled={busy}
          onClick={() => void save()}
        >
          {t("admin_save")}
        </button>
      </header>

      <div className="admin-toolbar">
        {(["teachers", "levels", "schedules"] as Tab[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`admin-btn${tab === k ? " is-seal" : ""}`}
            onClick={() => setTab(k)}
          >
            {t(`admin_kids_${k}`)}
          </button>
        ))}
      </div>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      {tab === "teachers" &&
        teachers.map((tea, i) => (
          <TeacherEditor
            key={tea.id}
            value={tea}
            onChange={(next) =>
              setTeachers((prev) =>
                prev.map((x, idx) => (idx === i ? next : x)),
              )
            }
          />
        ))}

      {tab === "levels" &&
        levels.map((lvl, i) => (
          <LevelEditor
            key={lvl.id}
            value={lvl}
            teachers={teachers}
            onChange={(next) =>
              setLevels((prev) =>
                prev.map((x, idx) => (idx === i ? next : x)),
              )
            }
          />
        ))}

      {tab === "schedules" &&
        schedules.map((sch, i) => (
          <ScheduleEditor
            key={sch.id}
            value={sch}
            onChange={(next) =>
              setSchedules((prev) =>
                prev.map((x, idx) => (idx === i ? next : x)),
              )
            }
          />
        ))}
    </div>
  );
}

function TeacherEditor({
  value,
  onChange,
}: {
  value: KidsTeacherCms;
  onChange: (v: KidsTeacherCms) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="admin-card admin-cms-form">
      <h3>{value.id}</h3>
      <div className="admin-form-grid">
        <MultiLangField
          label={t("admin_title_field")}
          value={value.name || emptyI18nText()}
          onChange={(name) => onChange({ ...value, name })}
        />
        <ImageUpload
          value={value.photo}
          onChange={(photo) => onChange({ ...value, photo })}
          folder="kids"
        />
      </div>
    </section>
  );
}

function LevelEditor({
  value,
  teachers,
  onChange,
}: {
  value: KidsLevelCms;
  teachers: KidsTeacherCms[];
  onChange: (v: KidsLevelCms) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="admin-card admin-cms-form">
      <h3>
        {value.id} · {value.mark}
      </h3>
      <div className="admin-form-grid">
        <MultiLangField
          label={t("kids_form_level")}
          value={value.label || emptyI18nText()}
          onChange={(label) => onChange({ ...value, label })}
        />
        <MultiLangField
          label={t("form_child_age")}
          value={value.age || emptyI18nText()}
          onChange={(age) => onChange({ ...value, age })}
        />
        <MultiLangField
          label={t("admin_body_field")}
          value={value.desc || emptyI18nText()}
          onChange={(desc) => onChange({ ...value, desc })}
          multiline
          rows={2}
        />
        <label className="admin-field">
          <span>{t("kids_teachers_label")}</span>
          <select
            multiple
            value={value.teacherIds}
            onChange={(e) =>
              onChange({
                ...value,
                teacherIds: Array.from(e.target.selectedOptions).map(
                  (o) => o.value,
                ),
              })
            }
            style={{ minHeight: 88 }}
          >
            {teachers.map((tea) => (
              <option key={tea.id} value={tea.id}>
                {tea.id}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function ScheduleEditor({
  value,
  onChange,
}: {
  value: KidsScheduleCms;
  onChange: (v: KidsScheduleCms) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="admin-card admin-cms-form">
      <h3>{value.id}</h3>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Time</span>
          <input
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Day group</span>
          <select
            value={value.dayGroup}
            onChange={(e) =>
              onChange({
                ...value,
                dayGroup: e.target.value as "weekday" | "weekend",
              })
            }
          >
            <option value="weekday">weekday</option>
            <option value="weekend">weekend</option>
          </select>
        </label>
        <MultiLangField
          label={t("admin_title_field")}
          value={value.label || emptyI18nText()}
          onChange={(label) => onChange({ ...value, label })}
        />
        <MultiLangField
          label="Meta"
          value={value.meta || emptyI18nText()}
          onChange={(meta) => onChange({ ...value, meta })}
        />
        <MultiLangField
          label="Days"
          value={value.days || emptyI18nText()}
          onChange={(days) => onChange({ ...value, days })}
        />
      </div>
    </section>
  );
}
