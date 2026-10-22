-- Hanz CMS tables. Run after admin.sql (needs public.is_admin()).
-- Localized text fields: jsonb { "mn": "...", "en": "...", "zh": "..." }

-- ─── Shared helper ───────────────────────────────────────────
create or replace function public.cms_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── News ────────────────────────────────────────────────────
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  tag jsonb not null default '{}'::jsonb,
  filter_key text not null default 'tag_academy',
  image_url text,
  published_at date default current_date,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Products ────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  tag jsonb not null default '{}'::jsonb,
  filter_key text not null default 'porcelain',
  image_url text,
  price numeric(12, 2) not null default 0,
  in_stock boolean not null default true,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing DBs created before filter_key / meta existed
alter table public.products
  add column if not exists filter_key text not null default 'porcelain';
alter table public.products
  add column if not exists meta jsonb not null default '{}'::jsonb;

-- ─── Courses ─────────────────────────────────────────────────
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  tag jsonb not null default '{}'::jsonb,
  filter_key text not null default 'classroom',
  image_url text,
  meta jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Travel packages ─────────────────────────────────────────
create table if not exists public.travel_packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  tag jsonb not null default '{}'::jsonb,
  image_url text,
  price numeric(12, 2),
  duration jsonb not null default '{}'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Universities ────────────────────────────────────────────
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  city jsonb not null default '{}'::jsonb,
  image_url text,
  meta jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare
  t text;
begin
  foreach t in array array['news','products','courses','travel_packages','universities']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format(
      'create trigger %I_touch before update on public.%I
       for each row execute function public.cms_touch_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ─── RLS ─────────────────────────────────────────────────────
alter table public.news enable row level security;
alter table public.products enable row level security;
alter table public.courses enable row level security;
alter table public.travel_packages enable row level security;
alter table public.universities enable row level security;

-- Public read (visible only)
do $$
declare
  t text;
begin
  foreach t in array array['news','products','courses','travel_packages','universities']
  loop
    execute format('drop policy if exists %I_public_select on public.%I', t, t);
    execute format(
      'create policy %I_public_select on public.%I
       for select to anon, authenticated
       using (hidden = false)',
      t, t
    );

    execute format('drop policy if exists %I_admin_select_all on public.%I', t, t);
    execute format(
      'create policy %I_admin_select_all on public.%I
       for select to authenticated
       using (public.is_admin())',
      t, t
    );

    execute format('drop policy if exists %I_admin_insert on public.%I', t, t);
    execute format(
      'create policy %I_admin_insert on public.%I
       for insert to authenticated
       with check (public.is_admin())',
      t, t
    );

    execute format('drop policy if exists %I_admin_update on public.%I', t, t);
    execute format(
      'create policy %I_admin_update on public.%I
       for update to authenticated
       using (public.is_admin())
       with check (public.is_admin())',
      t, t
    );

    execute format('drop policy if exists %I_admin_delete on public.%I', t, t);
    execute format(
      'create policy %I_admin_delete on public.%I
       for delete to authenticated
       using (public.is_admin())',
      t, t
    );
  end loop;
end $$;

-- ─── Storage: media bucket ───────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ─── Enrollments length guards (rate-limit helper) ───────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'enrollments_name_len'
  ) then
    alter table public.enrollments
      add constraint enrollments_name_len check (char_length(name) <= 80);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'enrollments_phone_len'
  ) then
    alter table public.enrollments
      add constraint enrollments_phone_len check (char_length(phone) <= 20);
  end if;
end $$;

-- NOTE: Do not hardcode staff emails here.
-- Add admins via: insert into public.admin_allowlist (email) values ('you@example.com');
-- See README.md → "Admin allowlist".
