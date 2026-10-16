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
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.data && typeof data.data === "object") {
      setBundle({ ...emptyBundle(), ...(data.data as SiteBundle) });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveBundle = useCallback(async (next: SiteBundle) => {
    const { error } = await supabase
      .from("site_content")
      .upsert({
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
      newsLive: mergeNews(bundle),
      productsLive: mergeProducts(bundle),
      coursesLive: mergeCourses(bundle),
      travelLive: mergeTravel(bundle),
      universitiesLive: mergeUniversities(bundle),
    }),
    [bundle, loading, refresh, saveBundle],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
