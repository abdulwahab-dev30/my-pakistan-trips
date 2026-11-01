create table if not exists public.site_redirects (
 id uuid primary key default gen_random_uuid(),
 source_path text not null unique,
 destination_path text not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint site_redirects_source_path_check check (left(source_path,1)='/' and left(source_path,2)<>'//' and source_path !~ '[?#]'),
 constraint site_redirects_destination_path_check check (left(destination_path,1)='/' and left(destination_path,2)<>'//' and destination_path !~ '[?#]' and destination_path<>source_path)
);
create index if not exists site_redirects_active_source_idx on public.site_redirects (source_path) where is_active=true;
alter table public.site_redirects enable row level security;
drop policy if exists "Public can read active site redirects" on public.site_redirects;
create policy "Public can read active site redirects" on public.site_redirects for select to anon,authenticated using (is_active=true or exists(select 1 from public.tour_cms_admins a where a.user_id=auth.uid()));
drop policy if exists "CMS admins can manage site redirects" on public.site_redirects;
create policy "CMS admins can manage site redirects" on public.site_redirects for all to authenticated using (exists(select 1 from public.tour_cms_admins a where a.user_id=auth.uid())) with check (exists(select 1 from public.tour_cms_admins a where a.user_id=auth.uid()));
