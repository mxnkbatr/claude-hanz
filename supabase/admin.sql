-- Admin + leads management. Run in Supabase SQL Editor after enrollments.sql

-- Lead workflow fields
alter table public.enrollments
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'done', 'spam'));
alter table public.enrollments
  add column if not exists admin_note text;
alter table public.enrollments
  add column if not exists updated_at timestamptz not null default now();

-- Who can open the admin panel (insert your login email)
create table if not exists public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

drop policy if exists "admins_read_allowlist" on public.admin_allowlist;
create policy "admins_read_allowlist"
  on public.admin_allowlist
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Public form inserts (Enroll/Consult). Avoid INSERT...RETURNING for anon —
-- there is no SELECT policy for the public.
drop policy if exists "anon_insert_enrollments" on public.enrollments;
create policy "anon_insert_enrollments"
  on public.enrollments
  for insert
  to public
  with check (true);

-- Admins can read / update / delete leads
drop policy if exists "admin_select_enrollments" on public.enrollments;
create policy "admin_select_enrollments"
  on public.enrollments for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_update_enrollments" on public.enrollments;
create policy "admin_update_enrollments"
  on public.enrollments for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_delete_enrollments" on public.enrollments;
create policy "admin_delete_enrollments"
  on public.enrollments for delete to authenticated
  using (public.is_admin());

-- Site-wide CMS bundle (settings + per-page overrides)
create table if not exists public.site_content (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.site_content enable row level security;

insert into public.site_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

drop policy if exists "public_read_site_content" on public.site_content;
create policy "public_read_site_content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_update_site_content" on public.site_content;
create policy "admin_update_site_content"
  on public.site_content for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_insert_site_content" on public.site_content;
create policy "admin_insert_site_content"
  on public.site_content for insert to authenticated
  with check (public.is_admin());

-- Seed admins (idempotent) — staff from Албан-тушаал
insert into public.admin_allowlist (email)
values
  ('d.munkh2007@gmail.com'),
  ('baljaaotgonjargal@gmail.com'),
  ('munguntuyasarantuya34@gmail.com'),
  ('2274555053@qq.com'),
  ('michkabga@gmail.com'),
  ('tbileg427@gmail.com')
on conflict (email) do nothing;
