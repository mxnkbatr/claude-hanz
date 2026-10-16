import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { kidsLevels, kidsSchedules } from "../data/content";
import {
  courseFilters,
  filterKeyLabel,
  resolveMatch,
  type CourseFilter,
  type MatchAnswer,
  type MatchResult,
} from "../data/courseMatch";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SuccessBurst } from "../components/SuccessBurst";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { supabase } from "../lib/supabase";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Step = "browse" | "enroll";
type MatchPhase = "intro" | "ask" | "done";

type CourseCard =
  | {
      kind: "kids";
      id: string;
      titleKey: string;
      descKey: string;
      metaKey: string;
      mark: string;
      filter: "kids";
    }
  | {
      kind: "course";
      id: string;
      titleKey: string;
      descKey: string;
      metaKey: string;
      mark: string;
      filter: CourseFilter;
    };

const emptyMatch: MatchAnswer = {
  who: "",
  goal: "",
  when: "",
  age: "",
};

export function Courses() {
  const { t } = useI18n();
  const { coursesLive } = useSiteContent();

  const [step, setStep] = useState<Step>("browse");
  const [level, setLevel] = useState("");
  const [schedule, setSchedule] = useState(kidsSchedules[0].id);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");

  const [matchPhase, setMatchPhase] = useState<MatchPhase>("intro");
  const [matchStep, setMatchStep] = useState(0);
  const [answers, setAnswers] = useState<MatchAnswer>(emptyMatch);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const levelMeta = kidsLevels.find((l) => l.id === level);

  const catalog = useMemo<CourseCard[]>(() => {
    const kids: CourseCard[] = kidsLevels.map((l) => ({
      kind: "kids",
      id: l.id,
      titleKey: l.labelKey,
      descKey: l.descKey,
      metaKey: l.ageKey,
      mark: l.mark,
      filter: "kids",
    }));
    const rest: CourseCard[] = coursesLive
      .filter((c) => c.id !== "kids")
      .map((c) => ({
        kind: "course",
        id: c.id,
        titleKey: c.titleKey,
        descKey: c.descKey,
        metaKey: c.tagKey,
        mark: c.icon,
        filter: c.id as CourseFilter,
      }));
    return [...kids, ...rest];
  }, [coursesLive]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: catalog.length };
    for (const c of catalog) {
      map[c.filter] = (map[c.filter] || 0) + 1;
    }
    return map;
  }, [catalog]);

  const list = useMemo(() => {
    const base =
      filter === "all" ? catalog : catalog.filter((c) => c.filter === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((c) => {
      const hay = `${t(c.titleKey)} ${t(c.descKey)} ${t(c.metaKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [catalog, filter, q, t]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  function openEnroll(kidsLevelId: string, scheduleHint?: string) {
    setLevel(kidsLevelId);
    setSchedule(scheduleHint || kidsSchedules[0].id);
    setStep("enroll");
    setStatus("idle");
    void hapticLight();
    window.scrollTo(0, 0);
  }

  function backToBrowse() {
    setStep("browse");
    setStatus("idle");
    void hapticLight();
    window.scrollTo(0, 0);
  }

  function startMatch() {
    setMatchPhase("ask");
    setMatchStep(0);
    setAnswers(emptyMatch);
    setMatchResult(null);
    void hapticLight();
  }

  function resetMatch() {
    setMatchPhase("intro");
    setMatchStep(0);
    setAnswers(emptyMatch);
    setMatchResult(null);
    void hapticLight();
  }

  function answerMatch(field: keyof MatchAnswer, value: string) {
    const next = { ...answers, [field]: value } as MatchAnswer;
    // reset dependent fields
    if (field === "who") {
      next.goal = "";
      next.age = "";
    }
    setAnswers(next);
    void hapticLight();

    const who = field === "who" ? value : next.who;
    const steps =
      who === "child"
        ? (["who", "when", "age"] as const)
        : (["who", "goal", "when"] as const);

    const idx = steps.indexOf(field as (typeof steps)[number]);
    if (idx >= 0 && idx < steps.length - 1) {
      setMatchStep(idx + 1);
      return;
    }

    // finalize
    if (who === "child") next.goal = "kids";
    const result = resolveMatch(next);
    setMatchResult(result);
    setMatchPhase("done");
  }

  const askField =
    answers.who === "child"
      ? (["who", "when", "age"] as const)[matchStep]
      : (["who", "goal", "when"] as const)[matchStep];

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
              onClick={backToBrowse}
            >
              ← {t("kids_back_levels")}
            </button>
          ) : null}
          <h1 className="h1">
            {step === "browse"
              ? t("courses_title")
              : levelMeta
                ? t(levelMeta.labelKey)
                : t("kids_enroll_title")}
          </h1>
          <p className="lead desk-only">
            {step === "browse" ? t("courses_lead") : t("kids_enroll_lead")}
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
                setStep("browse");
                setLevel("");
              }}
            />
          </div>
        </Reveal>
      ) : step === "browse" ? (
        <>
          {/* Course matcher */}
          <Reveal>
            <section className="course-match glass-panel">
              <div className="course-match-head">
                <span className="course-match-mark" aria-hidden>
                  测
                </span>
                <div>
                  <strong>{t("cmatch_title")}</strong>
                  <em>{t("cmatch_lead")}</em>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {matchPhase === "intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <button
                      type="button"
                      className="btn btn-seal course-match-start"
                      onClick={startMatch}
                    >
                      <span>{t("cmatch_start")}</span>
                    </button>
                  </motion.div>
                )}

                {matchPhase === "ask" && askField && (
                  <motion.div
                    key={`ask-${askField}-${matchStep}`}
                    className="course-match-ask"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <p className="course-match-q">
                      {askField === "who" && t("cmatch_q_who")}
                      {askField === "goal" && t("cmatch_q_goal")}
                      {askField === "when" && t("cmatch_q_when")}
                      {askField === "age" && t("cmatch_q_age")}
                    </p>
                    <div className="course-match-options">
                      {askField === "who" &&
                        (
                          [
                            ["child", "cmatch_a_child"],
                            ["adult", "cmatch_a_adult"],
                          ] as const
                        ).map(([value, key]) => (
                          <button
                            key={value}
                            type="button"
                            className="course-match-opt"
                            onClick={() => answerMatch("who", value)}
                          >
                            {t(key)}
                          </button>
                        ))}
                      {askField === "goal" &&
                        (
                          [
                            ["speak", "cmatch_a_speak"],
                            ["hsk", "cmatch_a_hsk"],
                            ["csca", "cmatch_a_csca"],
                            ["year", "cmatch_a_year"],
                          ] as const
                        ).map(([value, key]) => (
                          <button
                            key={value}
                            type="button"
                            className="course-match-opt"
                            onClick={() => answerMatch("goal", value)}
                          >
                            {t(key)}
                          </button>
                        ))}
                      {askField === "when" &&
                        (
                          [
                            ["weekday", "cmatch_a_weekday"],
                            ["weekend", "cmatch_a_weekend"],
                          ] as const
                        ).map(([value, key]) => (
                          <button
                            key={value}
                            type="button"
                            className="course-match-opt"
                            onClick={() => answerMatch("when", value)}
                          >
                            {t(key)}
                          </button>
                        ))}
                      {askField === "age" &&
                        (
                          [
                            ["7-8", "kids_lvl_beginner_age"],
                            ["9-11", "kids_lvl_elementary_age"],
                            ["12-14", "kids_lvl_intermediate_age"],
                          ] as const
                        ).map(([value, key]) => (
                          <button
                            key={value}
                            type="button"
                            className="course-match-opt"
                            onClick={() => answerMatch("age", value)}
                          >
                            {t(key)}
                          </button>
                        ))}
                    </div>
                    <button
                      type="button"
                      className="course-match-reset"
                      onClick={resetMatch}
                    >
                      {t("cmatch_restart")}
                    </button>
                  </motion.div>
                )}

                {matchPhase === "done" && matchResult && (
                  <motion.div
                    key="done"
                    className="course-match-result"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  >
                    <p className="course-match-reason">{t(matchResult.reasonKey)}</p>
                    <div className="course-match-pick">
                      <strong>{t(matchResult.titleKey)}</strong>
                      <em>{t(matchResult.descKey)}</em>
                    </div>
                    <div className="course-match-actions">
                      {matchResult.courseId === "kids" &&
                      matchResult.kidsLevelId ? (
                        <button
                          type="button"
                          className="btn btn-seal"
                          onClick={() =>
                            openEnroll(
                              matchResult.kidsLevelId!,
                              matchResult.scheduleHint,
                            )
                          }
                        >
                          <span>{t("kids_enroll_cta")}</span>
                        </button>
                      ) : (
                        <Link
                          to={`/enroll?interest=${matchResult.courseId}`}
                          className="btn btn-seal"
                          onClick={() => void hapticLight()}
                        >
                          <span>{t("register_cta")}</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        className="course-match-reset"
                        onClick={resetMatch}
                      >
                        {t("cmatch_restart")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </Reveal>

          {/* Search + filter */}
          <Reveal>
            <div className="news-toolbar course-toolbar">
              <label className="ios-search news-search">
                <span aria-hidden>⌕</span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("cmatch_search")}
                  autoComplete="off"
                />
                {hasQuery && (
                  <button
                    type="button"
                    className="news-search-clear"
                    onClick={() => setQ("")}
                    aria-label={t("news_clear")}
                  >
                    ×
                  </button>
                )}
              </label>

              <div className="news-filter-bar">
                <LayoutGroup id="course-seg">
                  <div
                    className="news-filters"
                    role="tablist"
                    aria-label={t("cmatch_filter_label")}
                  >
                    {courseFilters.map((f) => {
                      const active = filter === f;
                      const count = counts[f] ?? 0;
                      return (
                        <button
                          key={f}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`news-chip${active ? " is-active" : ""}`}
                          onClick={() => {
                            setFilter(f);
                            void hapticLight();
                          }}
                        >
                          {active && (
                            <motion.span
                              className="news-chip-pill"
                              layoutId="course-chip-pill"
                              transition={{
                                type: "spring",
                                stiffness: 480,
                                damping: 36,
                              }}
                            />
                          )}
                          <span className="news-chip-label">
                            {t(filterKeyLabel(f))}
                          </span>
                          <em>{count}</em>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                {isFiltered && (
                  <button
                    type="button"
                    className="news-reset"
                    onClick={() => {
                      setFilter("all");
                      setQ("");
                      void hapticLight();
                    }}
                  >
                    {t("news_clear")}
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* Cards */}
          <section className="section tight section-last">
            {list.length === 0 ? (
              <p className="ios-empty">{t("cmatch_empty")}</p>
            ) : (
              <Stagger className="ios-feed ios-feed-stack course-card-feed">
                {list.map((c) => (
                  <StaggerItem key={`${c.kind}-${c.id}`}>
                    {c.kind === "kids" ? (
                      <button
                        type="button"
                        className="ios-card course-card"
                        onClick={() => openEnroll(c.id)}
                      >
                        <div className="course-card-top">
                          <span className="course-card-mark" aria-hidden>
                            {c.mark}
                          </span>
                          <span className="ios-badge ios-badge-soft">
                            {t(c.metaKey)}
                          </span>
                        </div>
                        <div className="ios-card-body">
                          <h3>{t(c.titleKey)}</h3>
                          <p className="ios-card-desc">{t(c.descKey)}</p>
                          <span className="ios-card-cta">
                            {t("kids_choose_level")} <i aria-hidden>→</i>
                          </span>
                        </div>
                      </button>
                    ) : (
                      <Link
                        to={`/enroll?interest=${c.id}`}
                        className="ios-card course-card"
                        onClick={() => void hapticLight()}
                      >
                        <div className="course-card-top">
                          <span className="course-card-mark" aria-hidden>
                            {c.mark}
                          </span>
                          <span className="ios-badge ios-badge-soft">
                            {t(c.metaKey)}
                          </span>
                        </div>
                        <div className="ios-card-body">
                          <h3>{t(c.titleKey)}</h3>
                          <p className="ios-card-desc">{t(c.descKey)}</p>
                          <span className="ios-card-cta">
                            {t("register_cta")} <i aria-hidden>→</i>
                          </span>
                        </div>
                      </Link>
                    )}
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </>
      ) : (
        <section className="section tight section-last kids-enroll">
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
              </form>
            </div>
          </Reveal>
        </section>
      )}
    </PageShell>
  );
}
