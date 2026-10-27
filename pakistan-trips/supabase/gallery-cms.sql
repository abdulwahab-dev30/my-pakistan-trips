-- My Pakistan Trips gallery CMS
-- Run this in Supabase SQL Editor once.
create table if not exists public.gallery_settings (
  id integer primary key check (id = 1),
  image_order text[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.gallery_settings (id, image_order)
values (1, '{}')
on conflict (id) do nothing;

alter table public.gallery_settings enable row level security;

drop policy if exists "Public can read gallery order" on public.gallery_settings;
create policy "Public can read gallery order" on public.gallery_settings
for select to anon, authenticated using (true);

drop policy if exists "CMS admins can update gallery order" on public.gallery_settings;
create policy "CMS admins can update gallery order" on public.gallery_settings
for update to authenticated using (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);

drop policy if exists "CMS admins can insert gallery order" on public.gallery_settings;
create policy "CMS admins can insert gallery order" on public.gallery_settings
for insert to authenticated with check (
  exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))
);

grant select on public.gallery_settings to anon, authenticated;
grant insert, update on public.gallery_settings to authenticated;
