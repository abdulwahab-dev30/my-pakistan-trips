import React,{useEffect,useState}from"react";
import{Navigate,useLocation,Link}from"react-router-dom";
import{Images,Contact,Globe,LogOut,Menu,X,Save,LoaderCircle,CheckCircle2,AlertCircle}from"lucide-react";
import{Helmet}from"react-helmet-async";
import{supabase,supabaseConfigured}from"../lib/supabase";

const emptyForm={company_name:"",license_number:"",phone:"",secondary_phone:"",whatsapp:"",email:"",address:"",website:"",lahore_pickup:"",islamabad_pickup:"",office_hours:"",map_embed_url:""};
const fieldClass="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";
const fields=[
 ["company_name","Company / Legal Name"],["license_number","License Number"],["phone","Primary Phone"],["secondary_phone","Secondary Phone"],["whatsapp","WhatsApp Number"],["email","Contact Email"],["website","Website URL"],["address","Office Address"],["lahore_pickup","Lahore Pickup Point"],["islamabad_pickup","Islamabad / Rawalpindi Pickup Point"],["office_hours","Office Hours"],["map_embed_url","Google Maps Embed URL"]
];

export default function AdminPlaceholder(){
 const[session,setSession]=useState(undefined);
 const[menuOpen,setMenuOpen]=useState(false);
 const[form,setForm]=useState(emptyForm);
 const[rowId,setRowId]=useState(null);
 const[loading,setLoading]=useState(true);
 const[saving,setSaving]=useState(false);
 const[notice,setNotice]=useState(null);
 const location=useLocation();
 const isGallery=location.pathname==="/admin/gallery";
 const title=isGallery?"Gallery":"Contact information";
 useEffect(()=>{
  if(!supabaseConfigured||!supabase){setSession(null);return;}
  supabase.auth.getSession().then(({data})=>setSession(data.session));
  const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
  return()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(isGallery||!session||!supabase)return;
  let active=true;
  (async()=>{
   setLoading(true);
   const{data,error}=await supabase.from("contact_info").select("*").order("updated_at",{ascending:false}).limit(1).maybeSingle();
   if(!active)return;
   if(error){setNotice({type:"error",text:"Could not load contact details: "+error.message});setLoading(false);return;}
   if(data){
    setRowId(data.id);
    const points=data.pickup_points||{};
    setForm({
     company_name:data.company_name||"",license_number:data.license_number||"",
     phone:data.phone||data.contact_numbers?.[0]||"",secondary_phone:data.secondary_phone||data.contact_numbers?.[1]||"",
     whatsapp:data.whatsapp||data.phone||"",email:data.email||"",address:data.address||"",website:data.website||"",
     lahore_pickup:points.lahore||"",islamabad_pickup:points.islamabad_rawalpindi||"",
     office_hours:data.office_hours||"",map_embed_url:data.map_embed_url||""
    });
   }
   setLoading(false);
  })();
  return()=>{active=false;};
 },[isGallery,session]);
 async function logout(){await supabase.auth.signOut();window.location.href="/admin/login";}
 async function save(e){
  e.preventDefault();setSaving(true);setNotice(null);
  const payload={
   company_name:form.company_name.trim(),license_number:form.license_number.trim(),
   phone:form.phone.trim(),secondary_phone:form.secondary_phone.trim(),
   contact_numbers:[form.phone.trim(),form.secondary_phone.trim()].filter(Boolean),
   whatsapp:form.whatsapp.trim(),email:form.email.trim(),address:form.address.trim(),website:form.website.trim(),
   pickup_points:{lahore:form.lahore_pickup.trim(),islamabad_rawalpindi:form.islamabad_pickup.trim()},
   office_hours:form.office_hours.trim(),map_embed_url:form.map_embed_url.trim(),updated_at:new Date().toISOString()
  };
  const result=rowId
   ? await supabase.from("contact_info").update(payload).eq("id",rowId).select("id").single()
   : await supabase.from("contact_info").insert(payload).select("id").single();
  setSaving(false);
  if(result.error){setNotice({type:"error",text:"Save failed: "+result.error.message});return;}
  if(result.data?.id)setRowId(result.data.id);
  setNotice({type:"success",text:"Contact information saved. Public pages will update automatically."});
 }
 if(session===undefined)return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Checking admin session…</div>;
 if(!session)return <Navigate to="/admin/login" replace/>;
 return <main className="min-h-screen bg-slate-950 text-white">
  <Helmet><title>{title} | Admin | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
  <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={()=>setMenuOpen(true)} aria-label="Open admin menu" aria-expanded={menuOpen} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-200 hover:border-emerald-400 lg:hidden"><Menu size={20}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Admin Panel</h1></div></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-slate-500"><LogOut size={16}/> Logout</button></div></header>
  <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 lg:flex-row lg:gap-8">
   {menuOpen&&<button type="button" aria-label="Close admin menu" onClick={()=>setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden"/>}
   <aside className={"w-full shrink-0 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:bg-slate-900/70 "+(menuOpen?"fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] overflow-y-auto rounded-none shadow-2xl lg:static lg:w-64 lg:rounded-2xl lg:shadow-none":"hidden lg:block")}><div className="flex items-center justify-between px-3 pb-3 pt-2"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin workspace</p><button type="button" onClick={()=>setMenuOpen(false)} aria-label="Close admin menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"><X size={18}/></button></div><nav aria-label="Admin navigation" className="space-y-1">
    <Link to="/admin/tours" onClick={()=>setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"><Globe size={17}/> Tours</Link>
    <Link to="/admin/gallery" onClick={()=>setMenuOpen(false)} aria-current={isGallery?"page":undefined} className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition "+(isGallery?"bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20":"text-slate-300 hover:bg-slate-800 hover:text-white")}><Images size={17}/> Gallery {isGallery&&<span className="ml-auto text-xs">Active</span>}</Link>
    <Link to="/admin/contact-info" onClick={()=>setMenuOpen(false)} aria-current={!isGallery?"page":undefined} className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition "+(!isGallery?"bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20":"text-slate-300 hover:bg-slate-800 hover:text-white")}><Contact size={17}/> Contact information {!isGallery&&<span className="ml-auto text-xs">Active</span>}</Link>
   </nav><div className="mt-4 border-t border-slate-800 px-3 pt-4 text-xs leading-5 text-slate-500">More admin features can be added here later.</div></aside>
   <section className="min-w-0 flex-1">
    {isGallery?<div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Images size={23}/></div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-300">Admin section</p><h2 className="mt-2 text-3xl font-bold">Gallery</h2><p className="mt-3 max-w-xl leading-7 text-slate-400">Gallery management remains a placeholder for future setup.</p></div>:
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8">
     <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Contact size={23}/></div><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Website settings</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">Contact Information</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Edit official contact details here. Phone, WhatsApp, email and office address shown across the website use this database record. Tour destinations and tour addresses are not changed here.</p></div></div>
     {notice&&<div role="status" className={"mt-6 flex items-start gap-2 rounded-xl border p-3 text-sm "+(notice.type==="success"?"border-emerald-500/30 bg-emerald-500/10 text-emerald-200":"border-rose-500/30 bg-rose-500/10 text-rose-200")}>{notice.type==="success"?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}<span>{notice.text}</span></div>}
     {loading?<div className="py-12 text-center text-slate-400"><LoaderCircle className="mx-auto mb-3 animate-spin" size={24}/>Loading contact details…</div>:
      <form onSubmit={save} className="mt-7 space-y-6">
       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map(([key,label])=><label key={key} className={"block text-sm font-medium text-slate-300 "+(["address","lahore_pickup","islamabad_pickup","map_embed_url"].includes(key)?"sm:col-span-2":"")}>{label}
         {["address","lahore_pickup","islamabad_pickup"].includes(key)?<textarea rows={key==="address"?3:2} className={fieldClass} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label}/>:
         <input className={fieldClass} type={key==="email"?"email":"text"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label}/>}
        </label>)}
       </div>
       <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-xs leading-5 text-slate-500">Changes are saved to Supabase and sync to the public site. Leave optional fields blank if you do not use them.</p><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">{saving?<LoaderCircle className="animate-spin" size={17}/>:<Save size={17}/>} {saving?"Saving…":"Save Contact Information"}</button></div>
      </form>}
    </div>}
   </section>
  </div>
 </main>;
}
