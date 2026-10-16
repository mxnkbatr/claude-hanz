import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  optionLabel,
  questionsForLevel,
  quizLevels,
  shuffleIndices,
  type QuizLevel,
  type QuizQuestion,
} from "../data/quiz";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Phase = "pick" | "play" | "done";

type PlayState = {
  pool: QuizQuestion[];
  order: number[];
  index: number;
  score: number;
  picked: number | null;
  locked: boolean;
  optionOrder: number[];
};

function buildPlay(level: QuizLevel): PlayState {
  const pool = questionsForLevel(level);
  const order = shuffleIndices(pool.length);
  const first = pool[order[0]];
  return {
    pool,
    order,
    index: 0,
    score: 0,
    picked: null,
    locked: false,
    optionOrder: shuffleIndices(first.options.length),
  };
}

export function Quiz() {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState<Phase>("pick");
  const [level, setLevel] = useState<QuizLevel | null>(null);
  const [play, setPlay] = useState<PlayState | null>(null);

  const question: QuizQuestion | null = useMemo(() => {
    if (phase !== "play" || !play) return null;
    return play.pool[play.order[play.index]] ?? null;
  }, [phase, play]);

  const total = play?.pool.length ?? 0;
  const progress =
    phase === "play" && play
      ? (play.index / Math.max(total, 1)) * 100
      : phase === "done"
        ? 100
        : 0;

  const isCorrect =
    play && play.picked !== null && question
      ? play.optionOrder[play.picked] === question.correct
      : false;

  function startLevel(next: QuizLevel) {
    setLevel(next);
    setPlay(buildPlay(next));
    setPhase("play");
    void hapticLight();
  }

  function pick(optionIdx: number) {
    if (!question || !play || play.locked) return;
    const real = play.optionOrder[optionIdx];
    const ok = real === question.correct;
    setPlay({
      ...play,
      picked: optionIdx,
      locked: true,
      score: ok ? play.score + 1 : play.score,
    });
    void hapticLight();
  }

  function next() {
    if (!play) return;
    if (play.index + 1 >= total) {
      setPhase("done");
      return;
    }
    const nextIndex = play.index + 1;
    const nextQ = play.pool[play.order[nextIndex]];
    setPlay({
      ...play,
      index: nextIndex,
      picked: null,
      locked: false,
      optionOrder: shuffleIndices(nextQ.options.length),
    });
  }

  function backToLevels() {
    setPhase("pick");
    setLevel(null);
    setPlay(null);
  }

  const score = play?.score ?? 0;
  const resultKey =
    score >= Math.ceil(total * 0.85)
      ? "quiz_level_great"
      : score >= Math.ceil(total * 0.6)
        ? "quiz_level_good"
        : "quiz_level_start";

  const levelMeta = quizLevels.find((l) => l.id === level);

  return (
    <PageShell className="page-quiz is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow">{t("nav_quiz")}</p>
          <h1 className="h1">{t("quiz_title")}</h1>
          <p className="lead">{t("quiz_lead")}</p>
        </Reveal>
      </header>

      <div className="quiz-shell">
        {(phase === "play" || phase === "done") && (
          <div className="quiz-topbar">
            <button type="button" className="quiz-back" onClick={backToLevels}>
              ← {t("back")}
            </button>
            {levelMeta && <em>{levelMeta.badge}</em>}
          </div>
        )}

        {(phase === "play" || phase === "done") && (
          <div className="quiz-progress" aria-hidden>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div
              key="pick"
              className="quiz-panel quiz-pick"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease }}
            >
              <div className="quiz-brand" aria-hidden>
                <span>汉</span>
              </div>
              <h2>{t("quiz_pick_t")}</h2>
              <p>{t("quiz_pick_d")}</p>

              <div className="quiz-levels">
                {quizLevels.map((lvl, i) => (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`quiz-level-card quiz-level-${lvl.id}`}
                    onClick={() => startLevel(lvl.id)}
                  >
                    <span className="quiz-level-num">0{i + 1}</span>
                    <span className="quiz-level-badge">{lvl.badge}</span>
                    <strong>{t(lvl.titleKey)}</strong>
                    <em>{t(lvl.descKey)}</em>
                    <span className="quiz-level-cta">{t("quiz_start")} →</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "play" && question && play && (
            <motion.div
              key={question.id}
              className="quiz-panel quiz-play"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease }}
            >
              <div className="quiz-meta">
                <span>
                  {play.index + 1} / {total}
                </span>
                <em>
                  {question.kind === "pinyin"
                    ? t("quiz_ask_pinyin")
                    : t("quiz_ask_meaning")}
                </em>
              </div>

              <div className="quiz-prompt">
                <strong>{question.hanzi}</strong>
                {question.kind === "meaning" && <span>{question.pinyin}</span>}
              </div>

              <div className="quiz-options" role="group">
                {play.optionOrder.map((realIdx, i) => {
                  const opt = question.options[realIdx];
                  let state = "";
                  if (play.locked) {
                    if (realIdx === question.correct) state = " is-correct";
                    else if (i === play.picked) state = " is-wrong";
                  }
                  return (
                    <button
                      key={`${question.id}-${realIdx}`}
                      type="button"
                      className={`quiz-option${state}`}
                      disabled={play.locked}
                      onClick={() => pick(i)}
                    >
                      <i aria-hidden>{String.fromCharCode(65 + i)}</i>
                      <span>{optionLabel(opt, lang)}</span>
                    </button>
                  );
                })}
              </div>

              {play.locked && (
                <motion.div
                  className={`quiz-feedback${isCorrect ? " is-ok" : " is-bad"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>
                    {isCorrect ? t("quiz_correct") : t("quiz_wrong")}
                    {!isCorrect && (
                      <>
                        {" "}
                        — {optionLabel(question.options[question.correct], lang)}
                      </>
                    )}
                  </p>
                  <button type="button" className="quiz-primary" onClick={next}>
                    {play.index + 1 >= total
                      ? t("quiz_finish")
                      : t("quiz_continue")}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "done" && play && (
            <motion.div
              key="done"
              className="quiz-panel quiz-done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="quiz-score-ring" aria-hidden>
                <strong>
                  {score}/{total}
                </strong>
              </div>
              <h2>{t(resultKey)}</h2>
              <p>
                {levelMeta ? `${levelMeta.badge} · ` : ""}
                {t("quiz_done_d")}
              </p>
              <div className="quiz-done-actions">
                {level && (
                  <button
                    type="button"
                    className="quiz-primary"
                    onClick={() => startLevel(level)}
                  >
                    {t("quiz_retry")}
                  </button>
                )}
                <button
                  type="button"
                  className="quiz-secondary"
                  onClick={backToLevels}
                >
                  {t("quiz_change_level")}
                </button>
                <Link to="/enroll" className="quiz-secondary">
                  {t("register_cta")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
