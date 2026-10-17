import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { MultiLangField } from "../../components/admin/MultiLangField";
import {
  createCms,
  listCms,
  removeCms,
  updateCms,
  type CmsRow,
  type CmsTable,
} from "../../lib/cmsApi";
import { emptyI18nText, slugify, type I18nText } from "../../lib/i18nText";
import { useI18n } from "../../i18n/I18nContext";
import { hapticLight } from "../../lib/native";

type CollectionKey = "news" | "products" | "courses" | "travel" | "universities";

const TABLE: Record<CollectionKey, CmsTable> = {
  news: "news",
  products: "products",
  courses: "courses",
  travel: "travel_packages",
  universities: "universities",
};

const TITLE_KEY: Record<CollectionKey, string> = {
  news: "nav_news",
  products: "nav_shop",
  courses: "nav_courses",
  travel: "nav_travel",
  universities: "nav_uni",
};

type Draft = {
  id?: string;
  slug: string;
  title: I18nText;
  body: I18nText;
  excerpt: I18nText;
  tag: I18nText;
  city: I18nText;
  duration: I18nText;
  filter_key: string;
  image_url: string;
  price: string;
  in_stock: boolean;
  hidden: boolean;
  sort_order: number;
  published_at: string;
};

function blankDraft(): Draft {
  return {
    slug: "",
    title: emptyI18nText(),
    body: emptyI18nText(),
    excerpt: emptyI18nText(),
    tag: emptyI18nText(),
    city: emptyI18nText(),
    duration: emptyI18nText(),
    filter_key: "tag_academy",
    image_url: "",
    price: "0",
    in_stock: true,
    hidden: false,
    sort_order: 0,
    published_at: new Date().toISOString().slice(0, 10),
  };
}

function rowToDraft(r: CmsRow, collection: CollectionKey = "news"): Draft {
  const fallbackFilter =
    collection === "products"
      ? "porcelain"
      : collection === "courses"
        ? "classroom"
        : "tag_academy";
  return {
    id: r.id,
    slug: r.slug,
    title: r.title || emptyI18nText(),
    body: r.body || emptyI18nText(),
    excerpt: r.excerpt || emptyI18nText(),
    tag: r.tag || emptyI18nText(),
    city: r.city || emptyI18nText(),
    duration: r.duration || emptyI18nText(),
    filter_key: r.filter_key || fallbackFilter,
    image_url: r.image_url || "",
    price: String(r.price ?? 0),
    in_stock: r.in_stock ?? true,
    hidden: r.hidden,
    sort_order: r.sort_order ?? 0,
    published_at: (r.published_at || "").slice(0, 10),
  };
}

export function AdminCollection({
  collection = "news",
}: {
  collection?: CollectionKey;
}) {
  const key = (
    ["news", "products", "courses", "travel", "universities"].includes(
      collection,
    )
      ? collection
      : "news"
  ) as CollectionKey;
  const table = TABLE[key];
  const { t, lang } = useI18n();

  const [rows, setRows] = useState<CmsRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    const { data, error } = await listCms(table, { includeHidden: true });
    if (error) setErr(error);
    else {
      setErr("");
      setRows(data);
    }
  };

  useEffect(() => {
    setDraft(null);
    void load();
  }, [table]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.sort_order - b.sort_order),
    [rows],
  );

  function openNew() {
    const d = blankDraft();
    d.sort_order = rows.length;
    if (key === "products") d.filter_key = "porcelain";
    if (key === "courses") d.filter_key = "classroom";
    setDraft(d);
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    void hapticLight();
    const slug =
      draft.slug.trim() ||
      slugify(draft.title.mn || draft.title.en || draft.title.zh || "item");

    const base: Partial<CmsRow> = {
      slug,
      title: draft.title,
      body: draft.body,
      image_url: draft.image_url || null,
      hidden: draft.hidden,
      sort_order: Number(draft.sort_order) || 0,
    };

    if (key === "news") {
      Object.assign(base, {
        excerpt: draft.excerpt,
        tag: draft.tag,
        filter_key: draft.filter_key,
        published_at: draft.published_at || null,
      });
    }
    if (key === "products") {
      Object.assign(base, {
        tag: draft.tag,
        filter_key: draft.filter_key || "porcelain",
        price: Number(draft.price) || 0,
        in_stock: draft.in_stock,
      });
    }
    if (key === "courses") {
      Object.assign(base, {
        tag: draft.tag,
        filter_key: draft.filter_key || "classroom",
      });
    }
    if (key === "travel") {
      Object.assign(base, {
        tag: draft.tag,
        duration: draft.duration,
        price: draft.price === "" ? null : Number(draft.price) || 0,
      });
    }
    if (key === "universities") {
      Object.assign(base, {
        city: draft.city,
      });
    }

    const res = draft.id
      ? await updateCms(table, draft.id, base)
      : await createCms(table, base);

    setBusy(false);
    if (res.error) {
      setErr(res.error);
      return;
    }
    setDraft(null);
    await load();
  }

  async function toggleHidden(row: CmsRow) {
    setBusy(true);
    const { error } = await updateCms(table, row.id, { hidden: !row.hidden });
    setBusy(false);
    if (error) setErr(error);
    else await load();
  }

  async function del(row: CmsRow) {
    if (!confirm(t("admin_delete_confirm"))) return;
    setBusy(true);
    const { error } = await removeCms(table, row.id);
    setBusy(false);
    if (error) setErr(error);
    else await load();
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t(TITLE_KEY[key])}</h1>
        <p>{t("admin_cms_lead")}</p>
        <button type="button" className="admin-btn is-seal" onClick={openNew}>
          + {t("admin_add")}
        </button>
      </header>

      {err && <p className="admin-err">{err}</p>}

      {draft && (
        <section className="admin-card admin-cms-form">
          <div className="admin-card-head">
            <h2>{draft.id ? t("admin_edit") : t("admin_add")}</h2>
            <button
              type="button"
              className="admin-ghost-btn"
              onClick={() => setDraft(null)}
            >
              {t("admin_cancel")}
            </button>
          </div>

          <div className="admin-form-grid">
            <MultiLangField
              label={t("admin_title_field")}
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
            />
            {(key === "news" || key === "products" || key === "courses" || key === "travel") && (
              <MultiLangField
                label={t("admin_tag_field")}
                value={draft.tag}
                onChange={(tag) => setDraft({ ...draft, tag })}
              />
            )}
            {key === "news" && (
              <MultiLangField
                label={t("admin_excerpt_field")}
                value={draft.excerpt}
                onChange={(excerpt) => setDraft({ ...draft, excerpt })}
                multiline
                rows={3}
              />
            )}
            <MultiLangField
              label={t("admin_body_field")}
              value={draft.body}
              onChange={(body) => setDraft({ ...draft, body })}
              multiline
              rows={6}
            />
            {key === "universities" && (
              <MultiLangField
                label={t("uni_filter_label")}
                value={draft.city}
                onChange={(city) => setDraft({ ...draft, city })}
              />
            )}
            {key === "travel" && (
              <MultiLangField
                label={t("admin_duration_field")}
                value={draft.duration}
                onChange={(duration) => setDraft({ ...draft, duration })}
              />
            )}

            <ImageUpload
              value={draft.image_url}
              onChange={(image_url) => setDraft({ ...draft, image_url })}
              folder={key}
            />

            <label className="admin-field">
              <span>Slug</span>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="auto"
              />
            </label>

            <label className="admin-field">
              <span>{t("admin_sort")}</span>
              <input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                }
              />
            </label>

            {(key === "products" || key === "travel") && (
              <label className="admin-field">
                <span>{t("admin_price")}</span>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </label>
            )}

            {key === "products" && (
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={draft.in_stock}
                  onChange={(e) =>
                    setDraft({ ...draft, in_stock: e.target.checked })
                  }
                />
                <span>{t("admin_in_stock")}</span>
              </label>
            )}

            {key === "news" && (
              <label className="admin-field">
                <span>{t("admin_date")}</span>
                <input
                  type="date"
                  value={draft.published_at}
                  onChange={(e) =>
                    setDraft({ ...draft, published_at: e.target.value })
                  }
                />
              </label>
            )}

            {key === "products" && (
              <label className="admin-field">
                <span>{t("shop_filter_label")}</span>
                <select
                  value={draft.filter_key || "porcelain"}
                  onChange={(e) =>
                    setDraft({ ...draft, filter_key: e.target.value })
                  }
                >
                  <option value="porcelain">{t("cat_porcelain")}</option>
                  <option value="books">{t("cat_books")}</option>
                </select>
              </label>
            )}

            {(key === "news" || key === "courses") && (
              <label className="admin-field">
                <span>{t("admin_filter_key")}</span>
                <input
                  value={draft.filter_key}
                  onChange={(e) =>
                    setDraft({ ...draft, filter_key: e.target.value })
                  }
                />
              </label>
            )}

            <label className="admin-check">
              <input
                type="checkbox"
                checked={draft.hidden}
                onChange={(e) =>
                  setDraft({ ...draft, hidden: e.target.checked })
                }
              />
              <span>{t("admin_hide")}</span>
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn is-seal"
              disabled={busy}
              onClick={() => void save()}
            >
              {t("admin_save")}
            </button>
          </div>
        </section>
      )}

      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin_sort")}</th>
                <th>{t("admin_title_field")}</th>
                <th>{t("admin_status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4}>{t("admin_cms_empty")}</td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.id}>
                    <td>{r.sort_order}</td>
                    <td>
                      <strong>
                        {r.title?.[lang] ||
                          r.title?.mn ||
                          r.title?.en ||
                          r.slug}
                      </strong>
                      <em className="admin-muted"> {r.slug}</em>
                    </td>
                    <td>{r.hidden ? t("admin_hide") : t("admin_visible")}</td>
                    <td className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => setDraft(rowToDraft(r, key))}
                      >
                        {t("admin_edit")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busy}
                        onClick={() => void toggleHidden(r)}
                      >
                        {r.hidden ? t("admin_show") : t("admin_hide")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn is-danger"
                        disabled={busy}
                        onClick={() => void del(r)}
                      >
                        {t("admin_delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
