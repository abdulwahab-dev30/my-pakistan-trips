import React,{useCallback,useEffect,useState}from"react";
import{Navigate,Link}from"react-router-dom";
import{Helmet}from"react-helmet-async";
import{FileText,ShieldCheck,LogOut,Menu,X,Save,RefreshCw,ExternalLink}from"lucide-react";
import{supabase,supabaseConfigured}from"../lib/supabase";
type Legal={id?:string;slug:string;title:string;content:string;published:boolean;updated_at?:string};
const defaults:Legal[]=[
{slug:"terms-and-conditions",title:"Terms & Conditions",published:true,content:`Welcome to My Pakistan Trips. By browsing this website, contacting us, or booking a tour, you agree to these terms. Please read them carefully before confirming a booking.

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
{slug:"privacy-policy",title:"Privacy Policy",published:true,content:`My Pakistan Trips respects your privacy. This policy explains, in general terms, how information may be handled when you visit our website, contact us, or enquire about a tour.

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
];
export default function AdminLegalPages(){const[session,setSession]=useState<any>(undefined),[pages,setPages]=useState<Legal[]>(defaults),[editing,setEditing]=useState<Legal|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[menuOpen,setMenuOpen]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
const load=useCallback(async()=>{if(!supabaseConfigured)return;setLoading(true);setError("");try{const{data,error}=await supabase!.from("legal_pages").select("id,slug,title,content,published,updated_at").order("slug");if(error)throw error;if(data?.length)setPages(data as Legal[]);else setPages(defaults);}catch(e:any){if(e?.code==="42P01"||e?.code==="PGRST205"){setError("Database setup required: run supabase/legal-pages-cms.sql in Supabase SQL Editor. Starter content is shown below.");setPages(defaults);}else setError(e?.message||"Could not load legal pages.");}finally{setLoading(false);}},[]);
useEffect(()=>{if(!supabaseConfigured){setSession(null);return;}supabase!.auth.getSession().then(({data})=>{setSession(data.session);if(data.session)load();});const{data:{subscription}}=supabase!.auth.onAuthStateChange((_e,s)=>{setSession(s);if(s)load();});return()=>subscription.unsubscribe();},[load]);
if(session===undefined)return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Checking admin session…</div>;if(!session)return <Navigate to="/admin/login" replace/>;
async function logout(){await supabase!.auth.signOut();window.location.href="/admin/login";}
async function save(e:React.FormEvent){e.preventDefault();if(!editing)return;setBusy(true);setError("");setNotice("");try{const payload={slug:editing.slug,title:editing.title.trim(),content:editing.content.trim(),published:editing.published,updated_at:new Date().toISOString()};if(!payload.title||!payload.content)throw new Error("Title and policy content are required.");const query=editing.id?supabase!.from("legal_pages").update(payload).eq("id",editing.id):supabase!.from("legal_pages").upsert(payload,{onConflict:"slug"});const{error}=await query;if(error)throw error;setEditing(null);await load();setNotice("Policy saved to Supabase.");}catch(e:any){setError(e?.message||"Could not save policy.");}finally{setBusy(false);}}
const field="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400";
return <main className="min-h-screen bg-slate-950 text-white"><Helmet><title>Legal Pages | Admin | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
<header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5"><div className="flex items-center gap-3"><button onClick={()=>setMenuOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 lg:hidden" aria-label="Open admin menu"><Menu size={20}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Legal Pages</h1></div></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm"><LogOut size={16}/> Logout</button></div></header>
<div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 lg:flex-row lg:gap-8">{menuOpen&&<button aria-label="Close admin menu" onClick={()=>setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden"/>}
<aside className={"w-full shrink-0 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 lg:sticky lg:top-24 lg:h-fit lg:w-64 "+(menuOpen?"fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] overflow-y-auto rounded-none shadow-2xl lg:static lg:w-64 lg:rounded-2xl":"hidden lg:block")}><div className="flex items-center justify-between px-3 pb-3 pt-2"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin workspace</p><button onClick={()=>setMenuOpen(false)} className="p-2 lg:hidden" aria-label="Close menu"><X size={18}/></button></div><nav aria-label="Admin navigation" className="space-y-1"><Link to="/admin/tours" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Tours</Link><Link to="/admin/international-tours" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">International tours</Link><Link to="/admin/gallery" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Gallery</Link><Link to="/admin/founder-profile" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Founder &amp; CEO Note</Link><Link to="/admin/faqs" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">FAQs</Link><Link to="/admin/legal-pages" onClick={()=>setMenuOpen(false)} aria-current="page" className="block rounded-xl bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">Terms & Privacy</Link><Link to="/admin/contact-info" onClick={()=>setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Contact information</Link></nav></aside>
<section className="min-w-0 flex-1"><div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Website content</p><h2 className="mt-2 text-2xl font-bold">Terms & Conditions & Privacy Policy</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Edit the full text here. Published changes are loaded dynamically from Supabase on the public pages.</p></div><button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={15}/> Refresh</button></div>
{error&&<p role="alert" className="mt-5 whitespace-pre-line rounded-xl border border-amber-900 bg-amber-950/40 p-3 text-sm text-amber-200">{error}</p>}{notice&&<p role="status" className="mt-5 rounded-xl border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200">{notice}</p>}
<div className="mt-6 grid gap-4 md:grid-cols-2">{pages.map(p=><article key={p.slug} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">{p.slug==="privacy-policy"?<ShieldCheck size={21}/>:<FileText size={21}/>}</div><h3 className="mt-4 text-xl font-bold">{p.title}</h3><p className="mt-2 text-sm text-slate-400">{p.content.length.toLocaleString()} characters · {p.published?"Published":"Hidden"}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>{setEditing({...p});setError("");setNotice("");}} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950">Edit content</button><Link to={"/"+p.slug} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm"><ExternalLink size={14}/> Preview</Link></div></article>)}</div>
</div></section></div>
{editing&&<div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-6" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setEditing(null)}}><section role="dialog" aria-modal="true" aria-labelledby="legal-editor-title" className="my-auto w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="legal-editor-title" className="text-xl font-bold">{editing.title}</h2><p className="mt-1 text-sm text-slate-400">Edits are saved to Supabase.</p></div><button onClick={()=>setEditing(null)} className="rounded-lg border border-slate-700 px-3 py-2" aria-label="Close editor">✕</button></div><form onSubmit={save} className="space-y-4"><label className="block text-sm text-slate-300">Page title<input required className={field} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><label className="block text-sm text-slate-300">Policy content<textarea required rows={18} className={field+" leading-6"} value={editing.content} onChange={e=>setEditing({...editing,content:e.target.value})}/><span className="mt-1 block text-xs text-slate-500">Separate sections with a blank line. A heading on its own line will be styled as a section heading.</span></label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={editing.published} onChange={e=>setEditing({...editing,published:e.target.checked})} className="h-4 w-4 accent-emerald-400"/> Publish on website</label>{error&&<p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{error}</p>}<div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-4"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border border-slate-700 px-4 py-3">Cancel</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"><Save size={16}/>{busy?"Saving…":"Save changes"}</button></div></form></section></div>}
</main>;
}
