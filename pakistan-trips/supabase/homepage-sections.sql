create table if not exists public.homepage_sections (
 section_key text primary key,
 label text not null,
 is_visible boolean not null default true,
 sort_order integer not null default 0,
 updated_at timestamptz not null default now()
);
insert into public.homepage_sections (section_key,label,is_visible,sort_order) values
 ('tours','Tour packages',true,1),('international','International tours',true,2),
 ('why-us','Why travel with us',true,3),('founder','Founder & CEO note',true,4),
 ('gallery','Photo gallery',true,5),('about','About us',true,6),
 ('testimonials','Traveller testimonials',true,7),('faq','Frequently asked questions',true,8),
 ('contact','Contact section',true,9)
on conflict (section_key) do nothing;
alter table public.homepage_sections enable row level security;
drop policy if exists "Public can read homepage section settings" on public.homepage_sections;
create policy "Public can read homepage section settings" on public.homepage_sections for select to anon, authenticated using (true);
drop policy if exists "CMS admins can manage homepage section settings" on public.homepage_sections;
create policy "CMS admins can manage homepage section settings" on public.homepage_sections for all to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = auth.uid())) with check (exists (select 1 from public.tour_cms_admins a where a.user_id = auth.uid()));
