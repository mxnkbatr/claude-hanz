import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

const routeMetaKey: Record<string, string> = {
  "/": "meta_home",
  "/about": "meta_about",
  "/medee": "meta_news",
  "/university": "meta_uni",
  "/shop": "meta_shop",
  "/contact": "meta_contact",
};

export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { t, lang } = useI18n();

  useEffect(() => {
    const title = t("meta_title");
    const known = routeMetaKey[pathname];
    if (!known) {
      document.title = `${t("not_found_title")} · ${title}`;
    } else if (pathname === "/") {
      document.title = title;
    } else {
      document.title = `${t(known)} · ${title}`;
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
