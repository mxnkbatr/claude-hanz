import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { navKeys } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { BottomSheet } from "./BottomSheet";
import { IconClose, IconMenu, IconProfile, NavIcon } from "./Icons";
import { Logo } from "./Logo";
import { Onboard } from "./Onboard";
import { Snowfall } from "./Snowfall";
import { useAuth } from "../lib/AuthContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

const EXPLORE_PATHS = new Set([
  "/courses",
  "/medee",
  "/university",
  "/travel",
  "/shop",
  "/quiz",
]);
const ACCOUNT_PATHS = new Set([
  "/about",
  "/contact",
  "/enroll",
  "/profile",
  "/auth",
]);

export function Layout() {
  const location = useLocation();
  const { t, lang, setLang, langs } = useI18n();
  const { user } = useAuth();
  const { academyLive: academy } = useSiteContent();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === "/";

  useDocumentMeta();

  useEffect(() => {
    if ((window.scrollY || 0) > 0) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    setLangOpen(false);
    setMenuOpen(false);
  }, [location.pathname, lang]);

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

  useEffect(() => {
    if (!langOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const menuExplore = navKeys.filter((item) => EXPLORE_PATHS.has(item.to));
  const menuAccount = navKeys.filter((item) => {
    if (!ACCOUNT_PATHS.has(item.to)) return false;
    if (item.to === "/auth" && user) return false;
    if (item.to === "/profile" && !user) return false;
    return true;
  });
  const topItems = navKeys.filter((item) => item.top);

  return (
    <div className={`app-shell liquid-shell${isHome ? " is-home" : ""}`}>
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
          <div className="topbar-capsule">
            <NavLink to="/" className="topbar-brand" aria-label={t("nav_home")}>
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
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            className="topnav-pill"
                            layoutId="nav-pill"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
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

              <div
                ref={langRef}
                className={`lang-switch${langOpen ? " is-open" : ""}`}
              >
                <button
                  type="button"
                  className="lang-btn"
                  id="lang-btn"
                  aria-expanded={langOpen}
                  aria-haspopup="listbox"
                  aria-controls="lang-menu"
                  aria-label={t("lang")}
                  onClick={() => setLangOpen((v) => !v)}
                >
                  {langs.find((l) => l.code === lang)?.short}
                  <motion.span
                    aria-hidden
                    animate={{ rotate: langOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.ul
                      id="lang-menu"
                      className="lang-menu"
                      role="listbox"
                      aria-labelledby="lang-btn"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.22, ease }}
                    >
                      {langs.map((l) => (
                        <li
                          key={l.code}
                          role="option"
                          aria-selected={l.code === lang}
                        >
                          <button
                            type="button"
                            className={l.code === lang ? "is-active" : ""}
                            onClick={() => {
                              setLang(l.code);
                              setLangOpen(false);
                            }}
                          >
                            {l.label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <a className="topbar-cta" href={`tel:${academy.phoneRaw[0]}`}>
                <span>{t("call")}</span>
              </a>
            </div>
          </div>
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
              transition: { staggerChildren: 0.028, delayChildren: 0.04 },
            },
          }}
        >
          <motion.p
            className="site-menu-section"
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.22, ease },
              },
            }}
          >
            {t("menu_explore")}
          </motion.p>
          <nav className="site-menu-grid" aria-label={t("menu_explore")}>
            {menuExplore.map((item) => (
              <motion.div
                key={item.to}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease },
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
                  <span className="site-menu-app-label">
                    {"tabKey" in item && item.tabKey
                      ? t(item.tabKey)
                      : t(item.key)}
                  </span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <motion.p
            className="site-menu-section"
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.22, ease },
              },
            }}
          >
            {t("menu_account")}
          </motion.p>
          <nav className="site-menu-list" aria-label={t("menu_account")}>
            {menuAccount.map((item) => (
              <motion.div
                key={item.to}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.2, ease },
                  },
                }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `site-menu-row${isActive ? " is-active" : ""}`
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    void hapticLight();
                  }}
                >
                  <span className="site-menu-row-icon" aria-hidden>
                    <NavIcon name={item.icon} />
                  </span>
                  <span>{t(item.key)}</span>
                  <span className="site-menu-row-chevron" aria-hidden>
                    ›
                  </span>
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      </BottomSheet>

      <main id="main" className="main">
        <LayoutGroup id="shared-routes">
          <AnimatePresence mode="wait" initial={false}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
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
      </footer>

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
              <span className="tabbar-icon">
                <NavIcon name={item.icon} />
              </span>
              <span className="tabbar-label">
                {t(
                  "tabKey" in item && item.tabKey ? item.tabKey : item.key,
                )}
              </span>
            </NavLink>
          ))}
      </nav>

      <Onboard />
    </div>
  );
}
