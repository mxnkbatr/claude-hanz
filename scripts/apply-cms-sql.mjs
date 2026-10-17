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
      console.log("fail", String(e.message).slice(0, 120));
    }
  }
  if (!client) {
    console.error("NO_CONN");
    process.exit(1);
  }
  try {
    await client.query(fs.readFileSync("supabase/cms.sql", "utf8"));
    console.log("cms.sql OK");
    const tables = await client.query(
      `select table_name from information_schema.tables
       where table_schema='public'
         and table_name in ('news','products','courses','travel_packages','universities')
       order by 1`,
    );
    console.log(
      "tables",
      tables.rows.map((r) => r.table_name).join(","),
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
