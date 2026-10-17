import type { Lang } from "../i18n/translations";

export type I18nText = {
  mn?: string;
  en?: string;
  zh?: string;
};

export function emptyI18nText(): I18nText {
  return { mn: "", en: "", zh: "" };
}

/** Prefer DB localized text; fall back to translation key. */
export function loc(
  lang: Lang,
  t: (key: string) => string,
  localized?: I18nText | null,
  fallbackKey?: string,
): string {
  const direct = localized?.[lang]?.trim();
  if (direct) return direct;
  if (fallbackKey) return t(fallbackKey);
  return (
    localized?.mn?.trim() ||
    localized?.en?.trim() ||
    localized?.zh?.trim() ||
    ""
  );
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `item-${Date.now().toString(36)}`;
}
