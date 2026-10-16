import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  enrollInterests,
  kidsLevels,
  kidsSchedules,
} from "../data/content";
import { EnrollForm } from "../components/EnrollForm";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function Enroll() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const interest = useMemo(() => {
    const raw = params.get("interest") || "consult";
    return enrollInterests.some((i) => i.id === raw) ? raw : "consult";
  }, [params]);
  const level = useMemo(() => {
    const raw = params.get("level") || kidsLevels[0].id;
    return kidsLevels.some((l) => l.id === raw) ? raw : kidsLevels[0].id;
  }, [params]);
  const schedule = useMemo(() => {
    const raw = params.get("schedule") || kidsSchedules[0].id;
    return kidsSchedules.some((s) => s.id === raw) ? raw : kidsSchedules[0].id;
  }, [params]);

  return (
    <PageShell className="page-enroll is-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">
            {interest === "kids" ? t("kids_enroll_title") : t("enroll_page")}
          </h1>
          {interest === "kids" && (
            <p className="lead">{t("kids_enroll_lead")}</p>
          )}
        </Reveal>
      </header>

      <section className="section tight section-last enroll-wrap">
        <Reveal>
          <EnrollForm
            defaultInterest={interest}
            defaultLevel={level}
            defaultSchedule={schedule}
            compact
          />
        </Reveal>
      </section>
    </PageShell>
  );
}
