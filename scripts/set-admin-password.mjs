/**
 * Ensure email is admin + set auth password.
 * Usage: node scripts/set-admin-password.mjs <email> <password>
 */
import fs from "fs";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

const email = (process.argv[2] || "").trim().toLowerCase();
const password = process.argv[3] || "";
if (!email || !email.includes("@") || password.length < 6) {
  console.error("Usage: node scripts/set-admin-password.mjs <email> <password>");
  process.exit(1);
}

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
const pass = env.SUPABASE_DB_PASSWORD;
const urls = [
  `postgresql://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`,
];

async function connect() {
  for (const connectionString of urls) {
    const c = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    try {
      await c.connect();
      console.log("CONNECTED");
      return c;
    } catch (e) {
      console.log("fail", String(e.message).slice(0, 120));
    }
  }
  return null;
}

async function ensureUser(client, mail) {
  await client.query(
    `insert into public.admin_allowlist (email) values ($1)
     on conflict (email) do nothing`,
    [mail],
  );

  const existing = await client.query(
    `select id from auth.users where lower(email) = lower($1) limit 1`,
    [mail],
  );
  const meta = JSON.stringify({ role: "admin", full_name: "Admin" });

  if (existing.rows[0]?.id) {
    const id = existing.rows[0].id;
    await client.query(
      `update auth.users
       set encrypted_password = extensions.crypt($1, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $2::jsonb,
           updated_at = now()
       where id = $3`,
      [password, meta, id],
    );
    console.log("updated", mail, id);
    return id;
  }

  const idRes = await client.query(`select gen_random_uuid() as id`);
  const id = idRes.rows[0].id;

  await client.query(
    `insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      $1, 'authenticated', 'authenticated', $2,
      extensions.crypt($3, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      $4::jsonb,
      now(), now(), '', '', '', ''
    )`,
    [id, mail, password, meta],
  );

  const idCols = await client.query(
    `select column_name from information_schema.columns
     where table_schema='auth' and table_name='identities'`,
  );
  const cols = new Set(idCols.rows.map((r) => r.column_name));

  if (cols.has("provider_id")) {
    await client.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), $1::uuid,
        jsonb_build_object('sub', $2::text, 'email', $3::text, 'email_verified', true),
        'email', $2::text,
        now(), now(), now()
      )
      on conflict do nothing`,
      [id, id, mail],
    );
  } else {
    await client.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true),
        'email', now(), now(), now()
      )
      on conflict do nothing`,
      [id, mail],
    );
  }

  console.log("created", mail, id);
  return id;
}

const client = await connect();
if (!client) {
  console.error("NO_CONN");
  process.exit(1);
}

await ensureUser(client, email);

// Project canonical spelling if user typed monkh
if (email === "d.monkh2007@gmail.com") {
  await ensureUser(client, "d.munkh2007@gmail.com");
}

const admins = await client.query(
  `select email from public.admin_allowlist where lower(email) like '%2007%' order by email`,
);
console.log("allowlist_match", admins.rows.map((r) => r.email));
await client.end();

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const emails = [email];
if (email === "d.monkh2007@gmail.com") emails.push("d.munkh2007@gmail.com");

for (const mail of emails) {
  const { data, error } = await sb.auth.signInWithPassword({
    email: mail,
    password,
  });
  console.log(
    "login",
    mail,
    error ? `FAIL ${error.message}` : `OK ${data.user?.id}`,
  );
  if (data?.session) await sb.auth.signOut();
}
