import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { kidsLevels, kidsSchedules } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SuccessBurst } from "../components/SuccessBurst";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { supabase } from "../lib/supabase";
import { hapticLight } from "../lib/native";

type Step = "levels" | "enroll";

export function Courses() {
  const { t } = useI18n();
  const { coursesLive } = useSiteContent();
  const otherCourses = coursesLive.filter((c) => c.id !== "kids");

  const [step, setStep] = useState<Step>("levels");
  const [level, setLevel] = useState<string>("");
  const [schedule, setSchedule] = useState<string>(kidsSchedules[0].id);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  const levelMeta = kidsLevels.find((l) => l.id === level);

  function pickLevel(id: string) {
    setLevel(id);
    setSchedule(kidsSchedules[0].id);
    setStep("enroll");
    setStatus("idle");
    void hapticLight();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToLevels() {
    setStep("levels");
    setStatus("idle");
    void hapticLight();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parentName = String(data.get("parent_name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const childName = String(data.get("child_name") || "").trim();
    const childAge = String(data.get("child_age") || "").trim();
    const note = String(data.get("msg") || "").trim();

    if (!parentName || !phone || !childName || !level || !schedule) return;

    const schMeta = kidsSchedules.find((s) => s.id === schedule);
    const message = [
      `${t("kids_form_child")}: ${childName}`,
      `${t("kids_form_level")}: ${levelMeta ? t(levelMeta.labelKey) : level}`,
      `${t("kids_form_schedule")}: ${schMeta ? t(schMeta.labelKey) : schedule}`,
      note ? `${t("form_msg")}: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setStatus("sending");
    void hapticLight();
    const { error } = await supabase.from("enrollments").insert({
      name: parentName,
      phone,
      kind: "course",
      interest: "kids",
      child_age: childAge || null,
      message,
    });

    if (error) {
      console.error("[kids-enroll]", error);
      setStatus("err");
      return;
    }
    setStatus("ok");
    e.currentTarget.reset();
  }

  return (
    <PageShell className="page-courses is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          {step === "enroll" ? (
            <button
              type="button"
              className="text-link back-link kids-back-link"
              onClick={backToLevels}
            >
              ← {t("kids_back_levels")}
            </button>
          ) : null}
          <h1 className="h1">
            {step === "levels"
              ? t("kids_enroll_title")
              : levelMeta
                ? t(levelMeta.labelKey)
                : t("kids_enroll_title")}
          </h1>
          <p className="lead desk-only">
            {step === "levels" ? t("kids_levels_lead") : t("kids_enroll_lead")}
          </p>
        </Reveal>
      </header>

      {status === "ok" ? (
        <Reveal>
          <div className="kids-enroll-success">
            <SuccessBurst
              title={t("form_success_title")}
              message={t("kids_enroll_ok")}
              doneLabel={t("kids_enroll_again")}
              onDone={() => {
                setStatus("idle");
                setStep("levels");
                setLevel("");
              }}
            />
          </div>
        </Reveal>
      ) : step === "levels" ? (
        <>
          {/* Mobile iOS list */}
          <section className="section tight app-mobile">
            <Reveal>
              <h2 className="ios-label">{t("kids_pick_level")}</h2>
            </Reveal>
            <div className="ios-list kids-ios-list">
              {kidsLevels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className="ios-row"
                  onClick={() => pickLevel(l.id)}
                >
                  <span className="ios-row-icon" aria-hidden>
                    {l.mark}
                  </span>
                  <span className="ios-row-body">
                    <strong>{t(l.labelKey)}</strong>
                    <em>
                      {t(l.ageKey)} · {t(l.descKey)}
                    </em>
                  </span>
                  <span className="ios-row-chevron" aria-hidden>
                    ›
                  </span>
                </button>
              ))}
            </div>

            <Reveal>
              <Link to="/quiz" className="app-row app-related courses-quiz-teaser">
                <span className="app-row-icon" aria-hidden>
                  测
                </span>
                <span className="app-row-body">
                  <strong>{t("quiz_title")}</strong>
                  <em>{t("quiz_lead")}</em>
                </span>
                <span className="app-row-chevron" aria-hidden>
                  ›
                </span>
              </Link>
            </Reveal>

            {otherCourses.length > 0 && (
              <>
                <Reveal>
                  <h2 className="ios-label">{t("kids_other_courses")}</h2>
                </Reveal>
                <div className="ios-list kids-ios-list">
                  {otherCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/enroll?interest=${c.id}`}
                      className="ios-row"
                      onClick={() => void hapticLight()}
                    >
                      <span className="ios-row-icon" aria-hidden>
                        {c.icon}
                      </span>
                      <span className="ios-row-body">
                        <strong>{t(c.titleKey)}</strong>
                        <em>{t(c.descKey)}</em>
                      </span>
                      <span className="ios-row-chevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Desktop cards */}
          <section className="section tight desk-only">
            <Reveal>
              <div className="ios-section-head kids-levels-head">
                <h2>{t("kids_pick_level")}</h2>
                <em>{kidsLevels.length}</em>
              </div>
            </Reveal>
            <Stagger className="kids-catalog">
              {kidsLevels.map((l) => (
                <StaggerItem key={l.id}>
                  <button
                    type="button"
                    className="kids-catalog-card"
                    onClick={() => pickLevel(l.id)}
                  >
                    <em className="kids-level-mark" aria-hidden>
                      {l.mark}
                    </em>
                    <span className="kids-catalog-body">
                      <strong>{t(l.labelKey)}</strong>
                      <span className="kids-level-age">{t(l.ageKey)}</span>
                      <p>{t(l.descKey)}</p>
                      <span className="kids-catalog-cta">
                        {t("kids_choose_level")} <i aria-hidden>→</i>
                      </span>
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {otherCourses.length > 0 && (
            <section className="section tight section-last desk-only">
              <Reveal>
                <h2 className="app-section-title">{t("kids_other_courses")}</h2>
                <p className="lead kids-other-lead">{t("courses_lead")}</p>
              </Reveal>
              <Stagger className="kids-other-grid">
                {otherCourses.map((c) => (
                  <StaggerItem key={c.id}>
                    <Link
                      to={`/enroll?interest=${c.id}`}
                      className="kids-other-card"
                      onClick={() => void hapticLight()}
                    >
                      <span className="kids-other-icon" aria-hidden>
                        {c.icon}
                      </span>
                      <span className="kids-other-tag">{t(c.tagKey)}</span>
                      <h3>{t(c.titleKey)}</h3>
                      <p>{t(c.descKey)}</p>
                      <span className="card-cta">
                        {t("register_cta")} <i aria-hidden>→</i>
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}
        </>
      ) : (
        <section className="section tight section-last kids-enroll">
          {/* Mobile iOS enroll */}
          <div className="app-mobile kids-ios-enroll">
            {levelMeta && (
              <Reveal>
                <div className="ios-profile-hero kids-ios-picked">
                  <div className="ios-profile-avatar" aria-hidden>
                    {levelMeta.mark}
                  </div>
                  <div>
                    <strong>{t(levelMeta.labelKey)}</strong>
                    <em>{t(levelMeta.ageKey)}</em>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="ios-label">{t("kids_pick_schedule")}</h2>
              <div className="ios-list kids-ios-list">
                {kidsSchedules.map((s) => {
                  const active = schedule === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`ios-row${active ? " is-selected" : ""}`}
                      onClick={() => {
                        setSchedule(s.id);
                        void hapticLight();
                      }}
                    >
                      <span className="ios-row-body">
                        <strong>{t(s.labelKey)}</strong>
                        <em>{t(s.metaKey)}</em>
                      </span>
                      <span className="kids-ios-check" aria-hidden>
                        {active ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal>
              <h2 className="ios-label">{t("kids_form_title")}</h2>
              <form className="kids-ios-form" onSubmit={onSubmit}>
                <div className="ios-list kids-ios-form-list">
                  <label className="kids-ios-field">
                    <span>{t("kids_form_parent")}</span>
                    <input name="parent_name" required autoComplete="name" />
                  </label>
                  <label className="kids-ios-field">
                    <span>{t("form_phone")}</span>
                    <input name="phone" type="tel" required autoComplete="tel" />
                  </label>
                  <label className="kids-ios-field">
                    <span>{t("kids_form_child")}</span>
                    <input name="child_name" required autoComplete="off" />
                  </label>
                  <label className="kids-ios-field">
                    <span>{t("form_child_age")}</span>
                    <input
                      name="child_age"
                      inputMode="numeric"
                      placeholder="7–14"
                      required
                    />
                  </label>
                  <label className="kids-ios-field kids-ios-field-area">
                    <span>{t("form_msg")}</span>
                    <textarea
                      name="msg"
                      rows={3}
                      placeholder={t("kids_form_msg_ph")}
                    />
                  </label>
                </div>

                {status === "err" && <p className="form-err">{t("form_err")}</p>}

                <button
                  type="submit"
                  className="btn btn-seal kids-enroll-submit"
                  disabled={status === "sending"}
                >
                  <span>
                    {status === "sending"
                      ? t("form_sending")
                      : t("kids_enroll_cta")}
                  </span>
                </button>
                <p className="kids-enroll-note">{t("kids_enroll_note")}</p>
              </form>
            </Reveal>
          </div>

          {/* Desktop enroll panel */}
          <Reveal className="desk-only">
            <div className="kids-enroll-panel">
              {levelMeta && (
                <div className="kids-enroll-picked">
                  <em className="kids-level-mark" aria-hidden>
                    {levelMeta.mark}
                  </em>
                  <div>
                    <strong>{t(levelMeta.labelKey)}</strong>
                    <span>{t(levelMeta.ageKey)}</span>
                  </div>
                </div>
              )}

              <div className="kids-enroll-step">
                <p className="kids-enroll-label">
                  <span>1</span>
                  {t("kids_pick_schedule")}
                </p>
                <div className="kids-schedule-grid" role="listbox">
                  {kidsSchedules.map((s) => {
                    const active = schedule === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`kids-schedule-card${active ? " is-active" : ""}`}
                        onClick={() => {
                          setSchedule(s.id);
                          void hapticLight();
                        }}
                      >
                        <strong>{t(s.labelKey)}</strong>
                        <em>{t(s.metaKey)}</em>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form className="kids-enroll-form" onSubmit={onSubmit}>
                <p className="kids-enroll-label">
                  <span>2</span>
                  {t("kids_form_title")}
                </p>
                <div className="kids-enroll-fields">
                  <label>
                    <span>{t("kids_form_parent")}</span>
                    <input name="parent_name" required autoComplete="name" />
                  </label>
                  <label>
                    <span>{t("form_phone")}</span>
                    <input name="phone" type="tel" required autoComplete="tel" />
                  </label>
                  <label>
                    <span>{t("kids_form_child")}</span>
                    <input name="child_name" required autoComplete="off" />
                  </label>
                  <label>
                    <span>{t("form_child_age")}</span>
                    <input
                      name="child_age"
                      inputMode="numeric"
                      placeholder="7–14"
                      required
                    />
                  </label>
                  <label className="kids-enroll-msg">
                    <span>{t("form_msg")}</span>
                    <textarea
                      name="msg"
                      rows={3}
                      placeholder={t("kids_form_msg_ph")}
                    />
                  </label>
                </div>
                {status === "err" && <p className="form-err">{t("form_err")}</p>}
                <button
                  type="submit"
                  className="btn btn-seal kids-enroll-submit"
                  disabled={status === "sending"}
                >
                  <span>
                    {status === "sending"
                      ? t("form_sending")
                      : t("kids_enroll_cta")}
                  </span>
                </button>
                <p className="kids-enroll-note">{t("kids_enroll_note")}</p>
              </form>
            </div>
          </Reveal>
        </section>
      )}
    </PageShell>
  );
}
