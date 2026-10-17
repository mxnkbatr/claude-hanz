import { useI18n } from "../i18n/I18nContext";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizes = { sm: 38, md: 48, lg: 72 };

export function Logo({ size = "md", showText = true }: LogoProps) {
  const { t } = useI18n();
  const px = sizes[size];
  return (
    <span className="brand-logo">
      <img
        src="/images/logo-official.webp"
        alt={t("brand")}
        width={px}
        height={px}
        className="brand-logo-img"
        style={{ width: px, height: px }}
      />
      {showText && (
        <span className="brand-logo-text">
          <strong>{t("brand")}</strong>
          <small>{t("brand_sub")}</small>
        </span>
      )}
    </span>
  );
}
