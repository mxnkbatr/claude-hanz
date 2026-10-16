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
const pass = encodeURIComponent(env.SUPABASE_DB_PASSWORD);
const urls = [
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
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
      break;
    } catch {
      /* try next */
    }
  }
  if (!client) throw new Error("NO_CONN");

  const pols = await client.query(`
    select schemaname, tablename, policyname, cmd, roles, qual, with_check
    from pg_policies
    where tablename in ('enrollments','site_content','admin_allowlist')
    order by tablename, policyname
  `);
  console.log(JSON.stringify(pols.rows, null, 2));

  // Ensure anon insert works for enrollments
  await client.query(`
    drop policy if exists "anon_insert_enrollments" on public.enrollments;
    create policy "anon_insert_enrollments"
      on public.enrollments
      for insert
      to anon, authenticated
      with check (true);
  `);

  // Tighten site_content: revoke update from anon explicitly via policy only for admin
  await client.query(`
    drop policy if exists "admin_update_site_content" on public.site_content;
    create policy "admin_update_site_content"
      on public.site_content for update to authenticated
      using (public.is_admin())
      with check (public.is_admin());

    drop policy if exists "admin_insert_site_content" on public.site_content;
    create policy "admin_insert_site_content"
      on public.site_content for insert to authenticated
      with check (public.is_admin());
  `);

  // Grant table privileges (RLS still applies)
  await client.query(`
    grant usage on schema public to anon, authenticated;
    grant insert on public.enrollments to anon, authenticated;
    grant select, update, delete on public.enrollments to authenticated;
    grant select on public.site_content to anon, authenticated;
    grant insert, update on public.site_content to authenticated;
    grant select on public.admin_allowlist to authenticated;
  `);

  console.log("FIXED policies + grants");

  const pols2 = await client.query(`
    select tablename, policyname, cmd
    from pg_policies
    where tablename in ('enrollments','site_content','admin_allowlist')
    order by 1,2
  `);
  console.log("policies_now", pols2.rows);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
