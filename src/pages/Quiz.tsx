import { useMemo, useState, type CSSProperties } from "react";
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
import { hapticLight, hapticMedium, hapticSuccess } from "../lib/native";
import { ease } from "../lib/motion";

type Phase = "pick" | "play" | "done";

const HEARTS_MAX = 3;
const XP_HIT = 10;
const XP_STREAK_BONUS = 5;

type PlayState = {
  pool: QuizQuestion[];
  order: number[];
  index: number;
  score: number;
  xp: number;
  hearts: number;
  streak: number;
  bestStreak: number;
  picked: number | null;
  locked: boolean;
  optionOrder: number[];
  endedByHearts: boolean;
};

const LEVEL_GLYPH: Record<QuizLevel, string> = {
  hsk1: "一",
  hsk2: "二",
  hsk3: "三",
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
    xp: 0,
    hearts: HEARTS_MAX,
    streak: 0,
    bestStreak: 0,
    picked: null,
    locked: false,
    optionOrder: shuffleIndices(first.options.length),
    endedByHearts: false,
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
      ? ((play.index + (play.locked ? 1 : 0)) / Math.max(total, 1)) * 100
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
    const streak = ok ? play.streak + 1 : 0;
    const bonus = ok && streak >= 3 ? XP_STREAK_BONUS : 0;
    const xpGain = ok ? XP_HIT + bonus : 0;
    const hearts = ok ? play.hearts : Math.max(0, play.hearts - 1);

    setPlay({
      ...play,
      picked: optionIdx,
      locked: true,
      score: ok ? play.score + 1 : play.score,
      xp: play.xp + xpGain,
      hearts,
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
    });

    if (ok) void hapticSuccess();
    else void hapticMedium();
  }

  function next() {
    if (!play) return;

    if (play.hearts <= 0) {
      setPlay({ ...play, endedByHearts: true });
      setPhase("done");
      return;
    }

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
    void hapticLight();
  }

  function backToLevels() {
    setPhase("pick");
    setLevel(null);
    setPlay(null);
  }

  const score = play?.score ?? 0;
  const resultKey = play?.endedByHearts
    ? "quiz_out_hearts"
    : score >= Math.ceil(total * 0.85)
      ? "quiz_level_great"
      : score >= Math.ceil(total * 0.6)
        ? "quiz_level_good"
        : "quiz_level_start";

  const levelMeta = quizLevels.find((l) => l.id === level);
  const lastXpGain =
    play && isCorrect
      ? XP_HIT + (play.streak >= 3 ? XP_STREAK_BONUS : 0)
      : 0;

  return (
    <PageShell
      className={`page-quiz is-app ios-app quiz-game${phase !== "pick" ? " is-playing" : ""}`}
    >
      {phase === "pick" && (
        <header className="page-head app-head quiz-game-head">
          <Reveal>
            <p className="eyebrow desk-only">{t("nav_quiz")}</p>
            <h1 className="h1">{t("quiz_title")}</h1>
            <p className="lead desk-only">{t("quiz_lead")}</p>
          </Reveal>
        </header>
      )}

      <div className="quiz-shell">
        {(phase === "play" || phase === "done") && play && (
          <div className="quiz-hud">
            <button
              type="button"
              className="quiz-hud-close"
              onClick={backToLevels}
              aria-label={t("quiz_close")}
            >
              ×
            </button>

            <div className="quiz-progress" aria-hidden>
              <motion.span
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease }}
              />
            </div>

            <div className="quiz-hud-stats">
              <div className="quiz-hearts" aria-label={t("quiz_out_hearts")}>
                {Array.from({ length: HEARTS_MAX }, (_, i) => (
                  <motion.span
                    key={i}
                    className={i < play.hearts ? "is-on" : "is-off"}
                    animate={
                      i < play.hearts
                        ? { scale: 1 }
                        : { scale: 0.85, opacity: 0.35 }
                    }
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  >
                    ♥
                  </motion.span>
                ))}
              </div>
              <div className="quiz-xp-pill">
                <em>{play.xp}</em>
                <span>{t("quiz_xp")}</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div
              key="pick"
              className="quiz-panel quiz-pick"
              initial={{ opacity: 0, y: 18 }}
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
                  <motion.button
                    key={lvl.id}
                    type="button"
                    className={`quiz-level-card quiz-level-${lvl.id}`}
                    onClick={() => startLevel(lvl.id)}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.28, ease }}
                  >
                    <span className="quiz-level-glyph" aria-hidden>
                      {LEVEL_GLYPH[lvl.id]}
                    </span>
                    <span className="quiz-level-body">
                      <span className="quiz-level-badge">{lvl.badge}</span>
                      <strong>{t(lvl.titleKey)}</strong>
                      <em>{t(lvl.descKey)}</em>
                    </span>
                    <span className="quiz-level-play">{t("quiz_start")}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "play" && question && play && (
            <motion.div
              key={question.id}
              className="quiz-panel quiz-play"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="quiz-meta">
                <span>
                  {play.index + 1}/{total}
                </span>
                {play.streak >= 2 ? (
                  <motion.em
                    className="quiz-streak-chip"
                    key={play.streak}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 16 }}
                  >
                    🔥 {play.streak} {t("quiz_combo")}
                  </motion.em>
                ) : (
                  <em>
                    {question.kind === "pinyin"
                      ? t("quiz_ask_pinyin")
                      : t("quiz_ask_meaning")}
                  </em>
                )}
              </div>

              <motion.div
                className="quiz-prompt"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                <strong>{question.hanzi}</strong>
                {question.kind === "meaning" && <span>{question.pinyin}</span>}
              </motion.div>

              <div className="quiz-options" role="group">
                {play.optionOrder.map((realIdx, i) => {
                  const opt = question.options[realIdx];
                  let state = "";
                  if (play.locked) {
                    if (realIdx === question.correct) state = " is-correct";
                    else if (i === play.picked) state = " is-wrong";
                    else state = " is-dim";
                  }
                  return (
                    <motion.button
                      key={`${question.id}-${realIdx}`}
                      type="button"
                      className={`quiz-option${state}`}
                      disabled={play.locked}
                      onClick={() => pick(i)}
                      whileTap={play.locked ? undefined : { scale: 0.96 }}
                      animate={
                        state === " is-wrong"
                          ? { x: [0, -8, 8, -6, 6, 0] }
                          : state === " is-correct"
                            ? { scale: [1, 1.04, 1] }
                            : { x: 0, scale: 1 }
                      }
                      transition={{ duration: 0.38 }}
                    >
                      <i aria-hidden>{String.fromCharCode(65 + i)}</i>
                      <span>{optionLabel(opt, lang)}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {play.locked && (
                  <motion.div
                    className={`quiz-dock${isCorrect ? " is-ok" : " is-bad"}`}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  >
                    <div className="quiz-dock-copy">
                      <strong>
                        {isCorrect ? t("quiz_correct") : t("quiz_wrong")}
                        {isCorrect && lastXpGain > 0 ? ` +${lastXpGain} ${t("quiz_xp")}` : ""}
                      </strong>
                      {!isCorrect && (
                        <p>
                          {t("quiz_answer_was")}:{" "}
                          {optionLabel(question.options[question.correct], lang)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="quiz-primary"
                      onClick={next}
                    >
                      {play.hearts <= 0 || play.index + 1 >= total
                        ? t("quiz_finish")
                        : t("quiz_continue")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "done" && play && (
            <motion.div
              key="done"
              className="quiz-panel quiz-done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease }}
            >
              <motion.div
                className="quiz-done-burst"
                aria-hidden
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
              >
                {play.endedByHearts ? "💔" : "🎉"}
              </motion.div>

              <div
                className="quiz-score-ring"
                style={
                  {
                    "--quiz-pct": `${total ? Math.round((score / total) * 100) : 0}%`,
                  } as CSSProperties
                }
                aria-hidden
              >
                <strong>
                  {score}/{total}
                </strong>
              </div>

              <h2>{t(resultKey)}</h2>
              <p>
                {play.endedByHearts
                  ? t("quiz_out_hearts_d")
                  : levelMeta
                    ? `${levelMeta.badge} · ${t("quiz_done_d")}`
                    : t("quiz_done_d")}
              </p>

              <div className="quiz-done-stats">
                <div>
                  <strong>{play.xp}</strong>
                  <span>{t("quiz_earned")}</span>
                </div>
                <div>
                  <strong>{play.bestStreak}</strong>
                  <span>{t("quiz_best_streak")}</span>
                </div>
              </div>

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
