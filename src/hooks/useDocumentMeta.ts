import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";
import {
  getNewsById,
  getProductById,
  getTravelById,
  getUniversityById,
} from "../data/content";
import { useI18n } from "../i18n/I18nContext";

const routeMetaKey: Record<string, string> = {
  "/": "meta_home",
  "/about": "meta_about",
  "/courses": "meta_courses",
  "/enroll": "meta_enroll",
  "/medee": "meta_news",
  "/university": "meta_uni",
  "/travel": "meta_travel",
  "/shop": "meta_shop",
  "/contact": "meta_contact",
  "/profile": "meta_profile",
  "/auth": "meta_auth",
  "/quiz": "meta_quiz",
};

const BRAND = "Ханз Академи";

export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { t, lang } = useI18n();

  useEffect(() => {
    const siteTitle = t("meta_title");
    const newsMatch = matchPath("/medee/:id", pathname);
    const shopMatch = matchPath("/shop/:id", pathname);
    const uniMatch = matchPath("/university/:id", pathname);
    const travelMatch = matchPath("/travel/:id", pathname);

    if (newsMatch?.params.id) {
      const item = getNewsById(newsMatch.params.id);
      document.title = item
        ? `${t(item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (shopMatch?.params.id) {
      const item = getProductById(shopMatch.params.id);
      document.title = item
        ? `${t(item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (uniMatch?.params.id) {
      const item = getUniversityById(uniMatch.params.id);
      document.title = item
        ? `${t(item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (travelMatch?.params.id) {
      const item = getTravelById(travelMatch.params.id);
      document.title = item
        ? `${t(item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else {
      const known = routeMetaKey[pathname];
      if (!known) {
        document.title = `${t("not_found_title")} · ${BRAND}`;
      } else if (pathname === "/") {
        document.title = siteTitle;
      } else {
        document.title = `${t(known)} · ${BRAND}`;
      }
    }

    const desc =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
        return el;
      })();
    desc.setAttribute("content", t("meta_desc"));

    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [pathname, lang, t]);
}
