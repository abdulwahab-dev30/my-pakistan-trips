-- Admin activity history for My Pakistan Trips.
-- Run this script once in the Supabase SQL Editor.
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) <= 80),
  entity text not null check (char_length(entity) <= 80),
  description text not null check (char_length(description) <= 240),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_activity_logs_created_at_idx on public.admin_activity_logs (created_at desc);
create index if not exists admin_activity_logs_actor_id_idx on public.admin_activity_logs (actor_id);
alter table public.admin_activity_logs enable row level security;
drop policy if exists "CMS admins can read activity logs" on public.admin_activity_logs;
create policy "CMS admins can read activity logs" on public.admin_activity_logs
 for select to authenticated
 using (exists (select 1 from public.tour_cms_admins a where a.user_id = auth.uid()));
drop policy if exists "CMS admins can insert activity logs" on public.admin_activity_logs;
create policy "CMS admins can insert activity logs" on public.admin_activity_logs
 for insert to authenticated
 with check (actor_id = auth.uid() and exists (select 1 from public.tour_cms_admins a where a.user_id = auth.uid()));
comment on table public.admin_activity_logs is 'Audit trail of admin CMS actions; accessible only to authorized CMS admins.';
