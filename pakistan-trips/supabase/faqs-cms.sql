-- Public FAQ content for My Pakistan Trips.
-- Run in Supabase SQL Editor after deploying the frontend changes.

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

drop policy if exists "Public can read published FAQs" on public.faqs;
create policy "Public can read published FAQs"
  on public.faqs for select
  to anon, authenticated
  using (published = true);

grant select on public.faqs to anon, authenticated;

-- Seed the six FAQ items already displayed on the homepage.
-- Only seeds an empty table, avoiding duplicates.
insert into public.faqs (question, answer, sort_order, published)
select seed.question, seed.answer, seed.sort_order, true
from (values
  (1, 'Where are the pickup points in Lahore and Islamabad?', 'Lahore Pickup: Zoom Petroleum / Zoom Petrol Pump near KFC, Thokar Niaz Baig, Lahore.
Islamabad Pickup: Daewoo Terminal, EME near NUST University.'),
  (2, 'What is the policy and charges for children?', '• Under 3 Years: Free of Charge (Lap or on folding seat if available)
• 3 to 8 Years: Half Charges (folding seat)
• Above 8 Years: Full Charges'),
  (3, 'Are there any group or traveler discounts available?', '• Group Discount: Group of 10 and above avail 500-1000 per head discount on seats
• Children Discount: 50% Discount for age between 3-8
• Lifetime Card: 10% flat discount on seat
• Traveler Card: 10% flat discount on upcoming trips'),
  (4, 'What is the Meezan Bank account number for payment?', 'Meezan Bank Account Number: 6402 0114 9075 75'),
  (5, 'What services are included in standard tour packages?', 'All standard tour packages include AC private transportation (Coaster Saloon or Grand Cabin), quality hygienic meals (Breakfasts & Dinners), fuel/road toll expenses, hotel stay, and expert guided tour service.'),
  (6, 'Are jeep charges and fort entry tickets included?', 'Boating, fort entry tickets, chairlifts, and 4x4 jeep safari charges are generally self-based, unless you have booked a Deluxe Package where jeep services are included.')
) as seed(sort_order, question, answer)
where not exists (select 1 from public.faqs);

-- Authenticated users can manage FAQ rows in the Supabase dashboard/API.
-- Add tighter admin membership checks if you later build an in-site FAQ editor.
grant insert, update, delete on public.faqs to authenticated;
drop policy if exists "Authenticated users can manage FAQs" on public.faqs;
create policy "Authenticated users can manage FAQs"
  on public.faqs for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
