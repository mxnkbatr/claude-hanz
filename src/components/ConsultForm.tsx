import { useState, type FormEvent } from "react";
import { academy } from "../data/content";
import { useI18n } from "../i18n/I18nContext";

export function ConsultForm({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const phone = String(data.get("phone") || "");
    const country = String(data.get("country") || "");
    const msg = String(data.get("msg") || "");
    const body = encodeURIComponent(
      `${t("form_name")}: ${name}\n${t("form_phone")}: ${phone}\n${t("form_country")}: ${country}\n${t("form_msg")}: ${msg}`,
    );
    window.location.href = `mailto:${academy.email}?subject=${encodeURIComponent(t("form_title"))}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return <p className="form-ok">{t("form_ok")}</p>;
  }

  return (
    <form className={`consult-form${compact ? " is-compact" : ""}`} onSubmit={onSubmit}>
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
      <button type="submit" className="btn btn-seal">
        <span>{t("form_send")}</span>
      </button>
    </form>
  );
}
