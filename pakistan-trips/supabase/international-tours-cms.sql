-- International Tours CMS. Uses the existing travel_agency Supabase project and
-- existing public.tour_cms_admins admin membership table. Does not alter public.tours.
create table if not exists public.international_tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  destination text not null default 'Pakistan',
  duration_days integer not null default 1,
  duration_nights integer not null default 0,
  price_usd numeric not null default 0,
  price_note text not null default '',
  overview text not null default '',
  main_image text not null default '',
  images jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  included jsonb not null default '[]'::jsonb,
  excluded jsonb not null default '[]'::jsonb,
  whatsapp_link text not null default '',
  seo_title text not null default '',
  meta_description text not null default '',
  published boolean not null default false,
  label text not null default 'International package',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint international_tours_duration_days_check check (duration_days >= 1 and duration_days <= 90),
  constraint international_tours_duration_nights_check check (duration_nights >= 0 and duration_nights <= 89),
  constraint international_tours_price_usd_check check (price_usd >= 0)
);

alter table public.international_tours add column if not exists label text not null default 'International package';
alter table public.international_tours add column if not exists featured boolean not null default false;
alter table public.international_tours drop constraint if exists international_tours_duration_days_check;
alter table public.international_tours drop constraint if exists international_tours_duration_nights_check;
alter table public.international_tours add constraint international_tours_duration_days_check check (duration_days >= 1 and duration_days <= 90);
alter table public.international_tours add constraint international_tours_duration_nights_check check (duration_nights >= 0 and duration_nights <= 89);
alter table public.international_tours enable row level security;

create or replace function public.set_international_tours_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists international_tours_updated_at on public.international_tours;
create trigger international_tours_updated_at before update on public.international_tours
for each row execute function public.set_international_tours_updated_at();

drop policy if exists "Public can read published international tours" on public.international_tours;
create policy "Public can read published international tours" on public.international_tours
for select to anon, authenticated using (published = true);
drop policy if exists "CMS admins can read all international tours" on public.international_tours;
create policy "CMS admins can read all international tours" on public.international_tours
for select to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "CMS admins can insert international tours" on public.international_tours;
create policy "CMS admins can insert international tours" on public.international_tours
for insert to authenticated with check (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "CMS admins can update international tours" on public.international_tours;
create policy "CMS admins can update international tours" on public.international_tours
for update to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "CMS admins can delete international tours" on public.international_tours;
create policy "CMS admins can delete international tours" on public.international_tours
for delete to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));

grant select on public.international_tours to anon, authenticated;
grant insert, update, delete on public.international_tours to authenticated;
