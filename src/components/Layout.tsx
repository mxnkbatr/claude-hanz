import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { academy } from "../data/content";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { navKeys } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { NavIcon } from "./Icons";
import { Logo } from "./Logo";
import { Snowfall } from "./Snowfall";
import { ease } from "../lib/motion";

export function Layout() {
  const location = useLocation();
  const { t, lang, setLang, langs } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === "/";

  useDocumentMeta();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    setLangOpen(false);
  }, [location.pathname, lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  return (
    <div className={`app-shell${isHome ? " is-home" : ""}`}>
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
                {navKeys.map((item) => (
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

          <p className="winter-ribbon">
            <span>{t("winter_note")}</span>
          </p>
        </div>
      </header>

      <main id="main" className="main">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <Logo size="sm" />
            <p>{t("footer_tag")}</p>
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
              <NavLink to="/contact">{t("nav_contact")}</NavLink>
              <a href={academy.facebook} target="_blank" rel="noopener noreferrer">
                Facebook · Khanz academy
              </a>
              <a
                href={academy.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram · @khanzacademy
              </a>
              <a
                href={academy.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("register_cta")}
              </a>
              <a href={academy.shopUrl} target="_blank" rel="noopener noreferrer">
                bumtankhanz.mn
              </a>
            </div>
          </div>
        </div>
      </footer>

      <nav className="tabbar" aria-label={t("nav_mobile")}>
        {navKeys
          .filter((item) => item.to !== "/about")
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `tabbar-item${isActive ? " is-active" : ""}`
              }
            >
              <span className="tabbar-icon">
                <NavIcon name={item.icon} />
              </span>
              <span className="tabbar-label">{t(item.key)}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
