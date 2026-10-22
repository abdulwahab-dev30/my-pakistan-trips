import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit3, Trash2, LogOut, Upload, X, Globe2, Save, Eye, EyeOff, CalendarDays, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { deleteInternationalTour, getAdminInternationalTours, saveInternationalTour, type InternationalTour } from "../lib/internationalTourRepository";

const blank = (): InternationalTour => ({ slug:"", title:"", label:"Foreign visitor package", destination:"Pakistan", duration_days:7, duration_nights:6, price_usd:0, price_note:"", overview:"", seo_title:"", meta_description:"", highlights:[""], itinerary:Array.from({length:7},(_,i)=>({day:i+1,title:"",description:"",location:""})), included:[""], excluded:[""], images:[], whatsapp_link:"https://wa.me/923494886076", published:false, featured:false });
const inputClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400";
function TextField({label,value,onChange,textarea=false,type="text",help}:{label:string;value:string|number;onChange:(v:string)=>void;textarea?:boolean;type?:string;help?:string}) { return <label className="block text-sm font-medium text-slate-300">{label}{textarea?<textarea rows={3} value={value??""} onChange={e=>onChange(e.target.value)} className={inputClass}/>:<input type={type} value={value??""} onChange={e=>onChange(e.target.value)} className={inputClass}/>}{help&&<span className="mt-1 block text-xs font-normal text-slate-500">{help}</span>}</label>; }

export default function AdminInternationalTours() {
  const [session,setSession] = useState<any>(undefined);
  const [tours,setTours] = useState<InternationalTour[]>([]);
  const [editing,setEditing] = useState<InternationalTour|null>(null);
  const [busy,setBusy] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [generating,setGenerating] = useState(false);
  const [tourBrief,setTourBrief] = useState("");
  const [notice,setNotice] = useState("");
  const [error,setError] = useState("");
  const load = useCallback(async()=>{ try { setError(""); setTours(await getAdminInternationalTours()); } catch(e:any) { setError(e?.message||"Could not load Pakistan packages for foreign visitors."); } },[]);
  useEffect(()=>{ if(!supabaseConfigured){setSession(null);return;} supabase.auth.getSession().then(({data})=>{setSession(data.session);if(data.session)load();}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{setSession(s);if(s)load();}); return()=>subscription.unsubscribe(); },[load]);
  if(session===undefined) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Checking admin session…</div>;
  if(!session) return <Navigate to="/admin/login" replace/>;
  const start = (tour?:InternationalTour) => { const item = tour ? JSON.parse(JSON.stringify(tour)) : blank(); item.itinerary = Array.from({length:Math.max(1,Number(item.duration_days)||1)},(_,i)=>item.itinerary?.find((d:any)=>Number(d.day)===i+1)||({day:i+1,title:"",description:"",location:""})); setEditing(item);setNotice("");setError("");window.scrollTo({top:0,behavior:"smooth"}); };
  const change = (key:keyof InternationalTour,value:any) => setEditing(prev=>prev?({...prev,[key]:value}):prev);
  const changeDayCount = (value:number) => { if(!editing)return; const days=Math.max(1,Math.min(90,value||1)); change("duration_days",days); change("duration_nights",Math.min(days-1,Number(editing.duration_nights)||0)); change("itinerary",Array.from({length:days},(_,i)=>editing.itinerary?.find(d=>Number(d.day)===i+1)||({day:i+1,title:"",description:"",location:""}))); };
  const changeList = (key:"highlights"|"included"|"excluded",index:number,value:string) => { if(!editing)return;const list=[...(editing[key]||[])];list[index]=value;change(key,list); };
  const addList = (key:"highlights"|"included"|"excluded") => change(key,[...(editing?.[key]||[]),""]);
  const removeList = (key:"highlights"|"included"|"excluded",index:number) => change(key,(editing?.[key]||[]).filter((_,i)=>i!==index));
  async function generateDetails() {
    if (!tourBrief.trim()) {
      setError("Please describe your tour in English or Roman Urdu.");
      return;
    }
    setGenerating(true);
    setError("");
    setNotice("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("generate-international-tour", {
        body: { brief: tourBrief.trim(), title: editing?.title || "" },
      });
      if (invokeError) {
        let detail = invokeError.message || "AI request failed.";
        try {
          const context = (invokeError as any).context;
          const payload = context && typeof context.json === "function" ? await context.json() : null;
          if (payload?.error) detail = String(payload.error);
        } catch {
          // Keep the original SDK error if the response body is not JSON.
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.tour) throw new Error("AI returned no package details. Please try again.");
      setEditing(previous => {
        if (!previous) return { ...blank(), ...data.tour, images: [], published: false, featured: false };
        return { ...previous, ...data.tour, images: previous.images || [], published: previous.published, featured: previous.featured, whatsapp_link: previous.whatsapp_link };
      });
      setNotice("AI details generated. Review the itinerary and price before publishing.");
    } catch (generationError: any) {
      setError(generationError?.message || "AI generation failed. Check the Supabase function and API key configuration.");
    } finally {
      setGenerating(false);
    }
  }
  async function upload(file?: File) {
    if (!file || !editing) return;
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setError("Cloudinary upload is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel, then redeploy.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      body.append("folder", "my-pakistan-trips/international-tours");
      const response = await fetch("https://api.cloudinary.com/v1_1/" + cloud + "/image/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Image upload failed.");
      const uploadedImage = {
        src: result.secure_url,
        publicId: result.public_id,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      };
      setEditing((previous) => previous ? ({ ...previous, images: [...(previous.images || []), uploadedImage] }) : previous);
      setNotice("Image uploaded. Press Save package to keep it on this package.");
    } catch (uploadError: any) {
      setError(uploadError?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  async function save(e:React.FormEvent){e.preventDefault();if(!editing)return;setBusy(true);setError("");setNotice("");try{const value={...editing,highlights:editing.highlights.filter(x=>x.trim()),included:editing.included.filter(x=>x.trim()),excluded:editing.excluded.filter(x=>x.trim()),itinerary:editing.itinerary.map((day,index)=>({...day,day:index+1})).slice(0,Number(editing.duration_days)),images:editing.images.filter(x=>x.src.trim())};await saveInternationalTour(value,editing.id);setEditing(null);setNotice("Foreign visitor package saved successfully.");await load();}catch(e:any){setError(e?.message||"Could not save package.");}finally{setBusy(false);}}
  async function remove(tour:InternationalTour){if(!tour.id||!window.confirm('Delete "'+tour.title+'" permanently?'))return;setBusy(true);setError("");try{await deleteInternationalTour(tour.id);setNotice("Package deleted.");await load();}catch(e:any){setError(e?.message||"Could not delete package.");}finally{setBusy(false);}}
  async function logout(){await supabase.auth.signOut();window.location.href="/admin/login";}
  return <main className="min-h-screen bg-slate-950 text-white"><Helmet><title>Foreign Visitor Packages CMS | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips · Admin</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Pakistan Packages for Foreign Visitors</h1></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm"><LogOut size={16}/> Logout</button></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><nav className="mb-6 flex flex-wrap gap-2"><a href="/admin/tours" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-400">Domestic tours</a><a href="/admin/international-tours" className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">Foreign visitor packages</a></nav>
      {notice&&<p className="mb-4 rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-200">{notice}</p>}{error&&<p role="alert" className="mb-4 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      {!editing?<><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Package table</h2><p className="mt-1 text-sm text-slate-400">Create and manage Pakistan tour packages for foreign visitors separately from domestic tours.</p></div><button onClick={()=>start()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950"><Plus size={18}/> Add package</button></div>
        <div className="overflow-x-auto rounded-2xl border border-slate-800"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-4">Package</th><th className="px-4 py-4">Duration</th><th className="px-4 py-4">Price (USD)</th><th className="px-4 py-4">Images</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{tours.map(t=><tr key={t.id||t.slug} className="bg-slate-950/60 hover:bg-slate-900/70"><td className="px-4 py-4"><div className="flex items-center gap-3">{t.images?.[0]?.src?<img src={t.images[0].src} alt="" className="h-12 w-16 rounded-lg object-cover"/>:<div className="grid h-12 w-16 place-items-center rounded-lg bg-slate-800"><Globe2 size={18}/></div>}<div><p className="font-semibold">{t.title}</p><p className="mt-1 text-xs text-slate-500">/{t.slug}</p></div></div></td><td className="px-4 py-4">{t.duration_days} days / {t.duration_nights} nights</td><td className="px-4 py-4">US$ {Number(t.price_usd||0).toLocaleString("en-US")}</td><td className="px-4 py-4">{t.images?.length||0}</td><td className="px-4 py-4"><span className={"inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs "+(t.published?"bg-emerald-950 text-emerald-300":"bg-amber-950 text-amber-300")}>{t.published?<Eye size={12}/>:<EyeOff size={12}/>} {t.published?"Published":"Draft"}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button onClick={()=>start(t)} aria-label={"Edit "+t.title} className="rounded-lg border border-slate-700 p-2 hover:border-emerald-400"><Edit3 size={16}/></button><button onClick={()=>remove(t)} disabled={busy} aria-label={"Delete "+t.title} className="rounded-lg border border-slate-700 p-2 text-red-300 hover:border-red-500 disabled:opacity-40"><Trash2 size={16}/></button></div></td></tr>)}{!tours.length&&<tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No Pakistan packages for foreign visitors yet. Select “Add package” to create the first one.</td></tr>}</tbody></table></div>
      </>:<form onSubmit={save} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{editing.id?"Edit package":"New package"}</p><h2 className="mt-1 text-2xl font-bold">{editing.title||"Package details"}</h2></div><button type="button" onClick={()=>setEditing(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm"><ArrowLeft size={16}/> Back to table</button></div>
        <section className="rounded-2xl border border-emerald-900/70 bg-emerald-950/20 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Describe your tour</h3><p className="mt-1 text-sm text-slate-400">English ya Roman Urdu mein tour ki basic details likhein. AI baqi fields fill karega.</p></div><button type="button" onClick={generateDetails} disabled={generating||busy||!tourBrief.trim()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Sparkles size={17}/>{generating?"Generating…":"Generate with AI"}</button></div><textarea rows={5} value={tourBrief} onChange={e=>setTourBrief(e.target.value)} placeholder="Example: 3 day Hunza tour from Islamabad, 2 nights hotel stay, visit Attabad Lake and Passu Cones. Transport and hotel included, meals excluded. Price 25000 PKR per person." className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-400"/><p className="mt-2 text-xs text-slate-500">AI-generated content is a draft. Confirm prices and travel arrangements before publishing.</p></section><section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"><h3 className="font-bold">Basic information</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField label="Package title *" value={editing.title} onChange={v=>change("title",v)}/><TextField label="URL slug" value={editing.slug} onChange={v=>change("slug",v)} help="Use lowercase words separated by hyphens; leave blank to generate from title."/><TextField label="Card label" value={editing.label} onChange={v=>change("label",v)}/><TextField label="Destination / route" value={editing.destination} onChange={v=>change("destination",v)}/><TextField label="Duration (days) *" type="number" value={editing.duration_days} onChange={v=>changeDayCount(Number(v))}/><TextField label="Nights" type="number" value={editing.duration_nights} onChange={v=>change("duration_nights",Math.max(0,Math.min(Number(editing.duration_days)-1,Number(v)||0)))}/><TextField label="Starting price (USD per person)" type="number" value={editing.price_usd} onChange={v=>change("price_usd",v)}/><TextField label="Price note" value={editing.price_note} onChange={v=>change("price_note",v)}/><div className="md:col-span-2"><TextField label="Package overview" value={editing.overview} textarea onChange={v=>change("overview",v)}/></div><TextField label="WhatsApp enquiry URL" value={editing.whatsapp_link} onChange={v=>change("whatsapp_link",v)}/></div><div className="mt-4 flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={e=>change("published",e.target.checked)} className="accent-emerald-400"/> Publish on website</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={e=>change("featured",e.target.checked)} className="accent-emerald-400"/> Feature this package</label></div></section>
        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Package images</h3><p className="mt-1 text-xs text-slate-400">Upload to Cloudinary; images are stored with this package after you save.</p></div><label className={"inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 "+(uploading?"pointer-events-none opacity-60":"")}><Upload size={16}/>{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/*" multiple className="hidden" disabled={uploading||busy} onChange={async e=>{const files=Array.from(e.target.files||[]);for(const f of files)await upload(f);e.target.value="";}}/></label></div>{!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME||!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?<p className="mt-3 rounded-lg border border-amber-900 bg-amber-950/40 p-3 text-xs text-amber-200">Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel to enable uploads.</p>:null}<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{editing.images.map((image,index)=><div key={image.publicId||image.src} className="overflow-hidden rounded-xl border border-slate-800"><img src={image.src} alt={image.alt||""} className="h-36 w-full object-cover"/><div className="flex items-center gap-2 p-2"><input value={image.alt||""} onChange={e=>change("images",editing.images.map((item,i)=>i===index?({...item,alt:e.target.value}):item))} aria-label="Image alt text" placeholder="Image alt text" className="min-w-0 flex-1 rounded-lg bg-slate-900 px-2 py-2 text-xs"/><button type="button" onClick={()=>change("images",editing.images.filter((_,i)=>i!==index))} aria-label="Remove image" className="rounded-lg p-2 text-red-300 hover:bg-red-950"><X size={16}/></button></div></div>)}</div></section>
        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"><div className="flex items-center gap-2"><CalendarDays className="text-emerald-300"/><div><h3 className="font-bold">Day-by-day itinerary</h3><p className="mt-1 text-xs text-slate-400">Change duration above and this form automatically creates or removes day entries.</p></div></div><div className="mt-4 space-y-4">{editing.itinerary.map((day,index)=><article key={day.day} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="font-bold text-emerald-300">Day {index+1}</h4><span className="text-xs text-slate-500">Itinerary day {index+1} of {editing.duration_days}</span></div><div className="grid gap-3 md:grid-cols-2"><TextField label="Day title" value={day.title} onChange={v=>change("itinerary",editing.itinerary.map((d,i)=>i===index?({...d,title:v,day:index+1}):d))}/><TextField label="Location" value={day.location||""} onChange={v=>change("itinerary",editing.itinerary.map((d,i)=>i===index?({...d,location:v,day:index+1}):d))}/><div className="md:col-span-2"><TextField label="Activities and details" value={day.description} textarea onChange={v=>change("itinerary",editing.itinerary.map((d,i)=>i===index?({...d,description:v,day:index+1}):d))}/></div></div></article>)}</div></section>
        {(["highlights","included","excluded"] as const).map((key)=><section key={key} className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">{key==="highlights"?"Package highlights":key==="included"?"What's included":"What's excluded"}</h3><button type="button" onClick={()=>addList(key)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-emerald-400"><Plus size={14} className="mr-1 inline"/> Add item</button></div><div className="mt-3 space-y-2">{(editing[key]||[]).map((item,index)=><div key={index} className="flex gap-2"><input value={item} onChange={e=>changeList(key,index,e.target.value)} className={inputClass+" mt-0"}/><button type="button" onClick={()=>removeList(key,index)} aria-label="Remove item" className="rounded-lg border border-slate-800 px-3 text-red-300"><X size={16}/></button></div>)}</div></section>)}
        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"><h3 className="font-bold">SEO settings</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField label="SEO title" value={editing.seo_title} onChange={v=>change("seo_title",v)}/><TextField label="Meta description" value={editing.meta_description} textarea onChange={v=>change("meta_description",v)}/></div></section>
        <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border border-slate-700 px-5 py-3 font-semibold">Cancel</button><button disabled={busy||uploading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"><Save size={17}/>{busy?"Saving…":"Save package"}</button></div>
      </form>}
    </div>
  </main>;
}
