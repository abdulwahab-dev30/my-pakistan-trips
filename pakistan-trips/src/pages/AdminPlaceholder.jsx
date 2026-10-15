import React,{useEffect,useState}from"react";
import{Navigate,useLocation,Link}from"react-router-dom";
import{Images,Contact,Globe,LogOut,Construction}from"lucide-react";
import{Helmet}from"react-helmet-async";
import{supabase,supabaseConfigured}from"../lib/supabase";

export default function AdminPlaceholder(){
 const[session,setSession]=useState(undefined);
 const location=useLocation();
 const isGallery=location.pathname==="/admin/gallery";
 const title=isGallery?"Gallery":"Contact information";
 useEffect(()=>{
  if(!supabaseConfigured){setSession(null);return;}
  supabase.auth.getSession().then(({data})=>setSession(data.session));
  const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
  return()=>subscription.unsubscribe();
 },[]);
 async function logout(){await supabase.auth.signOut();window.location.href="/admin/login";}
 if(session===undefined)return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Checking admin session…</div>;
 if(!session)return <Navigate to="/admin/login" replace/>;
 return <main className="min-h-screen bg-slate-950 text-white">
  <Helmet><title>{title} | Admin | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
  <header className="border-b border-slate-800 bg-slate-900/80"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-2xl font-bold">Admin Panel</h1></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-slate-500"><LogOut size={16}/> Logout</button></div></header>
  <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 lg:flex-row lg:gap-8">
   <aside className="w-full shrink-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 lg:sticky lg:top-6 lg:h-fit lg:w-64"><p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-widest text-slate-500">Admin workspace</p><nav aria-label="Admin navigation" className="space-y-1">
    <Link to="/admin/tours" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"><Globe size={17}/> Tours</Link>
    <Link to="/admin/gallery" aria-current={isGallery?"page":undefined} className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition "+(isGallery?"bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20":"text-slate-300 hover:bg-slate-800 hover:text-white")}><Images size={17}/> Gallery {isGallery&&<span className="ml-auto text-xs">Active</span>}</Link>
    <Link to="/admin/contact-info" aria-current={!isGallery?"page":undefined} className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition "+(!isGallery?"bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20":"text-slate-300 hover:bg-slate-800 hover:text-white")}><Contact size={17}/> Contact information {!isGallery&&<span className="ml-auto text-xs">Active</span>}</Link>
   </nav><div className="mt-4 border-t border-slate-800 px-3 pt-4 text-xs leading-5 text-slate-500">More admin features can be added here later.</div></aside>
   <section className="min-w-0 flex-1"><div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">{isGallery?<Images size={23}/>:<Contact size={23}/>}</div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-300">Admin section</p><h2 className="mt-2 text-3xl font-bold">{title}</h2><p className="mt-3 max-w-xl leading-7 text-slate-400">This section is ready for future setup. No gallery or contact information functionality has been added yet.</p><div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><Construction size={20} className="shrink-0 text-amber-300"/><div><p className="font-semibold">Coming soon</p><p className="mt-1 text-sm text-slate-500">The tab and navigation are in place. Features can be added here later.</p></div></div></div></section>
  </div>
 </main>;
}
