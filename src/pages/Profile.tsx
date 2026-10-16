import { LayoutGroup, motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { AppLink } from "../components/AppLink";
import { PageShell, Reveal } from "../components/PageShell";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/AuthContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

const explore = [
  { to: "/courses", titleKey: "nav_courses", icon: "汉" },
  { to: "/enroll", titleKey: "register_cta", icon: "✓" },
  { to: "/shop", titleKey: "nav_shop", icon: "店" },
  { to: "/about", titleKey: "nav_about", icon: "院" },
  { to: "/contact", titleKey: "nav_contact", icon: "☎" },
] as const;

export function Profile() {
  const { t, lang, setLang, langs } = useI18n();
  const { user, loading, signOut, isAdmin } = useAuth();
  const { academyLive: academy } = useSiteContent();

  if (!loading && !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
    <PageShell className="page-profile is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("profile_title")}</h1>
        </Reveal>
      </header>

      <Reveal>
        <div className="ios-profile-hero">
          <div className="ios-profile-avatar" aria-hidden>
            <Logo size="sm" />
          </div>
          <div>
            {user ? (
              <>
                <strong>{user.email}</strong>
                <em>{t("auth_signed_in")}</em>
              </>
            ) : (
              <>
                <strong>{t("brand")}</strong>
                <em>{t("auth_guest")}</em>
              </>
            )}
          </div>
        </div>
      </Reveal>

      <section className="section tight">
        <h2 className="ios-label">{t("profile_account")}</h2>
        {user ? (
          <div className="ios-list">
            <button
              type="button"
              className="ios-row auth-logout-row"
              disabled={loading}
              onClick={() => {
                void hapticLight();
                void signOut();
              }}
            >
              <span className="ios-row-icon" aria-hidden>
                ⎋
              </span>
              <span className="ios-row-body">
                <strong>{t("auth_logout")}</strong>
              </span>
              <span className="ios-row-chevron" aria-hidden>
                ›
              </span>
            </button>
          </div>
        ) : (
          <div className="auth-cta-row">
            <Link to="/auth?mode=login" className="auth-cta-btn is-primary">
              {t("auth_login")}
            </Link>
            <Link to="/auth?mode=signup" className="auth-cta-btn">
              {t("auth_signup")}
            </Link>
          </div>
        )}
      </section>

      <section className="section tight">
        <h2 className="ios-label">{t("profile_lang")}</h2>
        <LayoutGroup id="lang-seg">
          <div className="ios-seg ios-seg-lang" role="tablist">
            {langs.map((l) => {
              const active = lang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`ios-seg-item${active ? " is-active" : ""}`}
                  onClick={() => {
                    setLang(l.code);
                    void hapticLight();
                  }}
                >
                  {active && (
                    <motion.span
                      className="ios-seg-pill"
                      layoutId="lang-seg-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span>{l.short}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </section>

      {isAdmin && (
        <section className="section tight">
          <h2 className="ios-label">{t("admin_title")}</h2>
          <div className="ios-list">
            <AppLink to="/admin" className="ios-row">
              <span className="ios-row-icon" aria-hidden>
                ⌘
              </span>
              <span className="ios-row-body">
                <strong>{t("admin_open")}</strong>
                <em>{t("admin_open_d")}</em>
              </span>
              <span className="ios-row-chevron" aria-hidden>
                ›
              </span>
            </AppLink>
          </div>
        </section>
      )}

      <section className="section tight">
        <h2 className="ios-label">{t("profile_explore")}</h2>
        <div className="ios-list">
          {explore.map((item) => (
            <AppLink key={item.to} to={item.to} className="ios-row">
              <span className="ios-row-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="ios-row-body">
                <strong>{t(item.titleKey)}</strong>
              </span>
              <span className="ios-row-chevron" aria-hidden>
                ›
              </span>
            </AppLink>
          ))}
        </div>
      </section>

      <section className="section tight section-last">
        <h2 className="ios-label">{t("footer_contact")}</h2>
        <div className="ios-list">
          <a href={`tel:${academy.phoneRaw[0]}`} className="ios-row">
            <span className="ios-row-icon" aria-hidden>
              ☎
            </span>
            <span className="ios-row-body">
              <strong>{academy.phone[0]}</strong>
              <em>{t("call")}</em>
            </span>
            <span className="ios-row-chevron" aria-hidden>
              ›
            </span>
          </a>
          <a href={`mailto:${academy.email}`} className="ios-row">
            <span className="ios-row-icon" aria-hidden>
              @
            </span>
            <span className="ios-row-body">
              <strong>{academy.email}</strong>
            </span>
            <span className="ios-row-chevron" aria-hidden>
              ›
            </span>
          </a>
        </div>
        <p className="ios-foot">{t("profile_version")} 1.0</p>
      </section>
    </PageShell>
  );
}
