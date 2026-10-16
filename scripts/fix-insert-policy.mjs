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
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
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
    break;
  } catch {
    /* next */
  }
}
if (!client) throw new Error("NO_CONN");

await client.query(`
  drop policy if exists "anon_insert_enrollments" on public.enrollments;
  create policy "anon_insert_enrollments"
    on public.enrollments
    for insert
    to public
    with check (true);
`);

// Test as anon
await client.query("begin");
await client.query("set local role anon");
const who = await client.query("select current_user, session_user");
console.log("who", who.rows[0]);
try {
  const ins = await client.query(`
    insert into public.enrollments (name, phone, kind, interest, message)
    values ('Policy Fix', '99001122', 'consult', 'consult', 'policy-fix')
    returning id, status
  `);
  console.log("anon insert OK", ins.rows[0]);
} catch (e) {
  console.log("anon insert FAIL", e.message);
}
await client.query("rollback");

// Simulate admin authenticated JWT for is_admin + select/update
await client.query("begin");
await client.query("set local role authenticated");
await client.query(`
  select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config('request.jwt.claim.email', 'd.munkh2007@gmail.com', true);
  select set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","email":"d.munkh2007@gmail.com"}',
    true
  );
`);
const adminFlag = await client.query("select public.is_admin() as is_admin");
console.log("is_admin as munkh", adminFlag.rows[0]);

// seed a lead as postgres then read as admin
await client.query("rollback");

const seed = await client.query(`
  insert into public.enrollments (name, phone, kind, interest, message, status)
  values ('Admin Flow', '99776655', 'course', 'hsk', 'admin-flow-test', 'new')
  returning id
`);
const leadId = seed.rows[0].id;
console.log("seeded lead", leadId);

await client.query("begin");
await client.query("set local role authenticated");
await client.query(`
  select set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","email":"d.munkh2007@gmail.com"}',
    true
  );
  select set_config('request.jwt.claim.email', 'd.munkh2007@gmail.com', true);
`);

const list = await client.query(
  "select id, name, status from public.enrollments where id=$1",
  [leadId],
);
console.log("admin select", list.rows);

const upd = await client.query(
  `update public.enrollments
   set status='contacted', admin_note='checked', updated_at=now()
   where id=$1 returning status, admin_note`,
  [leadId],
);
console.log("admin update", upd.rows[0]);

const siteUpd = await client.query(`
  update public.site_content
  set data = jsonb_set(coalesce(data,'{}'::jsonb), '{notes,home}', '"admin-verify"'::jsonb, true),
      updated_at = now()
  where id = 1
  returning data->'notes'->>'home' as home_note
`);
console.log("admin site_content update", siteUpd.rows[0]);

await client.query("rollback");

// cleanup seed
await client.query("delete from public.enrollments where id=$1", [leadId]);
console.log("cleaned seed");

await client.end();

// JS anon insert after policy fix
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const { data, error } = await sb
  .from("enrollments")
  .insert({
    name: "JS After Fix",
    phone: "99665544",
    kind: "travel",
    interest: "travel_china",
  })
  .select("id,status")
  .maybeSingle();
console.log("js anon insert", { data, error });

if (data?.id) {
  // cleanup via pg
  const c2urls = urls;
  let c2;
  for (const connectionString of c2urls) {
    const c = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await c.connect();
      c2 = c;
      break;
    } catch {
      /* next */
    }
  }
  if (c2) {
    await c2.query("delete from public.enrollments where id=$1", [data.id]);
    await c2.end();
    console.log("cleaned js lead");
  }
}
