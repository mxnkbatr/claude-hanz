import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { navKeys } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { AnimatedOutlet } from "./AnimatedOutlet";
import { BottomSheet } from "./BottomSheet";
import { IconClose, IconMenu, IconProfile, NavIcon } from "./Icons";
import { Logo } from "./Logo";
import { Onboard } from "./Onboard";
import { Snowfall } from "./Snowfall";
import { useAuth } from "../lib/AuthContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { ease, navSpring } from "../lib/motion";

/** Mobile menu: 2-column iOS tiles (order matters). */
const YEAR = new Date().getFullYear();

const MENU_ORDER = [
  "/courses",
  "/shop",
  "/about",
  "/translation",
  "/enroll",
  "/auth",
  "/profile",
] as const;

export function Layout() {
  const location = useLocation();
  const { t, lang, setLang, langs } = useI18n();
  const { user } = useAuth();
  const { academyLive: academy } = useSiteContent();
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [routeTick, setRouteTick] = useState(0);
  const isHome = location.pathname === "/";
  const isAuth = location.pathname.startsWith("/auth");

  useDocumentMeta();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setRouteTick((n) => n + 1);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuItems = MENU_ORDER.map((to) =>
    navKeys.find((item) => item.to === to),
  ).filter((item): item is (typeof navKeys)[number] => {
    if (!item) return false;
    if (item.to === "/auth" && user) return false;
    if (item.to === "/profile" && !user) return false;
    return true;
  });
  const topItems = navKeys.filter((item) => item.top);

  return (
    <div
      className={`app-shell liquid-shell${isHome ? " is-home" : ""}${
        isAuth ? " is-auth" : ""
      }`}
    >
      <a className="skip-link" href="#main">
        {t("skip_content")}
      </a>

      <div className="ambient" aria-hidden>
        <span className="ambient-wash" />
      </div>
      <Snowfall />

      <header
        className={`topbar${isHome ? " is-over-hero" : ""}${scrolled ? " is-scrolled" : ""}`}
      >
        <div className="topbar-stack">
          <motion.div
            className="topbar-capsule"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: scrolled ? 0 : 0,
                    scale: scrolled ? 0.985 : 1,
                  }
            }
            transition={navSpring}
          >
            {!reduceMotion && (
              <motion.span
                key={routeTick}
                className="topbar-route-line"
                aria-hidden
                initial={{ scaleX: 0, opacity: 0.9 }}
                animate={{ scaleX: 1, opacity: 0 }}
                transition={{ duration: 0.55, ease }}
              />
            )}

            <NavLink
              to="/"
              className="topbar-brand"
              aria-label={t("nav_home")}
              onClick={() => void hapticLight()}
            >
              <Logo size="sm" />
            </NavLink>

            <LayoutGroup id="topnav">
              <nav className="topnav" aria-label={t("nav_main")}>
                {topItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `topnav-link${isActive ? " is-active" : ""}`
                    }
                    onClick={() => void hapticLight()}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            className="topnav-pill"
                            layoutId="nav-pill"
                            transition={navSpring}
                          />
                        )}
                        <span className="topnav-text">{t(item.key)}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </LayoutGroup>

            <div className="topbar-actions">
              <NavLink
                to={user ? "/profile" : "/auth?mode=login"}
                className={({ isActive }) =>
                  `topbar-icon-btn${isActive ? " is-active" : ""}`
                }
                aria-label={user ? t("nav_profile") : t("auth_login")}
                onClick={() => void hapticLight()}
              >
                <IconProfile />
              </NavLink>

              <button
                type="button"
                className={`topbar-icon-btn desk-hide${menuOpen ? " is-active" : ""}`}
                aria-label={t("nav_menu")}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  void hapticLight();
                }}
              >
                {menuOpen ? <IconClose /> : <IconMenu />}
              </button>

              <a className="topbar-cta" href={`tel:${academy.phoneRaw[0]}`}>
                <span>{t("call")}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <BottomSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t("menu_title")}
        ariaLabel={t("menu_title")}
        className="site-menu"
      >
        <motion.div
          className="site-menu-app"
          id="site-menu"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.04, delayChildren: 0.06 },
            },
          }}
        >
          <nav className="site-menu-grid" aria-label={t("menu_title")}>
            {menuItems.map((item) => (
              <motion.div
                key={item.to}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.28, ease },
                  },
                }}
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `site-menu-app-link${isActive ? " is-active" : ""}`
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    void hapticLight();
                  }}
                >
                  <span className="site-menu-app-icon" aria-hidden>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="site-menu-app-label">{t(item.key)}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <motion.div
            className="site-menu-lang"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.28, ease },
              },
            }}
          >
            <p className="site-menu-section">{t("profile_lang")}</p>
            <LayoutGroup id="menu-lang-seg">
              <div
                className="ios26-filter-track site-menu-lang-track"
                role="tablist"
                aria-label={t("profile_lang")}
              >
                {langs.map((l) => {
                  const active = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`ios26-filter-chip site-menu-lang-chip${
                        active ? " is-active" : ""
                      }`}
                      onClick={() => {
                        setLang(l.code);
                        void hapticLight();
                      }}
                    >
                      {active && (
                        <motion.span
                          className="ios26-filter-pill"
                          layoutId="menu-lang-pill"
                          transition={navSpring}
                        />
                      )}
                      <span className="ios26-filter-label">{l.short}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </motion.div>
        </motion.div>
      </BottomSheet>

      <main id="main" className="main">
        <LayoutGroup id="shared-routes">
          <AnimatedOutlet />
        </LayoutGroup>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <Logo size="sm" />
            <p>{t("footer_tag")}</p>
            <div className="footer-social">
              <a
                className="footer-social-btn"
                href={academy.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8c0-.6.4-1 1-1z"
                  />
                </svg>
              </a>
              <a
                className="footer-social-btn"
                href={academy.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.2 7.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="site-footer-cols">
            <div>
              <h3>{t("footer_contact")}</h3>
              <a href={`tel:${academy.phoneRaw[0]}`}>{academy.phone[0]}</a>
              <a href={`tel:${academy.phoneRaw[1]}`}>{academy.phone[1]}</a>
              <a href={`mailto:${academy.email}`}>{academy.email}</a>
            </div>
            <div>
              <h3>{t("footer_links")}</h3>
              <NavLink to="/about">{t("nav_about")}</NavLink>
              <NavLink to="/courses">{t("nav_courses")}</NavLink>
              <NavLink to="/travel">{t("nav_travel")}</NavLink>
              <NavLink to="/contact">{t("nav_contact")}</NavLink>
              <NavLink to="/enroll">{t("register_cta")}</NavLink>
              <a href={academy.shopUrl} target="_blank" rel="noopener noreferrer">
                bumtankhanz.mn
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer-bottom">
          © {YEAR} {t("brand")} · Hanz Academy Mongolia
        </div>
      </footer>

      <LayoutGroup id="tabnav">
        <nav className="tabbar glass-dock" aria-label={t("nav_mobile")}>
          {navKeys
            .filter((item) => item.tab)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `tabbar-item${isActive ? " is-active" : ""}`
                }
                onClick={() => void hapticLight()}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        className="tabbar-pill"
                        layoutId="tab-pill"
                        transition={navSpring}
                      />
                    )}
                    <span className="tabbar-icon">
                      <NavIcon name={item.icon} />
                    </span>
                    <span className="tabbar-label">
                      {t(
                        "tabKey" in item && item.tabKey
                          ? item.tabKey
                          : item.key,
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
        </nav>
      </LayoutGroup>

      <Onboard />
    </div>
  );
}
