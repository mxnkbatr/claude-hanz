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

const ref = env.SUPABASE_PROJECT_REF;
const pass = encodeURIComponent(env.SUPABASE_DB_PASSWORD);
const urls = [
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

let client;
for (const connectionString of urls) {
  const c = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  });
  try {
    await c.connect();
    client = c;
    console.log("CONNECTED");
    break;
  } catch (e) {
    console.log("fail", String(e.message).slice(0, 80));
  }
}
if (!client) throw new Error("NO_CONN");

const grants = await client.query(`
  select grantee, privilege_type
  from information_schema.role_table_grants
  where table_name='enrollments'
  order by 1,2
`);
console.log("grants", grants.rows);

const rls = await client.query(`
  select relrowsecurity, relforcerowsecurity
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='enrollments'
`);
console.log("rls", rls.rows[0]);

// try as anon
try {
  await client.query("begin");
  await client.query("set local role anon");
  await client.query("set local request.jwt.claim.role = 'anon'");
  const ins = await client.query(`
    insert into public.enrollments (name, phone, kind, interest, message)
    values ('SQL Anon', '99112233', 'consult', 'consult', 'sql-test')
    returning id, status
  `);
  console.log("sql anon insert", ins.rows[0]);
  await client.query("rollback");
} catch (e) {
  console.log("sql anon insert ERR", e.message);
  await client.query("rollback").catch(() => {});
}

await client.end();

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error, status, statusText } = await sb
  .from("enrollments")
  .insert({
    name: "JS Anon",
    phone: "99887766",
    kind: "consult",
    interest: "consult",
  })
  .select("id");
console.log("js insert", { data, error, status, statusText });

// site_content update with count
const upd = await sb
  .from("site_content")
  .update({ data: { probe: true } })
  .eq("id", 1)
  .select("id,data");
console.log("site update as anon", {
  data: upd.data,
  error: upd.error,
  count: upd.data?.length,
});
