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
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`,
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

// A) Form-style insert (no .select) — what EnrollForm/ConsultForm do
{
  const phone = `98${Date.now().toString().slice(-6)}`;
  const { error } = await sb.from("enrollments").insert({
    name: "Form Style",
    phone,
    kind: "consult",
    interest: "consult",
    message: "verify no-select",
  });
  ok("public form insert (no select)", !error, error?.message);
}

// B) site_content read
{
  const { data, error } = await sb
    .from("site_content")
    .select("id,data")
    .eq("id", 1)
    .maybeSingle();
  ok("site_content read", !error && data?.id === 1, error?.message);
}

// C) site_content anon update should affect 0 rows
{
  const before = await sb.from("site_content").select("data").eq("id", 1).maybeSingle();
  const { data, error } = await sb
    .from("site_content")
    .update({ data: { ...(before.data?.data || {}), __hack: true } })
    .eq("id", 1)
    .select("data");
  const hacked = Boolean(data?.[0]?.data?.__hack);
  ok("site_content anon cannot update", !hacked && !error, hacked ? "was writable" : "blocked");
}

// D) Admin flows via SQL JWT simulation
{
  const client = await pg();
  const seed = await client.query(`
    insert into public.enrollments (name, phone, kind, interest, message)
    values ('Admin Check', '98123456', 'course', 'hsk', 'full-verify')
    returning id
  `);
  const id = seed.rows[0].id;

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
  ok("is_admin(d.munkh2007@gmail.com)", isAdmin.rows[0].v === true);

  const listed = await client.query(
    "select id, status from enrollments where id=$1",
    [id],
  );
  ok("admin can list lead", listed.rows.length === 1);

  const statusUpd = await client.query(
    `update enrollments set status='done', admin_note='ok', updated_at=now()
     where id=$1 returning status, admin_note`,
    [id],
  );
  ok(
    "admin status+note update",
    statusUpd.rows[0]?.status === "done" && statusUpd.rows[0]?.admin_note === "ok",
  );

  const site = await client.query(`
    update site_content
    set data = coalesce(data,'{}'::jsonb) || '{"notes":{"verify":"1"}}'::jsonb,
        updated_at = now()
    where id = 1
    returning (data->'notes'->>'verify') as v
  `);
  ok("admin site_content save", site.rows[0]?.v === "1", JSON.stringify(site.rows[0]));

  const del = await client.query(
    "delete from enrollments where id=$1 returning id",
    [id],
  );
  ok("admin delete lead", del.rows[0]?.id === id);

  await client.query("rollback");

  // cleanup any form-style leftovers
  await client.query(
    `delete from enrollments where name in ('Form Style','Admin Check','JS After Fix','Policy Fix')`,
  );
  // reset site_content probe keys if committed earlier — none committed due to rollback
  await client.end();
}

// E) env gate
{
  const emails = (env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  ok("env admin email", emails.includes("d.munkh2007@gmail.com"));
}

// F) allowlist seeded
{
  const client = await pg();
  const { rows } = await client.query(
    `select email from admin_allowlist where lower(email)=lower('d.munkh2007@gmail.com')`,
  );
  ok("allowlist seeded", rows.length === 1, rows[0]?.email);
  await client.end();
}

const failed = results.filter((r) => !r.pass);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.name).join(", "));
  process.exitCode = 1;
}
