import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { listCms, type CmsRow } from "./cmsApi";
import {
  emptyBundle,
  mergeAcademy,
  mergeCourses,
  mergeNews,
  mergeProducts,
  mergeTravel,
  mergeUniversities,
  type SiteBundle,
} from "./cms";

type Ctx = {
  bundle: SiteBundle;
  loading: boolean;
  saveBundle: (next: SiteBundle) => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
  academyLive: ReturnType<typeof mergeAcademy>;
  newsLive: ReturnType<typeof mergeNews>;
  productsLive: ReturnType<typeof mergeProducts>;
  coursesLive: ReturnType<typeof mergeCourses>;
  travelLive: ReturnType<typeof mergeTravel>;
  universitiesLive: ReturnType<typeof mergeUniversities>;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<SiteBundle>(emptyBundle);
  const [cms, setCms] = useState<{
    news: CmsRow[];
    products: CmsRow[];
    courses: CmsRow[];
    travel: CmsRow[];
    universities: CmsRow[];
  }>({
    news: [],
    products: [],
    courses: [],
    travel: [],
    universities: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [siteRes, news, products, courses, travel, universities] =
      await Promise.all([
        supabase.from("site_content").select("data").eq("id", 1).maybeSingle(),
        listCms("news"),
        listCms("products"),
        listCms("courses"),
        listCms("travel_packages"),
        listCms("universities"),
      ]);

    if (!siteRes.error && siteRes.data?.data && typeof siteRes.data.data === "object") {
      setBundle({ ...emptyBundle(), ...(siteRes.data.data as SiteBundle) });
    }

    setCms({
      news: news.error ? [] : news.data,
      products: products.error ? [] : products.data,
      courses: courses.error ? [] : courses.data,
      travel: travel.error ? [] : travel.data,
      universities: universities.error ? [] : universities.data,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveBundle = useCallback(async (next: SiteBundle) => {
    const { error } = await supabase.from("site_content").upsert({
      id: 1,
      data: next,
      updated_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
    setBundle(next);
    return {};
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      bundle,
      loading,
      saveBundle,
      refresh,
      academyLive: mergeAcademy(bundle),
      newsLive: mergeNews(bundle, cms.news),
      productsLive: mergeProducts(bundle, cms.products),
      coursesLive: mergeCourses(bundle, cms.courses),
      travelLive: mergeTravel(bundle, cms.travel),
      universitiesLive: mergeUniversities(bundle, cms.universities),
    }),
    [bundle, cms, loading, refresh, saveBundle],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteCtx);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}
