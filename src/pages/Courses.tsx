import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  courseFilters,
  filterKeyLabel,
  resolveMatch,
  type CourseFilter,
  type MatchAnswer,
  type MatchResult,
} from "../data/courseMatch";
import { IosFilterBar } from "../components/IosFilterBar";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type MatchPhase = "intro" | "ask" | "done";
type MatchField = keyof MatchAnswer;

const emptyMatch: MatchAnswer = {
  who: "",
  goal: "",
  when: "",
  age: "",
};

export function Courses() {
  const { t } = useI18n();
  const { coursesLive } = useSiteContent();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");

  const [matchPhase, setMatchPhase] = useState<MatchPhase>("intro");
  const [matchStep, setMatchStep] = useState(0);
  const [answers, setAnswers] = useState<MatchAnswer>(emptyMatch);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: coursesLive.length };
    for (const c of coursesLive) {
      map[c.filter] = (map[c.filter] || 0) + 1;
    }
    return map;
  }, [coursesLive]);

  const list = useMemo(() => {
    const base =
      filter === "all"
        ? coursesLive
        : coursesLive.filter((c) => c.filter === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((c) => {
      const hay =
        `${t(c.titleKey)} ${t(c.descKey)} ${t(c.tagKey)} ${t(c.unitKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [coursesLive, filter, q, t]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  const filterOptions = useMemo(
    () =>
      courseFilters.map((f) => ({
        id: f,
        label: t(filterKeyLabel(f)),
        count: counts[f] ?? 0,
      })),
    [counts, t],
  );

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

  function answerMatch(field: MatchField, value: string) {
    const next = { ...answers, [field]: value } as MatchAnswer;
    if (field === "who") {
      next.goal = "";
      next.age = "";
    }
    setAnswers(next);
    void hapticLight();

    const who = field === "who" ? value : next.who;
    const steps: MatchField[] =
      who === "child" ? ["who", "when", "age"] : ["who", "goal", "when"];

    const idx = steps.indexOf(field);
    if (idx >= 0 && idx < steps.length - 1) {
      setMatchStep(idx + 1);
      return;
    }

    if (who === "child") next.goal = "kids";
    setMatchResult(resolveMatch(next));
    setMatchPhase("done");
  }

  const askField =
    answers.who === "child"
      ? (["who", "when", "age"] as const)[matchStep]
      : (["who", "goal", "when"] as const)[matchStep];

  return (
    <PageShell className="page-courses is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("courses_title")}</h1>
        </Reveal>
      </header>

      <Reveal>
        <section
          className={`course-match glass-panel course-match-compact${
            matchPhase === "intro" ? " is-intro" : ""
          }`}
        >
          {matchPhase === "intro" ? (
            <div className="course-match-compact-row">
              <span className="course-match-mark" aria-hidden>
                测
              </span>
              <div className="course-match-compact-copy">
                <strong>{t("cmatch_title")}</strong>
                <em>{t("cmatch_lead_short")}</em>
              </div>
              <button
                type="button"
                className="btn btn-seal course-match-start-mini"
                onClick={startMatch}
              >
                <span>{t("cmatch_start")}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="course-match-head">
                <span className="course-match-mark" aria-hidden>
                  测
                </span>
                <div>
                  <strong>{t("cmatch_title")}</strong>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {matchPhase === "ask" && askField && (
                  <motion.div
                    key={`ask-${askField}-${matchStep}`}
                    className="course-match-ask"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
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
                            ["classroom", "cmatch_a_classroom"],
                            ["hsk", "cmatch_a_hsk"],
                            ["year", "cmatch_a_year"],
                            ["speak", "cmatch_a_speak"],
                            ["online", "cmatch_a_online"],
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <p className="course-match-reason">
                      {t(matchResult.reasonKey)}
                    </p>
                    <div className="course-match-pick">
                      <strong>{t(matchResult.titleKey)}</strong>
                      <em>{t(matchResult.descKey)}</em>
                    </div>
                    <div className="course-match-actions">
                      <Link
                        to={`/courses/${matchResult.courseId}`}
                        className="btn btn-seal"
                        onClick={() => void hapticLight()}
                      >
                        <span>{t("view_detail")}</span>
                      </Link>
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
            </>
          )}
        </section>
      </Reveal>

      <Reveal>
        <div className="ios-toolbar course-toolbar">
          <label className="ios-search">
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
                className="ios-search-clear"
                onClick={() => setQ("")}
                aria-label={t("news_clear")}
              >
                ×
              </button>
            )}
          </label>

          <IosFilterBar
            options={filterOptions}
            value={filter}
            onChange={(id) => setFilter(id as CourseFilter)}
            ariaLabel={t("cmatch_filter_label")}
            layoutId="course-filter-pill"
            showClear={isFiltered}
            clearLabel={t("news_clear")}
            onClear={() => {
              setFilter("all");
              setQ("");
            }}
          />
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          <p className="ios-empty">{t("cmatch_empty")}</p>
        ) : (
          <Stagger className="course-product-grid">
            {list.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  to={`/courses/${c.id}`}
                  className="course-product-card"
                  onClick={() => void hapticLight()}
                >
                  <div className="course-product-media">
                    <SafeImage
                      src={c.image}
                      alt={t(c.titleKey)}
                      loading="lazy"
                    />
                    <span className="course-product-tag">{t(c.tagKey)}</span>
                  </div>
                  <div className="course-product-body">
                    <h3>{t(c.titleKey)}</h3>
                    <p>{t(c.unitKey)}</p>
                    <em>
                      {t("view_detail")} <i aria-hidden>→</i>
                    </em>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}
