import fs from "fs";
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

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const results = [];

function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  // 1) Public can insert lead (no .select — anon has no SELECT policy)
  const phone = `99${Date.now().toString().slice(-6)}`;
  const { error: insErr } = await sb.from("enrollments").insert({
    name: "Admin Verify",
    phone,
    kind: "consult",
    interest: "consult",
    message: "verify-admin script",
  });
  ok("lead insert (anon, no select)", !insErr, insErr?.message);

  // 2) Anon cannot list leads (RLS)
  const { data: leak, error: leakErr } = await sb
    .from("enrollments")
    .select("id")
    .limit(5);
  ok(
    "leads hidden from anon",
    Array.isArray(leak) ? leak.length === 0 : !!leakErr,
    leakErr?.message || `rows=${leak?.length ?? "?"}`,
  );

  // 3) site_content readable
  const { data: site, error: siteErr } = await sb
    .from("site_content")
    .select("id,data")
    .eq("id", 1)
    .maybeSingle();
  ok("site_content public read", !siteErr && site?.id === 1, siteErr?.message);

  // 4) anon cannot update site_content (RLS may return no error + 0 rows)
  const before = await sb.from("site_content").select("data").eq("id", 1).maybeSingle();
  const { data: updData, error: updErr } = await sb
    .from("site_content")
    .update({ data: { ...(before.data?.data || {}), __hack: true } })
    .eq("id", 1)
    .select("data");
  const hacked = Boolean(updData?.[0]?.data?.__hack);
  ok(
    "site_content blocked for anon",
    !hacked,
    updErr?.message || (hacked ? "writable" : "0 rows / blocked"),
  );

  // 5) admin allowlist not publicly listable (except own email when authed)
  const { data: allow, error: allowErr } = await sb
    .from("admin_allowlist")
    .select("email");
  ok(
    "allowlist not public",
    Array.isArray(allow) ? allow.length === 0 : !!allowErr,
    allowErr?.message || `rows=${allow?.length ?? "?"}`,
  );

  // 6) is_admin RPC as anon => false
  const { data: isAdmin, error: rpcErr } = await sb.rpc("is_admin");
  ok("is_admin anon=false", !rpcErr && isAdmin === false, rpcErr?.message || String(isAdmin));

  // 7) env admin email configured
  const emails = (env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  ok(
    "VITE_ADMIN_EMAILS has d.munkh2007@gmail.com",
    emails.includes("d.munkh2007@gmail.com"),
    emails.join(",") || "empty",
  );

  // cleanup test lead if we can (anon cannot delete — leave it, or use pg)
  const failed = results.filter((r) => !r.pass);
  console.log("\nSummary:", `${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
