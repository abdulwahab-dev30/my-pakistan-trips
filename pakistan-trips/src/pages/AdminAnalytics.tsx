import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Activity, BarChart3, Eye, RefreshCw, Smartphone, Users, MousePointerClick, Globe, Monitor, Tablet } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

type Report = {
  connected: boolean; propertyId?: string; measurementId?: string; days: number;
  summary: { activeUsers: number; newUsers: number; sessions: number; pageViews: number; keyEvents: number };
  previous: { activeUsers: number; newUsers: number; sessions: number; pageViews: number; keyEvents: number };
  devices: { device: string; activeUsers: number; sessions: number }[];
  channels: { channel: string; sessions: number; activeUsers: number }[];
  events: { event: string; count: number; keyEvents: number }[];
  pages: { path: string; pageViews: number; activeUsers: number }[];
};

function number(value: number) { return Number(value || 0).toLocaleString("en-PK"); }
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"><h3 className="font-bold text-white">{title}</h3>{children}</section>;
}
function Metric({ label, value, icon: Icon, change }: { label: string; value: number; icon: React.ElementType; change?: number }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><Icon size={15}/>{label}</div><p className="mt-3 text-2xl font-bold text-white">{number(value)}</p>{change !== undefined && <p className={"mt-1 text-xs "+(change>=0?"text-emerald-300":"text-rose-300")}>{change>0?"+":""}{change.toFixed(1)}% vs previous period</p>}</article>;
}

export default function AdminAnalytics() {
  const [session,setSession]=useState<any>(undefined);
  const [authorized,setAuthorized]=useState(false);
  const [checking,setChecking]=useState(true);
  const [menuOpen,setMenuOpen]=useState(false);
  const [days,setDays]=useState(28);
  const [data,setData]=useState<Report|null>(null);
  const [loading,setLoading]=useState(false);
  const [connecting,setConnecting]=useState(false);
  const [error,setError]=useState("");

  const load=useCallback(async(nextDays:number, token:string)=>{
    if(!token)return;
    setLoading(true);setError("");
    try{
      const response=await fetch("/api/analytics/data?days="+nextDays,{headers:{Authorization:"Bearer "+token},credentials:"same-origin",cache:"no-store"});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"GA4 report could not be loaded.");
      setData(result as Report);
    }catch(err:any){setError(err?.message||"GA4 report could not be loaded.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    let active=true;
    if(!supabaseConfigured||!supabase){setSession(null);setChecking(false);return;}
    const verify=async(s:any)=>{
      if(!s?.user?.id){if(active){setSession(null);setAuthorized(false);setChecking(false);}return;}
      if(active){setSession(s);setChecking(true);}
      try{
        const {data:userData,error:userError}=await supabase.auth.getUser();
        if(userError||!userData?.user)throw new Error("Admin session invalid.");
        const allowed=await isCmsAdmin(userData.user.id);
        if(!allowed){await supabase.auth.signOut();throw new Error("Unauthorized admin account.");}
        if(active){setAuthorized(true);await load(days,s.access_token);}
      }catch{if(active){setAuthorized(false);setSession(null);}}
      finally{if(active)setChecking(false);}
    };
    supabase.auth.getSession().then(({data})=>verify(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>Promise.resolve().then(()=>verify(next)));
    return()=>{active=false;subscription.unsubscribe();};
  },[load,days]);

  async function connectGoogle(){
    if(!session?.access_token)return;
    setConnecting(true);setError("");
    try{
      const response=await fetch("/api/search-console/auth",{method:"POST",headers:{Authorization:"Bearer "+session.access_token},credentials:"same-origin"});
      const result=await response.json();
      if(!response.ok||!result.authorizationUrl)throw new Error(result.error||"Could not start Google authorization.");
      window.location.assign(result.authorizationUrl);
    }catch(err:any){setError(err?.message||"Google connection failed.");setConnecting(false);}
  }

  if(checking||session===undefined)return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Verifying admin access…</div>;
  if(!session||!authorized)return <Navigate to="/admin/login" replace/>;

  const pct=(now:number,before:number)=>before>0?((now-before)/before)*100:(now>0?100:0);
  const summary=data?.summary;
  const deviceIcon=(device:string)=>device.toLowerCase().includes("mobile")?Smartphone:device.toLowerCase().includes("tablet")?Tablet:Monitor;

  return <main className="min-h-screen w-full overflow-x-clip bg-slate-950 text-white">
    <Helmet><title>Website Analytics | My Pakistan Trips Admin</title><meta name="robots" content="noindex,nofollow"/></Helmet>
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
      <div className="flex items-center gap-3"><button type="button" onClick={()=>setMenuOpen(true)} aria-label="Open admin menu" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 lg:hidden">☰</button><div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="text-xl font-bold sm:text-2xl">Website Analytics</h1></div></div>
      <button type="button" onClick={()=>load(days)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-400 disabled:opacity-50"><RefreshCw size={15} className={loading?"animate-spin":""}/> Refresh</button>
    </div></header>
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row">
      <AdminSidebar active="analytics" open={menuOpen} onClose={()=>setMenuOpen(false)}/>
      <section className="min-w-0 flex-1 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-400">Visitors, devices, traffic sources and conversions</p><h2 className="mt-1 text-2xl font-bold">GA4 performance</h2><p className="mt-1 text-xs text-slate-500">Measurement ID: G-S2S70VQ1BF · Data is delayed by Google, usually up to 24–48 hours.</p></div>
          <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">{[7,28,90].map(value=><button key={value} type="button" onClick={()=>{setDays(value);void load(value,session.access_token);}} className={"rounded-lg px-3 py-2 text-xs font-semibold "+(days===value?"bg-emerald-400 text-slate-950":"text-slate-300 hover:bg-slate-800")}>{value} days</button>)}</div>
        </div>
        {error&&<div role="alert" className="rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-sm leading-6 text-amber-200">{error}<div className="mt-3"><button type="button" onClick={connectGoogle} disabled={connecting} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">{connecting?"Connecting…":"Connect / Reconnect Google account"}</button></div><p className="mt-3 text-xs text-amber-200/70">Approve Google Analytics read-only access. Ensure Google Analytics Data API and Admin API are enabled in the linked Google Cloud project.</p></div>}
        {!data&&!error&&<p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">{loading?"Loading GA4 reports…":"No report data loaded yet."}</p>}
        {summary&&<>
          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 xl:grid-cols-5">
            <Metric label="Active users" value={summary.activeUsers} change={pct(summary.activeUsers,data!.previous.activeUsers)} icon={Users}/>
            <Metric label="New users" value={summary.newUsers} change={pct(summary.newUsers,data!.previous.newUsers)} icon={Activity}/>
            <Metric label="Sessions" value={summary.sessions} change={pct(summary.sessions,data!.previous.sessions)} icon={Globe}/>
            <Metric label="Page views" value={summary.pageViews} change={pct(summary.pageViews,data!.previous.pageViews)} icon={Eye}/>
            <Metric label="Key events" value={summary.keyEvents} change={pct(summary.keyEvents,data!.previous.keyEvents)} icon={MousePointerClick}/>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Visitors by device"><div className="mt-3 space-y-3">{data!.devices.map(item=>{const Icon=deviceIcon(item.device);return <div key={item.device} className="flex items-center gap-3"><Icon size={17} className="text-emerald-300"/><span className="flex-1 text-sm text-slate-300">{item.device}</span><span className="text-sm font-semibold">{number(item.activeUsers)}</span><span className="w-24 text-right text-xs text-slate-500">{number(item.sessions)} sessions</span></div>;})}{!data!.devices.length&&<p className="text-sm text-slate-500">No device data in this period.</p>}</div></Panel>
            <Panel title="Traffic sources"><div className="mt-3 space-y-3">{data!.channels.map(item=><div key={item.channel} className="flex items-center gap-3"><span className="flex-1 text-sm text-slate-300">{item.channel}</span><span className="text-sm font-semibold">{number(item.sessions)}</span><span className="w-24 text-right text-xs text-slate-500">{number(item.activeUsers)} users</span></div>)}{!data!.channels.length&&<p className="text-sm text-slate-500">No channel data in this period.</p>}</div></Panel>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Events & conversions"><div className="mt-3 divide-y divide-slate-800">{data!.events.map(item=><div key={item.event} className="flex items-center gap-3 py-2"><span className="min-w-0 flex-1 truncate text-sm text-slate-300">{item.event}</span><span className="text-sm font-semibold">{number(item.count)}</span>{item.keyEvents>0&&<span className="text-xs text-emerald-300">{number(item.keyEvents)} key events</span>}</div>)}{!data!.events.length&&<p className="py-3 text-sm text-slate-500">No events recorded yet.</p>}</div><p className="mt-3 text-xs leading-5 text-slate-500">Mark important GA4 events such as generate_lead and whatsapp_click as Key events in Google Analytics to count them as conversions.</p></Panel>
            <Panel title="Top pages"><div className="mt-3 divide-y divide-slate-800">{data!.pages.map(item=><div key={item.path} className="flex items-center gap-3 py-2"><span className="min-w-0 flex-1 truncate text-sm text-slate-300">{item.path}</span><span className="text-sm font-semibold">{number(item.pageViews)} views</span></div>)}{!data!.pages.length&&<p className="py-3 text-sm text-slate-500">No page views recorded yet.</p>}</div></Panel>
          </div>
        </>}
        <p className="text-xs leading-5 text-slate-500">GA4 reporting is read-only. Visitors, sessions and events appear after the tracking tag starts collecting data. No visitor names, phone numbers or form contents are sent to Google Analytics.</p>
      </section>
    </div>
  </main>;
}
