export const academy = {
  brand: "ХАНЗ",
  followers: "72K+",
  recommend: "82%",
  langs: "3",
  phone: ["9990-7748", "9999-1573"],
  phoneRaw: ["99907748", "99991573"],
  email: "hanzacademy1@gmail.com",
  facebook: "https://www.facebook.com/HanzAcademy",
  instagram: "https://www.instagram.com/khanzacademy/",
  messenger: "https://m.me/HanzAcademy",
  shopUrl: "https://bumtankhanz.mn",
  registerUrl: "https://forms.gle/xFXQ1u7c6qnkJYhE8",
  founded: "2016",
  address:
    "СБД, 1-р хороо, Замын цагдаагийн зүүн талд, Union Building, А блок, 12 давхар, 1204",
  hours: "",
  whatsapp: "https://wa.me/97699907748",
};

export const coursesMeta = [
  {
    id: "hsk",
    titleKey: "course_hsk_t",
    descKey: "course_hsk_d",
    tagKey: "tag_course",
    icon: "汉",
  },
  {
    id: "csca",
    titleKey: "course_csca_t",
    descKey: "course_csca_d",
    tagKey: "tag_course",
    icon: "学",
  },
  {
    id: "speak",
    titleKey: "course_speak_t",
    descKey: "course_speak_d",
    tagKey: "tag_course",
    icon: "说",
  },
  {
    id: "year",
    titleKey: "course_year_t",
    descKey: "course_year_d",
    tagKey: "tag_academy",
    icon: "年",
  },
] as const;

export const chinaProgramsMeta = [
  {
    id: "bjfu",
    titleKey: "prog_bjfu_t",
    descKey: "prog_bjfu_d",
  },
  {
    id: "cq",
    titleKey: "prog_cq_t",
    descKey: "prog_cq_d",
  },
  {
    id: "nuaa",
    titleKey: "prog_nuaa_t",
    descKey: "prog_nuaa_d",
  },
  {
    id: "sc",
    titleKey: "prog_sc_t",
    descKey: "prog_sc_d",
  },
] as const;

export const branchesMeta = [
  {
    id: "ub",
    titleKey: "branch_ub_t",
    addrKey: "branch_ub_a",
    phones: ["99907748", "99991573"],
    phoneDisplay: ["9990-7748", "9999-1573"],
  },
  {
    id: "gs",
    titleKey: "branch_gs_t",
    addrKey: "branch_gs_a",
    phones: ["99870840"],
    phoneDisplay: ["9987-0840"],
  },
  {
    id: "nl",
    titleKey: "branch_nl_t",
    addrKey: "branch_nl_a",
    phones: ["90963996", "99798438"],
    phoneDisplay: ["9096-3996", "9979-8438"],
  },
  {
    id: "bo",
    titleKey: "branch_bo_t",
    addrKey: "branch_bo_a",
    phones: ["95874848"],
    phoneDisplay: ["9587-4848"],
  },
] as const;

export const newsIds = [
  {
    id: "tips",
    date: "2026.03.01",
    tagKey: "tag_course" as const,
    titleKey: "news1_t",
    excerptKey: "news1_e",
    bodyKey: "news1_b",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "scholarship",
    date: "2026.02.20",
    tagKey: "tag_study" as const,
    titleKey: "news2_t",
    excerptKey: "news2_e",
    bodyKey: "news2_b",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "agent",
    date: "2026.02.10",
    tagKey: "tag_academy" as const,
    titleKey: "news3_t",
    excerptKey: "news3_e",
    bodyKey: "news3_b",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "kids",
    date: "2026.01.28",
    tagKey: "tag_study" as const,
    titleKey: "news4_t",
    excerptKey: "news4_e",
    bodyKey: "news4_b",
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1400&q=80",
    href: "https://www.instagram.com/khanzacademy/",
  },
];

export type NewsTag = (typeof newsIds)[number]["tagKey"] | "all";

export const universitiesMeta = [
  {
    id: "china",
    countryKey: "china",
    titleKey: "china_title",
    descKey: "china_desc",
    bodyKey: "china_b",
    points: ["p1", "p2", "p3"] as const,
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "poland",
    countryKey: "poland",
    titleKey: "poland_title",
    descKey: "poland_desc",
    bodyKey: "poland_b",
    points: ["p4", "p5", "p6"] as const,
    image:
      "https://images.unsplash.com/photo-1467269204594-59904b4cbaba?auto=format&fit=crop&w=1400&q=80",
  },
];

export function getUniversityById(id: string) {
  return universitiesMeta.find((u) => u.id === id);
}

export const shopProductsMeta = [
  {
    id: "prod1",
    titleKey: "prod1",
    unitKey: "unit1",
    tagKey: "tag_brand",
    cat: "porcelain" as const,
    price: 100000,
    image: "/images/shop-1.jpg",
    href: "https://bumtankhanz.mn",
    descKey: "prod1_d",
    bodyKey: "prod1_b",
    specs: ["prod1_s1", "prod1_s2", "prod1_s3"] as const,
    inStock: true,
  },
  {
    id: "prod2",
    titleKey: "prod2",
    unitKey: "unit4",
    tagKey: "tag_best",
    cat: "porcelain" as const,
    price: 350000,
    image: "/images/shop-2.jpg",
    href: "https://bumtankhanz.mn",
    descKey: "prod2_d",
    bodyKey: "prod2_b",
    specs: ["prod2_s1", "prod2_s2", "prod2_s3"] as const,
    inStock: true,
  },
  {
    id: "prod3",
    titleKey: "prod3",
    unitKey: "unit_book",
    tagKey: "tag_course",
    cat: "books" as const,
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    href: "https://www.facebook.com/HanzAcademy",
    descKey: "prod3_d",
    bodyKey: "prod3_b",
    specs: ["prod3_s1", "prod3_s2", "prod3_s3"] as const,
    inStock: true,
  },
  {
    id: "prod4",
    titleKey: "prod4",
    unitKey: "unit_drill",
    tagKey: "tag_course",
    cat: "books" as const,
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1456513080080-7e9acb7aa9c2?auto=format&fit=crop&w=800&q=80",
    href: "https://www.facebook.com/HanzAcademy",
    descKey: "prod4_d",
    bodyKey: "prod4_b",
    specs: ["prod4_s1", "prod4_s2", "prod4_s3"] as const,
    inStock: false,
  },
];

export type ShopCat = "all" | "porcelain" | "books";

export const formatPrice = (n: number, lang: "mn" | "en" | "zh" = "mn") => {
  const locale = lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "mn-MN";
  return `${n.toLocaleString(locale)}₮`;
};

export function getNewsById(id: string) {
  return newsIds.find((n) => n.id === id);
}

export function getProductById(id: string) {
  return shopProductsMeta.find((p) => p.id === id);
}
