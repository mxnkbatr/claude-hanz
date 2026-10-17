import { useState } from "react";
import { uploadMedia } from "../../lib/cmsApi";
import { useI18n } from "../../i18n/I18nContext";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;

async function fileToWebp(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.78),
  );
  if (!blob) throw new Error("webp encode failed");
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
};

export function ImageUpload({ value, onChange, folder = "cms" }: Props) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    setErr("");
    if (file.size > MAX_BYTES) {
      setErr(t("admin_img_too_big"));
      return;
    }
    setBusy(true);
    try {
      const webp = await fileToWebp(file);
      const { url, error } = await uploadMedia(webp, folder);
      if (error || !url) {
        setErr(error || "upload failed");
        return;
      }
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-upload">
      <span className="admin-upload-label">{t("admin_image_url")}</span>
      {value && (
        <div className="admin-upload-preview">
          <img src={value} alt="" />
        </div>
      )}
      <div className="admin-upload-row">
        <input
          type="url"
          value={value || ""}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
        />
        <label className={`admin-btn${busy ? " is-busy" : ""}`}>
          {busy ? t("auth_busy") : t("admin_upload")}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {err && <p className="admin-err">{err}</p>}
    </div>
  );
}
