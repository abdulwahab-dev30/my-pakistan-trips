import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, RefreshCw, Search, Send, CheckCheck, Clock3, UserRound, Smartphone } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

type Conversation = { id:string; wa_id:string; phone_number:string; customer_name:string|null; last_message:string|null; last_message_at:string; unread_count:number; last_inbound_at?:string|null };
type Message = { id:string; wa_message_id:string|null; direction:"inbound"|"outbound"; body:string; status:"received"|"sent"|"delivered"|"read"|"failed"; created_at:string; error_detail?:string|null };
type Filter = "all"|"received"|"sent"|"delivered"|"read"|"failed";
const filters: {value:Filter;label:string}[] = [{value:"all",label:"All messages"},{value:"received",label:"Received"},{value:"sent",label:"Sent"},{value:"delivered",label:"Delivered"},{value:"read",label:"Read"},{value:"failed",label:"Failed"}];

export default function AdminWhatsAppInbox(){
 const [session,setSession]=useState<any>(undefined),[authorized,setAuthorized]=useState(false),[checking,setChecking]=useState(true);
 const [menuOpen,setMenuOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [conversations,setConversations]=useState<Conversation[]>([]),[selected,setSelected]=useState<string|null>(null),[messages,setMessages]=useState<Message[]>([]);
 const [search,setSearch]=useState(""),[filter,setFilter]=useState<Filter>("all"),[draft,setDraft]=useState(""),[sending,setSending]=useState(false);
 const current=conversations.find(c=>c.id===selected)||null;
 const loadConversations=useCallback(async()=>{
  if(!supabase)return;setLoading(true);setError("");
  const {data,error}=await supabase.from("whatsapp_conversations").select("id,wa_id,phone_number,customer_name,last_message,last_message_at,unread_count,last_inbound_at").order("last_message_at",{ascending:false}).limit(300);
  if(error)setError("Inbox load nahi ho saka: "+error.message);else{const rows=(data||[]) as Conversation[];setConversations(rows);setSelected(old=>old&&rows.some(x=>x.id===old)?old:(rows[0]?.id||null));}
  setLoading(false);
 },[]);
 const loadMessages=useCallback(async(id:string)=>{
  if(!supabase)return;const {data,error}=await supabase.from("whatsapp_messages").select("id,wa_message_id,direction,body,status,created_at,error_detail").eq("conversation_id",id).order("created_at",{ascending:true}).limit(500);
  if(error)setError("Messages load nahi huay: "+error.message);else setMessages((data||[]) as Message[]);
 },[]);
 useEffect(()=>{let active=true;if(!supabaseConfigured||!supabase){setSession(null);setChecking(false);return;}
  const verify=async(s:any)=>{if(!s?.user?.id){if(active){setSession(null);setAuthorized(false);setChecking(false);}return;}
   if(active){setSession(s);setChecking(true);}try{const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw error||new Error("Session invalid");const ok=await isCmsAdmin(data.user.id);if(!ok){await supabase.auth.signOut();throw new Error("Unauthorized");}if(active){setAuthorized(true);await loadConversations();}}catch{if(active){setAuthorized(false);setSession(null);}}finally{if(active)setChecking(false);}};
  supabase.auth.getSession().then(({data})=>verify(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>Promise.resolve().then(()=>verify(s)));return()=>{active=false;subscription.unsubscribe();};
 },[loadConversations]);
 useEffect(()=>{if(selected)loadMessages(selected);else setMessages([]);},[selected,loadMessages]);
 const visibleConversations=useMemo(()=>{const q=search.trim().toLowerCase();return conversations.filter(c=>!q||[c.phone_number,c.wa_id,c.customer_name,c.last_message].some(v=>String(v||"").toLowerCase().includes(q)));},[conversations,search]);
 const visibleMessages=useMemo(()=>filter==="all"?messages:messages.filter(m=>m.status===filter),[messages,filter]);
 const send=async()=>{const text=draft.trim();if(!text||!current||sending)return;setSending(true);setError("");
  try{const {data:{session:s}}=await supabase!.auth.getSession();const response=await fetch("/api/whatsapp/send",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s?.access_token},body:JSON.stringify({to:current.wa_id,text})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Message send nahi hua.");setDraft("");await Promise.all([loadMessages(current.id),loadConversations()]);}
  catch(e:any){setError(e.message||"Message send nahi hua.");}finally{setSending(false);}
 };
 if(checking||session===undefined)return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Verifying admin access…</div>;
 if(!session||!authorized)return <Navigate to="/admin/login" replace/>;
 return <main className="min-h-screen bg-slate-950 text-white"><Helmet><title>WhatsApp Inbox | My Pakistan Trips Admin</title><meta name="robots" content="noindex,nofollow"/></Helmet>
  <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-3 sm:px-6"><div className="flex items-center gap-3"><button onClick={()=>setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 lg:hidden" aria-label="Open menu">☰</button><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300">My Pakistan Trips</p><h1 className="text-xl font-bold sm:text-2xl">WhatsApp Inbox</h1></div></div><button onClick={()=>{loadConversations();if(selected)loadMessages(selected);}} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-400 disabled:opacity-50"><RefreshCw size={15} className={loading?"animate-spin":""}/> Refresh</button></div></header>
  <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-6 lg:flex-row"><AdminSidebar active="inbox" open={menuOpen} onClose={()=>setMenuOpen(false)}/>
   <section className="min-w-0 flex-1 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Customer conversations</h2><p className="text-sm text-slate-400">Incoming WhatsApp messages and replies from your website</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">{conversations.length} conversations</span></div>
    {error&&<div role="alert" className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}
    <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 lg:grid-cols-[320px_minmax(0,1fr)]">
     <aside className="flex min-h-0 flex-col border-b border-slate-800 lg:border-b-0 lg:border-r"><div className="border-b border-slate-800 p-3"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or number…" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"/></div></div>
      <div className="max-h-[320px] overflow-y-auto lg:max-h-[580px]">{visibleConversations.map(c=><button key={c.id} onClick={()=>setSelected(c.id)} className={"w-full border-b border-slate-800/80 p-4 text-left transition hover:bg-slate-800/70 "+(selected===c.id?"bg-emerald-400/10":"")}><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><UserRound size={18}/></span><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-sm font-semibold">{c.customer_name||c.phone_number}</p><time className="shrink-0 text-[10px] text-slate-500">{new Date(c.last_message_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short"})}</time></div><p className="mt-1 truncate text-xs text-slate-400">{c.last_message||"No message preview"}</p></div></div></button>)}
       {!visibleConversations.length&&<div className="px-5 py-12 text-center"><MessageCircle className="mx-auto text-slate-600" size={28}/><p className="mt-3 text-sm font-medium">{loading?"Loading conversations…":"No conversations yet"}</p><p className="mt-1 text-xs leading-5 text-slate-500">Webhook connect hone ke baad customer messages yahan ayenge.</p></div>}
      </div></aside>
     <div className="flex min-h-[500px] min-w-0 flex-col">
      {current?<><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Smartphone size={18}/></span><div><p className="font-semibold">{current.customer_name||current.phone_number}</p><p className="text-xs text-slate-400">{current.phone_number}</p></div></div><span className="text-xs text-slate-500">WhatsApp conversation</span></div>
       <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-3 py-3"><span className="mr-1 text-xs text-slate-500">Filter:</span>{filters.map(f=><button key={f.value} onClick={()=>setFilter(f.value)} className={"rounded-full px-3 py-1.5 text-xs font-semibold "+(filter===f.value?"bg-emerald-400 text-slate-950":"border border-slate-700 text-slate-300 hover:border-slate-500")}>{f.label}</button>)}</div>
       <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950 p-4 sm:p-6">{visibleMessages.map(m=><div key={m.id} className={"flex "+(m.direction==="outbound"?"justify-end":"justify-start")}><div className={"max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] "+(m.direction==="outbound"?"rounded-br-md bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-400/20":"rounded-bl-md bg-slate-800 text-slate-100")}><p className="whitespace-pre-wrap break-words text-sm leading-6">{m.body}</p><div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-slate-400"><time>{new Date(m.created_at).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"})}</time>{m.direction==="outbound"&&<span className="inline-flex items-center gap-1">{m.status==="failed"?<span className="text-rose-300">Failed</span>:<><CheckCheck size={13} className={m.status==="read"?"text-sky-300":""}/>{m.status}</>}</span>}</div>{m.error_detail&&<p className="mt-1 text-xs text-rose-300">{m.error_detail}</p>}</div></div>)}
        {!visibleMessages.length&&<div className="py-14 text-center"><MessageCircle className="mx-auto text-slate-600" size={30}/><p className="mt-3 text-sm text-slate-400">{filter==="all"?"No messages in this conversation yet.":"No messages with this status."}</p></div>}</div>
       <div className="border-t border-slate-800 bg-slate-900 p-3 sm:p-4"><div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500"><Clock3 size={13}/> Free-form replies are available within Meta's 24-hour customer service window; templates may be required outside it.</div><div className="flex items-end gap-2"><textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={2} placeholder="Type your WhatsApp reply…" className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-400"/><button onClick={send} disabled={!draft.trim()||sending} className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16}/><span className="hidden sm:inline">{sending?"Sending…":"Send"}</span></button></div></div>
      </>:<div className="grid flex-1 place-items-center p-8 text-center"><div><MessageCircle size={42} className="mx-auto text-slate-700"/><h3 className="mt-4 text-lg font-semibold">Your WhatsApp inbox</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Select a conversation to read messages and reply. New customer chats will appear here when the Meta webhook is connected.</p></div></div>}
     </div>
    </div>
    <p className="px-1 text-xs leading-5 text-slate-500">Message status is updated by Meta delivery webhooks. A conversation appears only after an actual incoming message is received.</p>
   </section>
  </div>
 </main>;
}
