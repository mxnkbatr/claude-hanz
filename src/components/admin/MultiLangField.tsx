import { useState } from "react";
import type { I18nText } from "../../lib/i18nText";
import { emptyI18nText } from "../../lib/i18nText";

const TABS = [
  { code: "mn" as const, label: "MN" },
  { code: "en" as const, label: "EN" },
  { code: "zh" as const, label: "中文" },
];

type Props = {
  label: string;
  value?: I18nText | null;
  onChange: (next: I18nText) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
};

export function MultiLangField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder = "",
}: Props) {
  const [tab, setTab] = useState<"mn" | "en" | "zh">("mn");
  const v = value ?? emptyI18nText();

  return (
    <label className="admin-field admin-mlang">
      <span>{label}</span>
      <div className="admin-mlang-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.code}
            type="button"
            role="tab"
            aria-selected={tab === t.code}
            className={`admin-mlang-tab${tab === t.code ? " is-active" : ""}`}
            onClick={() => setTab(t.code)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          value={v[tab] || ""}
          placeholder={placeholder}
          onChange={(e) => onChange({ ...v, [tab]: e.target.value })}
        />
      ) : (
        <input
          type="text"
          value={v[tab] || ""}
          placeholder={placeholder}
          onChange={(e) => onChange({ ...v, [tab]: e.target.value })}
        />
      )}
    </label>
  );
}
