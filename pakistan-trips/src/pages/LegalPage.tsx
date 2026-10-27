import React,{useEffect,useState}from"react";
import {Link,useParams} from "react-router-dom";
import {Helmet} from "react-helmet-async";
import {ShieldCheck,FileText,CalendarDays,ArrowLeft} from "lucide-react";
import {supabase,supabaseConfigured} from "../lib/supabase";
import Navbar from "../components/Navbar";
type LegalPageData={slug:string;title:string;content:string;updated_at?:string};
const fallback:Record<string,LegalPageData>={
"terms-and-conditions":{slug:"terms-and-conditions",title:"Terms & Conditions",content:`Welcome to My Pakistan Trips. By browsing this website, contacting us, or booking a tour, you agree to these terms. Please read them carefully before confirming a booking.

1. Bookings and Confirmation
A booking request is not confirmed until our team confirms availability, itinerary, price, payment schedule, and applicable booking requirements in writing. Please review all booking details before making payment.

2. Prices and Payments
Prices, inclusions, exclusions, and offers are stated on the relevant tour page or communicated by our team. Prices may vary by travel date, group size, room occupancy, transport, and availability. Any advance payment, balance due date, and payment instructions will be confirmed before booking. Use only payment details verified directly through our official contact channels, and retain your receipt.

3. Itinerary and Services
Travel plans may be affected by weather, road closures, government restrictions, transport disruption, hotel availability, or circumstances outside our reasonable control. We will make reasonable efforts to inform travelers of significant changes and offer a suitable alternative where practical.

4. Traveler Responsibilities
Travelers must provide accurate booking details, arrive at the agreed pickup point on time, follow the guide's reasonable safety instructions, respect local communities and natural environments, and carry valid identification and required permits. Travelers are responsible for assessing their own fitness and bringing personal medication and suitable clothing.

5. Children and Special Requirements
Please disclose children's ages, accessibility needs, dietary requirements, and other arrangements before confirming your booking. Child pricing and seating arrangements are tour-specific and will be confirmed by our team.

6. Cancellations, Changes and Refunds
Cancellation, rescheduling, refund, and no-show terms can depend on the tour, booking date, supplier commitments, and proximity to departure. The applicable policy must be provided or confirmed by our team before payment. Do not assume a refund or transfer is available unless confirmed in writing.

7. Third-Party Providers
Some services may be delivered by independent hotels, transport operators, restaurants, guides, or activity providers. Their safety requirements and availability may apply. We will make reasonable efforts to work with reliable providers but cannot control every act or omission of an independent provider.

8. Safety and Exceptional Events
Mountain travel carries inherent risks, including changing weather, altitude, uneven terrain, road disruption, and limited access to emergency services. Follow safety guidance and promptly report hazards. Where exceptional events prevent travel, we will communicate available options in line with confirmed booking terms and applicable law.

9. Website Content and Intellectual Property
We aim to keep tour descriptions, photographs, prices, and schedules accurate, but details may change and images may be illustrative. Website content, branding, and original materials may not be copied or commercially reused without permission, except where allowed by law.

10. Privacy
Personal information submitted through booking enquiries will be handled in accordance with our Privacy Policy. Please contact us to clarify any term before completing a booking.

11. Updates
We may revise these terms as our services or legal requirements change. Booking-specific terms already confirmed in writing will be considered alongside these terms.

Important: This is general initial website policy copy, not legal advice. Please confirm cancellation, refund, liability, licensing and other business-specific terms match your actual practices before relying on this policy.`},
"privacy-policy":{slug:"privacy-policy",title:"Privacy Policy",content:`My Pakistan Trips respects your privacy. This policy explains, in general terms, how information may be handled when you visit our website, contact us, or enquire about a tour.

1. Information We May Collect
Depending on how you interact with the website, we may receive your name, phone number, email address, travel dates, party size, pickup preferences, messages, and other information you choose to provide. Basic technical information such as device/browser details and pages visited may also be processed by hosting, security, or analytics services where enabled.

2. How We Use Information
We may use enquiry and booking details to respond to questions, prepare itineraries or quotations, manage reservations, communicate schedule changes, provide customer support, improve our services, and protect the website against misuse. We will not use information for a materially different purpose without an appropriate basis or notice where required.

3. Sharing with Service Providers
Information may be shared as reasonably needed with relevant travel suppliers, such as hotels, transport operators, guides, payment services, communications tools, website hosting, or database providers, to respond to an enquiry or arrange a booking. Providers may process data under their own terms. We do not sell personal information as a business practice.

4. Payments
Do not send card numbers, passwords, one-time codes, or other sensitive payment credentials through ordinary enquiry forms or chat. Payment handling, where applicable, may be performed by a payment provider and is subject to its own policies.

5. Cookies and Technical Services
The website and its hosting or third-party tools may use essential cookies, logs, or similar technologies for security, performance, and functionality. Analytics or advertising technologies should only be described as active if they are actually configured on the website. You can manage cookies using your browser settings, though some features may not work as expected if essential cookies are blocked.

6. Data Retention and Security
We retain enquiry and booking information for as long as reasonably necessary for service delivery, record keeping, dispute handling, and legal obligations. We use reasonable safeguards, but no website or data transmission method can be guaranteed completely secure.

7. Your Choices and Requests
You may contact us to request access to, correction of, or deletion of personal information you have submitted, subject to identity checks and records we must retain under applicable law. We will review reasonable requests.

8. Children
Please do not knowingly submit personal information about a child unless it is necessary for an enquiry or booking and you are authorized to provide it.

9. External Links
Our website may link to third-party websites or services. Their privacy practices are governed by their own policies, and we encourage you to review them separately.

10. Changes and Contact
We may update this policy when our services or processing practices change. For privacy-related questions or requests, contact My Pakistan Trips through the contact details shown on our website.

Important: This is initial general policy copy based on the travel-enquiry context. Please update it to reflect your exact forms, analytics, messaging, payment tools, retention practices, and legal obligations.`}
};
export default function LegalPage(){const{slug:routeSlug=""}=useParams();const slug=routeSlug || window.location.pathname.split("/").filter(Boolean).pop() || "";const[page,setPage]=useState<LegalPageData|null>(null);const[loading,setLoading]=useState(true);const[unavailable,setUnavailable]=useState(false);
useEffect(()=>{let active=true;const base=fallback[slug];setPage(base||null);setLoading(true);setUnavailable(false);if(!base){setLoading(false);return;}if(!supabaseConfigured){setLoading(false);return;}supabase.from("legal_pages").select("slug,title,content,updated_at").eq("slug",slug).eq("published",true).maybeSingle().then(({data,error})=>{if(!active)return;if(error){if(error.code==="42P01"||error.code==="PGRST205")setUnavailable(true);}else if(data)setPage(data as LegalPageData);setLoading(false);});return()=>{active=false;}},[slug]);
if(!page)return <main className="min-h-screen bg-slate-950 px-5 pb-20 pt-8 text-white"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">Page not found</h1><Link className="mt-5 inline-block text-emerald-300" to="/">Return home</Link></div></main>;
const paragraphs=page.content.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
return <><Navbar/><main className="min-h-screen bg-slate-950 px-4 pb-20 pt-36 text-white sm:px-6 sm:pt-40"><Helmet><title>{page.title} | My Pakistan Trips</title><meta name="description" content={slug==="privacy-policy"?"Learn how My Pakistan Trips handles information shared through travel enquiries and bookings.":"Read booking, payment, travel, cancellation and service terms for My Pakistan Trips."}/><link rel="canonical" href={"https://mypakistantrips.com/"+slug}/><meta property="og:title" content={page.title+" | My Pakistan Trips"}/><meta property="og:description" content={slug==="privacy-policy"?"Our privacy practices for travel enquiries and bookings.":"Terms for tour enquiries, bookings and travel services."}/><meta property="og:url" content={"https://mypakistantrips.com/"+slug}/><meta name="robots" content="index,follow"/></Helmet>
<div className="mx-auto max-w-4xl"><section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-black/20"><div className="border-b border-slate-800 p-6 sm:p-10"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">{slug==="privacy-policy"?<ShieldCheck size={25}/>:<FileText size={25}/>}</div><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">My Pakistan Trips · Legal information</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{page.title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{slug==="privacy-policy"?"How information shared through our website and travel enquiries may be handled.":"Important information about tour enquiries, bookings, payments and travel arrangements."}</p>{page.updated_at&&<p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14}/> Last updated {new Date(page.updated_at).toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}</p>}</div>
<article className="p-6 sm:p-10"><div className="space-y-5">{paragraphs.map((p,i)=>{const match=p.match(/^(\d+\.\s[^\n]+)/);if(match){const [heading,...body]=p.split("\n");return <section key={i} className="border-b border-slate-800/80 pb-5 last:border-0"><h2 className="text-lg font-semibold text-white sm:text-xl">{heading}</h2>{body.length>0&&<p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base">{body.join("\n")}</p>}</section>}return <p key={i} className={i===0?"text-base leading-8 text-slate-200":"whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base"}>{p}</p>})}</div>
{unavailable&&<p className="mt-8 rounded-xl border border-amber-900/70 bg-amber-950/30 p-4 text-sm leading-6 text-amber-200">Supabase legal-pages setup is pending. This page is showing starter copy for now; run <code>supabase/legal-pages-cms.sql</code> in the Supabase SQL Editor to enable database content.</p>}{loading&&<p className="mt-5 text-xs text-slate-500">Checking the latest published policy…</p>}</article></section>
<p className="mt-5 text-center text-xs leading-6 text-slate-500">Questions about these policies? Please contact our team before confirming your tour booking.</p></div></main></>;
}