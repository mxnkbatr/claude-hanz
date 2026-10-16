import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { SuccessBurst } from "../components/SuccessBurst";
import { useAuth } from "../lib/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Mode = "login" | "signup";

export function Auth() {
  const { t } = useI18n();
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (loading) {
    return (
      <PageShell className="page-auth is-app ios-app">
        <div className="auth-stage auth-stage-quiet" aria-busy="true" />
      </PageShell>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || password.length < 6) {
      setError(t("auth_err_fields"));
      return;
    }
    setBusy(true);
    void hapticLight();
    const res =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (mode === "signup") {
      setInfo(t("auth_signup_ok"));
    } else {
      navigate("/profile", { replace: true });
    }
  }

  return (
    <PageShell className="page-auth is-app ios-app">
      <div className="auth-stage">
        <div className="auth-glow" aria-hidden />

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease }}
        >
          <div className="auth-brand" aria-hidden>
            <span>汉</span>
          </div>

          <motion.header
            className="auth-card-head"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06, duration: 0.25, ease }}
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                {mode === "login" ? t("auth_login") : t("auth_signup")}
              </motion.h1>
            </AnimatePresence>
            <p>{t("auth_lead")}</p>
          </motion.header>

          <AnimatePresence mode="wait">
            {info ? (
              <motion.div
                key="auth-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <SuccessBurst
                  title={t("form_success_title")}
                  message={info}
                  doneLabel={t("auth_login")}
                  onDone={() => {
                    setInfo("");
                    setMode("login");
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`auth-body-${mode}`}
                initial={{ opacity: 0, x: mode === "login" ? -18 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 18 : -18 }}
                transition={{ duration: 0.32, ease }}
              >
                <LayoutGroup id="auth-mode">
                  <div className="auth-tabs" role="tablist">
                    {(["login", "signup"] as const).map((m) => {
                      const active = mode === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`auth-tab${active ? " is-active" : ""}`}
                          onClick={() => {
                            setMode(m);
                            setError("");
                            setInfo("");
                            void hapticLight();
                          }}
                        >
                          {active && (
                            <motion.span
                              className="auth-tab-pill"
                              layoutId="auth-tab-pill"
                              transition={{
                                type: "spring",
                                stiffness: 480,
                                damping: 36,
                              }}
                            />
                          )}
                          <span>
                            {m === "login" ? t("auth_login") : t("auth_signup")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                <form className="auth-form" onSubmit={onSubmit}>
                  <label className="auth-field">
                    <span>{t("auth_email")}</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>{t("auth_password")}</span>
                    <input
                      type="password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </label>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="auth-msg is-err"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={busy || loading}
                  >
                    {busy
                      ? t("auth_busy")
                      : mode === "login"
                        ? t("auth_login")
                        : t("auth_signup")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="auth-foot">
            <Link to="/">{t("back")}</Link>
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}
