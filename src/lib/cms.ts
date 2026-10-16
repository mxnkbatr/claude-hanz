import {
  academy,
  coursesMeta,
  newsIds,
  shopProductsMeta,
  travelPackagesMeta,
  universitiesMeta,
} from "../data/content";

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

export function mergeAcademy(bundle: SiteBundle) {
  return { ...academy, ...bundle.settings };
}

export function mergeNews(bundle: SiteBundle) {
  return newsIds
    .map((n) => {
      const o = bundle.news?.[n.id];
      if (!o) return n;
      return {
        ...n,
        date: o.date ?? n.date,
        image: o.image ?? n.image,
        hidden: o.hidden ?? false,
      };
    })
    .filter((n) => !("hidden" in n && n.hidden));
}

export function mergeProducts(bundle: SiteBundle) {
  return shopProductsMeta
    .map((p) => {
      const o = bundle.products?.[p.id];
      if (!o) return p;
      return {
        ...p,
        price: o.price ?? p.price,
        inStock: o.inStock ?? p.inStock,
        image: o.image ?? p.image,
        hidden: o.hidden ?? false,
      };
    })
    .filter((p) => !("hidden" in p && p.hidden));
}

export function mergeCourses(bundle: SiteBundle) {
  const hidden = new Set(bundle.hiddenCourses ?? []);
  return coursesMeta.filter((c) => !hidden.has(c.id));
}

export function mergeTravel(bundle: SiteBundle) {
  const hidden = new Set(bundle.hiddenTravel ?? []);
  return travelPackagesMeta.filter((t) => !hidden.has(t.id));
}

export function mergeUniversities(bundle: SiteBundle) {
  const hidden = new Set(bundle.hiddenUniversity ?? []);
  return universitiesMeta.filter((u) => !hidden.has(u.id));
}

export const ADMIN_PAGES = [
  { id: "home", to: "/", key: "nav_home", adminTo: "/admin/pages/home" },
  { id: "courses", to: "/courses", key: "nav_courses", adminTo: "/admin/pages/courses" },
  { id: "news", to: "/medee", key: "nav_news", adminTo: "/admin/pages/news" },
  { id: "university", to: "/university", key: "nav_uni", adminTo: "/admin/pages/university" },
  { id: "travel", to: "/travel", key: "nav_travel", adminTo: "/admin/pages/travel" },
  { id: "shop", to: "/shop", key: "nav_shop", adminTo: "/admin/pages/shop" },
  { id: "quiz", to: "/quiz", key: "nav_quiz", adminTo: "/admin/pages/quiz" },
  { id: "about", to: "/about", key: "nav_about", adminTo: "/admin/pages/about" },
  { id: "contact", to: "/contact", key: "nav_contact", adminTo: "/admin/pages/contact" },
  { id: "enroll", to: "/enroll", key: "register_cta", adminTo: "/admin/leads" },
] as const;
