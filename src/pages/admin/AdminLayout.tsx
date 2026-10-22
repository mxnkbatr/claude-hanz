import { NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { useI18n } from "../../i18n/I18nContext";
import { Logo } from "../../components/Logo";

const navMain = [
  { to: "/admin", end: true, key: "admin_dash", ico: "▣" },
  { to: "/admin/leads", key: "admin_leads", ico: "☎" },
  { to: "/admin/pages", key: "admin_pages", ico: "▦" },
  { to: "/admin/settings", key: "admin_settings", ico: "⚙" },
  { to: "/admin/staff", key: "admin_staff", ico: "人" },
] as const;

const navPages = [
  { to: "/admin/news", key: "nav_news", ico: "新" },
  { to: "/admin/products", key: "nav_shop", ico: "店" },
  { to: "/admin/courses", key: "nav_courses", ico: "汉" },
  { to: "/admin/travel", key: "nav_travel", ico: "✈" },
  { to: "/admin/universities", key: "nav_uni", ico: "学" },
  { to: "/admin/branches", key: "admin_branches", ico: "址" },
  { to: "/admin/windows", key: "admin_windows", ico: "日" },
  { to: "/admin/translation", key: "admin_translation", ico: "译" },
  { to: "/admin/kids", key: "admin_kids", ico: "童" },
  { to: "/admin/quiz", key: "admin_quiz", ico: "测" },
  { to: "/admin/media", key: "admin_media", ico: "图" },
] as const;

export function AdminLayout() {
  const { t } = useI18n();
  const { user, loading, isAdmin, adminChecked } = useAuth();

  if (loading || !adminChecked) {
    return (
      <div className="admin-shell">
        <p className="admin-loading">{t("auth_busy")}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-brand">
          <Logo size="sm" />
          <div>
            <strong>{t("admin_title")}</strong>
            <em>{user.email}</em>
          </div>
        </div>

        <nav className="admin-nav" aria-label={t("admin_title")}>
          <p className="admin-nav-group">{t("admin_dash")}</p>
          {navMain.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav-ico" aria-hidden>
                {item.ico}
              </span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}

          <p className="admin-nav-group">{t("admin_cms")}</p>
          {navPages.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav-ico" aria-hidden>
                {item.ico}
              </span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <Link to="/" className="admin-ghost-btn">
            ← {t("admin_view_site")}
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
