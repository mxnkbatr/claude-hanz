/**
 * Create/update staff auth users + admin_allowlist from Албан-тушаал.docx.
 * Usage: node scripts/seed-staff-admins.mjs <password>
 */
import fs from "fs";
import { Client } from "pg";

const password = process.argv[2];
if (!password || password.length < 6) {
  console.error("Usage: node scripts/seed-staff-admins.mjs <password>");
  process.exit(1);
}

const staff = [
  {
    name: "Б. Отгонжаргал",
    title: "Захирал",
    email: "baljaaotgonjargal@gmail.com",
    phone: "99991573",
  },
  {
    name: "М. Сарантуяа",
    title: "Менежер",
    email: "munguntuyasarantuya34@gmail.com",
    phone: "95230781",
  },
  {
    name: "Дагула",
    title: "Багш",
    email: "2274555053@qq.com",
    phone: "83090521",
  },
  {
    name: "О. Мичидмаа",
    title: "Дадлагжигч багш",
    email: "michkabga@gmail.com",
    phone: "89947272",
  },
  {
    name: "Ц. Цэцэнбилэг",
    title: "Дадлагжигч багш",
    email: "tbileg427@gmail.com",
    phone: "95733701",
  },
];

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
      console.log("fail", String(e.message).slice(0, 140));
    }
  }
  return null;
}

async function ensureAuthUser(client, { email, name, title, phone }) {
  const existing = await client.query(
    `select id from auth.users where lower(email) = lower($1) limit 1`,
    [email],
  );

  const meta = {
    full_name: name,
    title,
    phone,
    role: "admin",
  };

  if (existing.rows[0]?.id) {
    const id = existing.rows[0].id;
    await client.query(
      `update auth.users
       set encrypted_password = extensions.crypt($1, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $2::jsonb,
           updated_at = now()
       where id = $3`,
      [password, JSON.stringify(meta), id],
    );
    return { id, status: "updated" };
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
    [id, email, password, JSON.stringify(meta)],
  );

  // identities required for email login on newer Supabase
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
      [id, String(id), email],
    );
  } else {
    await client.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), $1::uuid,
        jsonb_build_object('sub', $2::text, 'email', $3::text),
        'email',
        now(), now(), now()
      )
      on conflict do nothing`,
      [id, String(id), email],
    );
  }

  return { id, status: "created" };
}

async function main() {
  const client = await connect();
  if (!client) {
    console.error("NO_CONN");
    process.exit(1);
  }

  try {
    await client.query(
      `create table if not exists public.admin_allowlist (
         email text primary key,
         created_at timestamptz not null default now()
       )`,
    );

    for (const person of staff) {
      const result = await ensureAuthUser(client, person);
      await client.query(
        `insert into public.admin_allowlist (email)
         values ($1)
         on conflict (email) do nothing`,
        [person.email.toLowerCase()],
      );
      console.log(
        `${result.status.toUpperCase()}  ${person.email}  (${person.name})`,
      );
    }

    // keep founder admin
    await client.query(
      `insert into public.admin_allowlist (email)
       values ('d.munkh2007@gmail.com')
       on conflict (email) do nothing`,
    );

    const admins = await client.query(
      `select email from public.admin_allowlist order by email`,
    );
    console.log(
      "allowlist",
      admins.rows.map((r) => r.email).join(", "),
    );

    // update VITE_ADMIN_EMAILS in .env.local (emails only)
    const emails = [
      "d.munkh2007@gmail.com",
      ...staff.map((s) => s.email.toLowerCase()),
    ];
    const unique = [...new Set(emails)];
    const envPath = ".env.local";
    let envText = fs.readFileSync(envPath, "utf8");
    const line = `VITE_ADMIN_EMAILS=${unique.join(",")}`;
    if (/^VITE_ADMIN_EMAILS=/m.test(envText)) {
      envText = envText.replace(/^VITE_ADMIN_EMAILS=.*$/m, line);
    } else {
      envText = envText.trimEnd() + "\n" + line + "\n";
    }
    fs.writeFileSync(envPath, envText);
    console.log("UPDATED .env.local VITE_ADMIN_EMAILS");

    // smoke: can we verify password hash exists
    const check = await client.query(
      `select email, email_confirmed_at is not null as confirmed
       from auth.users
       where lower(email) = any($1::text[])
       order by email`,
      [staff.map((s) => s.email.toLowerCase())],
    );
    for (const row of check.rows) {
      console.log(`AUTH  ${row.email}  confirmed=${row.confirmed}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
