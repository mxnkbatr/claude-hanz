/**
 * Verify CMS admin tables + media bucket + allowlist staff.
 */
import fs from "fs";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const results = [];
function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const ref = env.SUPABASE_PROJECT_REF;
const pass = encodeURIComponent(env.SUPABASE_DB_PASSWORD);
const urls = [
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
];

async function pg() {
  for (const connectionString of urls) {
    const c = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await c.connect();
      return c;
    } catch {
      /* next */
    }
  }
  throw new Error("NO_CONN");
}

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const TABLES = ["news", "products", "courses", "travel_packages", "universities"];

for (const t of TABLES) {
  const { error } = await sb.from(t).select("id", { count: "exact", head: true });
  ok(`anon read ${t}`, !error, error?.message);
}

{
  const { error } = await sb.from("products").insert({
    slug: `hack-${Date.now()}`,
    title: { mn: "x" },
    body: { mn: "x" },
  });
  ok("anon cannot insert products", !!error, error?.message || "allowed!");
}

{
  const client = await pg();

  const staff = [
    "d.munkh2007@gmail.com",
    "baljaaotgonjargal@gmail.com",
    "munguntuyasarantuya34@gmail.com",
    "2274555053@qq.com",
    "michkabga@gmail.com",
    "tbileg427@gmail.com",
  ];
  const { rows } = await client.query(
    `select lower(email) as email from admin_allowlist where lower(email) = any($1)`,
    [staff],
  );
  ok(
    "staff allowlist complete",
    rows.length === staff.length,
    `${rows.length}/${staff.length} — ${rows.map((r) => r.email).join(",")}`,
  );

  const col = await client.query(`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='products' and column_name='filter_key'
  `);
  ok("products.filter_key column", col.rows.length === 1);

  const bucket = await client.query(
    `select id, public from storage.buckets where id='media'`,
  );
  ok("media bucket exists", bucket.rows[0]?.id === "media", JSON.stringify(bucket.rows[0]));

  await client.query("begin");
  await client.query("set local role authenticated");
  await client.query(`
    select set_config('request.jwt.claim.email', 'd.munkh2007@gmail.com', true);
    select set_config(
      'request.jwt.claims',
      '{"role":"authenticated","email":"d.munkh2007@gmail.com"}',
      true
    );
  `);

  const isAdmin = await client.query("select public.is_admin() as v");
  ok("is_admin true for owner", isAdmin.rows[0].v === true);

  const ins = await client.query(`
    insert into public.products (slug, title, body, tag, filter_key, price, in_stock, sort_order)
    values (
      'admin-verify-temp',
      '{"mn":"Шалгалт","en":"Verify","zh":"测试"}'::jsonb,
      '{"mn":"бие","en":"body","zh":"体"}'::jsonb,
      '{"mn":"tag","en":"tag","zh":"tag"}'::jsonb,
      'porcelain',
      1000,
      true,
      999
    )
    on conflict (slug) do update set price = 1000
    returning slug, filter_key
  `);
  ok(
    "admin can upsert product",
    ins.rows[0]?.slug === "admin-verify-temp" && ins.rows[0]?.filter_key === "porcelain",
  );

  await client.query(`delete from public.products where slug='admin-verify-temp'`);
  await client.query("rollback");
  await client.end();
}

{
  const envEmails = (env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  ok("VITE_ADMIN_EMAILS has 6 staff", envEmails.length >= 6, String(envEmails.length));
}

const failed = results.filter((r) => !r.pass);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.name).join(", "));
  process.exitCode = 1;
}
