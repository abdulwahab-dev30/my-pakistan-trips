-- My Pakistan Trips tour CMS
-- Run this in Supabase SQL Editor for the new project.
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  published boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tour_cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_tours_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tours_updated_at on public.tours;
create trigger tours_updated_at before update on public.tours
for each row execute function public.set_tours_updated_at();

alter table public.tours enable row level security;
alter table public.tour_cms_admins enable row level security;

-- Public visitors can only read published tours.
drop policy if exists "Public can read published tours" on public.tours;
create policy "Public can read published tours" on public.tours
for select using (published = true);

-- CMS admins can read and manage every tour.
drop policy if exists "CMS admins can read all tours" on public.tours;
create policy "CMS admins can read all tours" on public.tours
for select to authenticated using (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);
drop policy if exists "CMS admins can insert tours" on public.tours;
create policy "CMS admins can insert tours" on public.tours
for insert to authenticated with check (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);
drop policy if exists "CMS admins can update tours" on public.tours;
create policy "CMS admins can update tours" on public.tours
for update to authenticated using (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);
drop policy if exists "CMS admins can delete tours" on public.tours;
create policy "CMS admins can delete tours" on public.tours
for delete to authenticated using (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);

-- Do not expose admin membership records to normal users.
drop policy if exists "Admins can view own membership" on public.tour_cms_admins;
create policy "Admins can view own membership" on public.tour_cms_admins
for select to authenticated using (user_id = (select auth.uid()));

grant select on public.tours to anon, authenticated;
grant insert, update, delete on public.tours to authenticated;
grant select on public.tour_cms_admins to authenticated;

-- IMPORTANT: after manually creating your admin user in Supabase Auth, add their UUID:
-- insert into public.tour_cms_admins (user_id) values ('YOUR_AUTH_USER_UUID');
