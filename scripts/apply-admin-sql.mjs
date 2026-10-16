import fs from "fs";
import { Client } from "pg";

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

async function main() {
  let client;
  for (const connectionString of urls) {
    const c = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    try {
      await c.connect();
      client = c;
      console.log("CONNECTED");
      break;
    } catch (e) {
      console.log("fail", String(e.message).slice(0, 140));
    }
  }
  if (!client) {
    console.error("NO_CONN");
    process.exit(1);
  }

  for (const file of ["supabase/enrollments.sql", "supabase/admin.sql"]) {
    try {
      await client.query(fs.readFileSync(file, "utf8"));
      console.log(file, "OK");
    } catch (e) {
      console.log(file, "ERR", e.message);
    }
  }

  const checks = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public'
       and table_name in ('enrollments','admin_allowlist','site_content')
     order by 1`,
  );
  console.log(
    "tables",
    checks.rows.map((r) => r.table_name).join(","),
  );

  const cols = await client.query(
    `select column_name from information_schema.columns
     where table_schema='public' and table_name='enrollments'
     order by 1`,
  );
  console.log(
    "enrollments_cols",
    cols.rows.map((r) => r.column_name).join(","),
  );

  const admins = await client.query("select email from admin_allowlist");
  console.log("admins", JSON.stringify(admins.rows));

  const site = await client.query("select id, data from site_content");
  console.log("site_content_rows", site.rowCount);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
