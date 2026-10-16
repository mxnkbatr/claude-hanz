-- Run once in Supabase SQL Editor
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  kind text not null check (kind in ('course', 'travel', 'consult')),
  interest text not null,
  child_age text,
  message text
);

alter table public.enrollments enable row level security;

drop policy if exists "anon_insert_enrollments" on public.enrollments;
create policy "anon_insert_enrollments"
  on public.enrollments
  for insert
  to public
  with check (true);

-- No public SELECT — view rows in Table Editor / service role only
drop policy if exists "anon_select_enrollments" on public.enrollments;
