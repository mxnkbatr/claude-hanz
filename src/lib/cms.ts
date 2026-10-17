import {
  academy,
  coursesMeta,
  newsIds,
  shopProductsMeta,
  travelPackagesMeta,
  chinaProgramsMeta,
} from "../data/content";
import type { CmsRow } from "./cmsApi";
import type { I18nText } from "./i18nText";

export type LeadStatus = "new" | "contacted" | "done" | "spam";

export type EnrollmentRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  phone: string;
  kind: "course" | "travel" | "consult";
  interest: string;
  child_age: string | null;
  message: string | null;
  status: LeadStatus;
  admin_note: string | null;
};

export type ProductOverride = {
  price?: number;
  inStock?: boolean;
  hidden?: boolean;
  image?: string;
};

export type NewsOverride = {
  date?: string;
  image?: string;
  hidden?: boolean;
};

export type SiteSettings = Partial<{
  phone: string[];
  phoneRaw: string[];
  email: string;
  facebook: string;
  instagram: string;
  messenger: string;
  shopUrl: string;
  address: string;
  whatsapp: string;
}>;

export type SiteBundle = {
  settings?: SiteSettings;
  products?: Record<string, ProductOverride>;
  news?: Record<string, NewsOverride>;
  hiddenCourses?: string[];
  hiddenTravel?: string[];
  hiddenUniversity?: string[];
  notes?: Record<string, string>;
};

export const emptyBundle = (): SiteBundle => ({
  settings: {},
  products: {},
  news: {},
  hiddenCourses: [],
  hiddenTravel: [],
  hiddenUniversity: [],
  notes: {},
});

/** Unified live item — DB localized fields + optional i18n key fallbacks. */
export type NewsLive = {
  id: string;
  date: string;
  tagKey: string;
  titleKey?: string;
  excerptKey?: string;
  bodyKey?: string;
  title?: I18nText;
  excerpt?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  image: string;
  href?: string;
  fromDb?: boolean;
};

export type ProductLive = {
  id: string;
  titleKey?: string;
  descKey?: string;
  bodyKey?: string;
  unitKey?: string;
  tagKey?: string;
  cat?: "porcelain" | "books" | string;
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  price: number;
  inStock: boolean;
  image: string;
  href?: string;
  specs?: readonly string[];
  fromDb?: boolean;
};

export type CourseLive = {
  id: string;
  titleKey: string;
  descKey: string;
  tagKey: string;
  unitKey: string;
  filter: string;
  image: string;
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  fromDb?: boolean;
};

export type TravelLive = {
  id: string;
  titleKey: string;
  descKey: string;
  bodyKey: string;
  tagKey: string;
  image: string;
  highlights: readonly string[];
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  duration?: I18nText;
  fromDb?: boolean;
  enrollWindows?: (typeof travelPackagesMeta)[number]["enrollWindows"];
};

export type UniversityLive = {
  id: string;
  titleKey?: string;
  descKey?: string;
  nameMnKey?: string;
  nameZhKey?: string;
  cityKey?: string;
  title?: I18nText;
  body?: I18nText;
  city?: I18nText;
  image: string;
  fromDb?: boolean;
};

export function mergeAcademy(bundle: SiteBundle) {
  return { ...academy, ...bundle.settings };
}

function dateFromDb(d?: string | null) {
  if (!d) return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  return d.slice(0, 10).replace(/-/g, ".");
}

export function mergeNews(bundle: SiteBundle, dbRows: CmsRow[] = []): NewsLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({
        id: r.slug || r.id,
        date: dateFromDb(r.published_at),
        tagKey: r.filter_key || "tag_academy",
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        tag: r.tag,
        image: r.image_url || "",
        fromDb: true,
      }));
  }

  return newsIds
    .map((n) => {
      const o = bundle.news?.[n.id];
      if (!o) return { ...n } as NewsLive;
      return {
        ...n,
        date: o.date ?? n.date,
        image: o.image ?? n.image,
        hidden: o.hidden ?? false,
      } as NewsLive & { hidden?: boolean };
    })
    .filter((n) => !("hidden" in n && n.hidden));
}

export function mergeProducts(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): ProductLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base = shopProductsMeta.find((p) => p.id === r.slug);
        const cat = r.filter_key || base?.cat || "";
        return {
          id: r.slug || r.id,
          title: r.title,
          body: r.body,
          tag: r.tag,
          cat: cat || undefined,
          price: Number(r.price ?? 0),
          inStock: r.in_stock ?? true,
          image: r.image_url || base?.image || "",
          titleKey: base?.titleKey,
          descKey: base?.descKey,
          bodyKey: base?.bodyKey,
          unitKey: base?.unitKey,
          tagKey: base?.tagKey,
          fromDb: true,
        };
      });
  }

  return shopProductsMeta
    .map((p) => {
      const o = bundle.products?.[p.id];
      if (!o) return { ...p } as ProductLive;
      return {
        ...p,
        price: o.price ?? p.price,
        inStock: o.inStock ?? p.inStock,
        image: o.image ?? p.image,
        hidden: o.hidden ?? false,
      } as ProductLive & { hidden?: boolean };
    })
    .filter((p) => !("hidden" in p && p.hidden));
}

export function mergeCourses(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): CourseLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base = coursesMeta.find((c) => c.id === r.slug) ?? coursesMeta[0];
        return {
          ...base,
          id: r.slug || r.id,
          filter: r.filter_key || base.filter,
          image: r.image_url || base.image,
          title: r.title,
          body: r.body,
          tag: r.tag,
          fromDb: true,
        };
      });
  }
  const hidden = new Set(bundle.hiddenCourses ?? []);
  return coursesMeta
    .filter((c) => !hidden.has(c.id))
    .map((c) => ({ ...c }) as CourseLive);
}

export function mergeTravel(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): TravelLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base =
          travelPackagesMeta.find((t) => t.id === r.slug) ??
          travelPackagesMeta[0];
        return {
          ...base,
          id: r.slug || r.id,
          image: r.image_url || base.image,
          title: r.title,
          body: r.body,
          tag: r.tag,
          duration: r.duration,
          fromDb: true,
        };
      });
  }
  const hidden = new Set(bundle.hiddenTravel ?? []);
  return travelPackagesMeta
    .filter((t) => !hidden.has(t.id))
    .map((t) => ({ ...t }) as TravelLive);
}

export function mergeUniversities(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): UniversityLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({
        id: r.slug || r.id,
        title: r.title,
        body: r.body,
        city: r.city,
        image: r.image_url || "",
        fromDb: true,
      }));
  }
  const hidden = new Set(bundle.hiddenUniversity ?? []);
  return chinaProgramsMeta
    .filter((u) => !hidden.has(u.id))
    .map((u) => ({
      id: u.id,
      titleKey: u.titleKey,
      descKey: u.descKey,
      nameMnKey: u.nameMnKey,
      nameZhKey: u.nameZhKey,
      cityKey: u.cityKey,
      image: u.image,
    }));
}

export const ADMIN_PAGES = [
  { id: "home", to: "/", key: "nav_home", adminTo: "/admin/pages/home" },
  { id: "courses", to: "/courses", key: "nav_courses", adminTo: "/admin/courses" },
  { id: "news", to: "/medee", key: "nav_news", adminTo: "/admin/news" },
  { id: "university", to: "/university", key: "nav_uni", adminTo: "/admin/universities" },
  { id: "travel", to: "/travel", key: "nav_travel", adminTo: "/admin/travel" },
  { id: "shop", to: "/shop", key: "nav_shop", adminTo: "/admin/products" },
  { id: "quiz", to: "/quiz", key: "nav_quiz", adminTo: "/admin/pages/quiz" },
  { id: "about", to: "/about", key: "nav_about", adminTo: "/admin/pages/about" },
  { id: "contact", to: "/contact", key: "nav_contact", adminTo: "/admin/pages/contact" },
  { id: "enroll", to: "/enroll", key: "register_cta", adminTo: "/admin/leads" },
] as const;
