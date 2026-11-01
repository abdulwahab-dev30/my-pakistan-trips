-- Monthly website-side WhatsApp outgoing message cap.
-- The RPC atomically reserves a slot and cannot be called by anonymous users.
create table if not exists public.whatsapp_message_usage (
  month_start date primary key,
  sent_count integer not null default 0 check (sent_count >= 0 and sent_count <= 1000),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_message_usage enable row level security;
revoke all on table public.whatsapp_message_usage from anon, authenticated;
grant select on table public.whatsapp_message_usage to authenticated;

drop policy if exists "CMS admins can view WhatsApp monthly usage" on public.whatsapp_message_usage;
create policy "CMS admins can view WhatsApp monthly usage"
on public.whatsapp_message_usage
for select
to authenticated
using (
  exists (
    select 1 from public.tour_cms_admins a
    where a.user_id = (select auth.uid())
  )
);

create or replace function public.reserve_whatsapp_message()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date := date_trunc('month', timezone('UTC', now()))::date;
  v_count integer;
begin
  if auth.uid() is null or not exists (
    select 1 from public.tour_cms_admins a where a.user_id = auth.uid()
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  insert into public.whatsapp_message_usage (month_start, sent_count, updated_at)
  values (v_month, 1, now())
  on conflict (month_start) do update
    set sent_count = public.whatsapp_message_usage.sent_count + 1,
        updated_at = now()
    where public.whatsapp_message_usage.sent_count < 1000
  returning sent_count into v_count;

  if v_count is null then
    return jsonb_build_object('allowed', false, 'sent_count', 1000, 'monthly_limit', 1000, 'remaining', 0, 'month_start', v_month);
  end if;

  return jsonb_build_object('allowed', true, 'sent_count', v_count, 'monthly_limit', 1000, 'remaining', greatest(1000 - v_count, 0), 'month_start', v_month);
end;
$$;

revoke all on function public.reserve_whatsapp_message() from public, anon;
grant execute on function public.reserve_whatsapp_message() to authenticated;
