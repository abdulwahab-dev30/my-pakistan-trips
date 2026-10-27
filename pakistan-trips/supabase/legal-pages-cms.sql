-- My Pakistan Trips legal pages CMS. Run once in Supabase SQL Editor.
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('terms-and-conditions', 'privacy-policy')),
  title text not null,
  content text not null default '',
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.legal_pages enable row level security;
drop policy if exists "Public can read published legal pages" on public.legal_pages;
create policy "Public can read published legal pages" on public.legal_pages for select to anon, authenticated using (published = true);
drop policy if exists "CMS admins can read all legal pages" on public.legal_pages;
create policy "CMS admins can read all legal pages" on public.legal_pages for select to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "CMS admins can insert legal pages" on public.legal_pages;
create policy "CMS admins can insert legal pages" on public.legal_pages for insert to authenticated with check (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
drop policy if exists "CMS admins can update legal pages" on public.legal_pages;
create policy "CMS admins can update legal pages" on public.legal_pages for update to authenticated using (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.tour_cms_admins a where a.user_id = (select auth.uid())));
grant select on public.legal_pages to anon, authenticated;
grant insert, update on public.legal_pages to authenticated;
insert into public.legal_pages (slug,title,content,published) values
('terms-and-conditions','Terms & Conditions',$terms$Welcome to My Pakistan Trips. By using this website or booking a tour, you agree to these terms.

1. Bookings and Confirmation
A booking request is not confirmed until our team confirms availability, itinerary, price, payment schedule and booking requirements in writing.

2. Prices and Payments
Prices and inclusions are shown on tour pages or confirmed by our team. Prices may vary by date, group size, room occupancy, transport and availability. Payment instructions and due dates will be confirmed before booking. Please use only payment details verified through official contact channels and retain receipts.

3. Itinerary and Services
Weather, road closures, government restrictions, transport disruption or supplier availability may affect travel. We will make reasonable efforts to communicate material changes and offer suitable alternatives where practical.

4. Traveler Responsibilities
Travelers should provide accurate details, arrive at pickup points on time, follow reasonable safety instructions, respect local communities and nature, carry required identification and permits, and bring appropriate clothing and personal medication.

5. Children and Special Requirements
Please share children's ages, accessibility needs and dietary requirements before confirming. Child pricing and seating are tour-specific and will be confirmed by our team.

6. Cancellations, Changes and Refunds
Cancellation, rescheduling, refund and no-show terms depend on the selected tour, booking date, supplier commitments and timing. The applicable policy must be confirmed before payment. Do not assume a refund or transfer is available unless confirmed in writing.

7. Third-Party Providers
Hotels, transport operators, restaurants, guides and activity providers may be independent suppliers. Their requirements and availability may apply.

8. Safety and Exceptional Events
Mountain travel has inherent risks, including changing weather, altitude, uneven terrain and road disruption. Follow safety guidance. If exceptional events prevent travel, we will communicate available options under confirmed booking terms and applicable law.

9. Website Content
Tour descriptions, prices, schedules and photographs may change; some images may be illustrative. Website branding and original content may not be commercially reused without permission except where allowed by law.

10. Privacy
Information submitted through enquiries is handled under our Privacy Policy.

11. Updates
We may update these terms. Booking-specific terms confirmed in writing will be considered alongside this policy.

Important: Initial general policy copy, not legal advice. Confirm cancellation, refund, liability, licensing and business-specific details match your real practices before relying on this policy.$terms$,true),
('privacy-policy','Privacy Policy',$privacy$My Pakistan Trips respects your privacy. This policy describes generally how information may be handled when you visit the website, contact us or enquire about a tour.

1. Information We May Collect
We may receive your name, phone number, email, travel dates, party size, pickup preferences, messages and other details you choose to provide. Basic device, browser and page-visit information may be processed by hosting, security or analytics services where enabled.

2. How We Use Information
We may use enquiry and booking details to respond to questions, prepare quotes, manage reservations, communicate changes, provide support, improve services and protect the website.

3. Sharing with Service Providers
Information may be shared as reasonably needed with hotels, transport operators, guides, payment providers, communications tools, hosting or database providers to respond to an enquiry or arrange a booking. We do not sell personal information as a business practice.

4. Payments
Do not send card numbers, passwords or one-time codes through ordinary enquiry forms or chat. Payment providers may handle payment information under their own policies.

5. Cookies and Technical Services
The website and third-party tools may use essential cookies, logs or similar technologies for security and functionality. Describe analytics or advertising as active only if configured. Browser settings can manage cookies, though blocking essential cookies may affect features.

6. Data Retention and Security
We retain enquiry and booking information as reasonably necessary for service delivery, records, disputes and legal obligations. Reasonable safeguards are used, but no transmission method can be guaranteed completely secure.

7. Your Choices and Requests
You may contact us to request access to, correction of or deletion of information you submitted, subject to identity checks and legal recordkeeping requirements.

8. Children
Please do not submit a child's personal information unless necessary for an enquiry or booking and you are authorized to provide it.

9. External Links
External websites follow their own privacy policies.

10. Changes and Contact
We may update this policy when our services or data practices change. Contact My Pakistan Trips using the contact details on our website for privacy requests.

Important: Initial general policy copy. Update it to reflect the exact forms, analytics, messaging, payment tools, retention practices and legal obligations applicable to your business.$privacy$,true)
on conflict(slug) do nothing;
