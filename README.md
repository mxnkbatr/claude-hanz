# Hanz Academy

React 19 + Vite + TypeScript + Supabase + Capacitor.

## Scripts

```bash
npm run dev
npm run build
npm run optimize   # public/courses + public/images → WebP (max 1600px, q78)
```

## Supabase setup

Run SQL in order (Supabase SQL Editor or `scripts/apply-admin-sql.mjs`):

1. `supabase/enrollments.sql`
2. `supabase/admin.sql`
3. `supabase/cms.sql` — CMS tables (`news`, `products`, `courses`, `travel_packages`, `universities`), RLS, `media` storage bucket, enrollment length checks

### Admin allowlist

Do **not** hardcode staff emails in SQL permanently. Add admins with:

```sql
insert into public.admin_allowlist (email)
values ('you@example.com')
on conflict (email) do nothing;
```

Also set `VITE_ADMIN_EMAILS` in `.env.local` (comma-separated) for a fast client-side allow path.

To create auth users for staff (password via CLI arg):

```bash
node scripts/seed-staff-admins.mjs "YourPassword"
```

### CMS behavior

- Public site reads CMS tables first; if empty, falls back to `src/data/content.ts`.
- Admin CRUD: `/admin/news`, `/admin/products`, `/admin/courses`, `/admin/travel`, `/admin/universities`.
- Images upload to Storage bucket `media` (admin write, public read). Client resizes to ≤1600px WebP before upload.
