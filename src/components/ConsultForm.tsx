import { useState, type FormEvent } from "react";
import { SuccessBurst } from "./SuccessBurst";
import { supabase } from "../lib/supabase";
import { useI18n } from "../i18n/I18nContext";

export function ConsultForm({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const country = String(data.get("country") || "");
    const msg = String(data.get("msg") || "").trim();

    if (!name || !phone) return;

    const interest =
      country === "china"
        ? "travel_china"
        : country === "poland"
          ? "travel_poland"
          : "consult";

    setStatus("sending");
    const { error } = await supabase.from("enrollments").insert({
      name,
      phone,
      kind: "consult",
      interest,
      child_age: null,
      message: msg
        ? `${t("form_country")}: ${country}\n${msg}`
        : `${t("form_country")}: ${country}`,
    });

    if (error) {
      console.error("[consult]", error);
      setStatus("err");
      return;
    }
    setStatus("ok");
    e.currentTarget.reset();
  };

  if (status === "ok") {
    return (
      <SuccessBurst
        title={t("form_success_title")}
        message={t("form_ok")}
        doneLabel={t("back")}
        onDone={() => setStatus("idle")}
      />
    );
  }

  return (
    <form
      className={`consult-form${compact ? " is-compact" : ""}`}
      onSubmit={onSubmit}
    >
      <h3>{t("form_title")}</h3>
      <label>
        <span>{t("form_name")}</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>{t("form_phone")}</span>
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      <label>
        <span>{t("form_country")}</span>
        <select name="country" required defaultValue="">
          <option value="" disabled>
            —
          </option>
          <option value="china">{t("form_country_china")}</option>
          <option value="poland">{t("form_country_poland")}</option>
          <option value="both">{t("form_country_both")}</option>
        </select>
      </label>
      <label>
        <span>{t("form_msg")}</span>
        <textarea name="msg" rows={compact ? 3 : 4} />
      </label>
      {status === "err" && <p className="form-err">{t("form_err")}</p>}
      <button
        type="submit"
        className="btn btn-seal"
        disabled={status === "sending"}
      >
        <span>
          {status === "sending" ? t("form_sending") : t("form_send")}
        </span>
      </button>
    </form>
  );
}
