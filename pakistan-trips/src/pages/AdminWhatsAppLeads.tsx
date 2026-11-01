import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, RefreshCw, ExternalLink, Search, Clock3, MousePointerClick } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

type WhatsAppLead = {
  id: string;
  source: string;
  page_url: string;
  page_title: string | null;
  tour_title: string | null;
  tour_slug: string | null;
  message: string;
  clicked_at: string;
  created_at: string;
};

export default function AdminWhatsAppLeads() {
  const [session, setSession] = useState<any>(undefined);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "click_recorded">("all");

  const loadLeads = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthKey = monthStart.toISOString().slice(0, 10);
    const [{ data, error: queryError }, { data: usageData, error: usageError }] = await Promise.all([
      supabase.from("whatsapp_leads")
        .select("id,source,page_url,page_title,tour_title,tour_slug,message,clicked_at,created_at")
        .order("clicked_at", { ascending: false })
        .limit(500),
      supabase.from("whatsapp_message_usage")
        .select("sent_count")
        .eq("month_start", monthKey)
        .maybeSingle()
    ]);
    if (queryError) setError(queryError.message || "WhatsApp leads could not be loaded.");
    else setLeads((data || []) as WhatsAppLead[]);
    if (usageError) setError(current => current || "Monthly WhatsApp usage could not be loaded: " + usageError.message);
    else setMonthlyUsage(Number(usageData?.sent_count || 0));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    if (!supabaseConfigured || !supabase) {
      setSession(null);
      setChecking(false);
      return;
    }
    const verify = async (nextSession: any) => {
      if (!nextSession?.user?.id) {
        if (active) { setSession(null); setAuthorized(false); setChecking(false); }
        return;
      }
      if (active) { setSession(nextSession); setChecking(true); }
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data?.user) throw new Error("Your admin session could not be verified.");
        const allowed = await isCmsAdmin(data.user.id);
        if (!allowed) {
          await supabase.auth.signOut();
          throw new Error("This account is not an authorized My Pakistan Trips admin.");
        }
        if (active) { setAuthorized(true); await loadLeads(); }
      } catch {
        if (active) { setAuthorized(false); setSession(null); }
      } finally {
        if (active) setChecking(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => verify(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      Promise.resolve().then(() => verify(nextSession));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [loadLeads]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matchesSearch = (lead: WhatsAppLead) => !term || [lead.page_title, lead.page_url, lead.tour_title, lead.tour_slug, lead.message]
      .some(value => String(value || "").toLowerCase().includes(term));
    return leads.filter(lead => (statusFilter === "all" || statusFilter === "click_recorded") && matchesSearch(lead));
  }, [leads, search, statusFilter]);

  if (checking || session === undefined) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">Verifying admin access…</div>;
  }
  if (!session || !authorized) return <Navigate to="/admin/login" replace />;

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-slate-950 text-white">
      <Helmet><title>WhatsApp Leads | My Pakistan Trips Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin menu" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 lg:hidden">☰</button>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 sm:text-xs">My Pakistan Trips</p><h1 className="mt-1 truncate text-lg font-bold sm:text-2xl">WhatsApp Leads</h1></div>
          </div>
          <button type="button" onClick={loadLeads} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 disabled:opacity-50 sm:text-sm"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/> Refresh leads</button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:flex-row">
        <AdminSidebar active="leads" open={menuOpen} onClose={() => setMenuOpen(false)} />
        <section className="min-w-0 flex-1 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm text-slate-400">People who clicked a WhatsApp inquiry link on your website</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Inquiry activity</h2></div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3"><p className="text-xs text-emerald-200">Total clicks recorded</p><p className="mt-1 text-2xl font-bold text-white">{leads.length.toLocaleString("en-PK")}</p></div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm font-semibold text-white">Monthly WhatsApp sending limit</p><p className="mt-1 text-xs text-slate-400">Outgoing messages reserved through the website this month</p></div>
              <span className={"rounded-full px-3 py-1 text-xs font-bold " + (monthlyUsage >= 1000 ? "bg-rose-400/10 text-rose-300" : monthlyUsage >= 900 ? "bg-amber-400/10 text-amber-300" : "bg-emerald-400/10 text-emerald-300")}>{monthlyUsage >= 1000 ? "Limit reached" : monthlyUsage >= 900 ? "Approaching limit" : "Within limit"}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3"><p className="text-3xl font-bold tabular-nums text-white">{monthlyUsage.toLocaleString("en-PK")} <span className="text-base font-medium text-slate-500">/ 1,000</span></p><p className="text-xs text-slate-400">{Math.max(1000 - monthlyUsage, 0).toLocaleString("en-PK")} remaining</p></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className={"h-full rounded-full " + (monthlyUsage >= 1000 ? "bg-rose-400" : monthlyUsage >= 900 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: Math.min(monthlyUsage / 1000 * 100, 100) + "%" }} /></div>
            {monthlyUsage >= 900 && <p className="mt-3 text-xs text-amber-300">{monthlyUsage >= 1000 ? "The monthly website sending allowance has been reached. New sends must be blocked until the monthly reset." : "Warning: fewer than 100 messages remain this month."}</p>}
            <p className="mt-3 text-xs leading-5 text-slate-500">Counter resets automatically on the first day of each month (UTC). This is a website-side safety cap; Meta billing/free-tier rules are separate.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search page, package or message…" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-400"/></div>
            <div className="flex flex-wrap items-center gap-2"><select aria-label="Filter lead status" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "all" | "click_recorded")} className="min-h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-emerald-400"><option value="all">All statuses</option><option value="click_recorded">Click recorded</option></select><span className="text-xs text-slate-500">{filtered.length} of {leads.length} records</span></div>
          </div>
          {error && <p role="alert" className="break-words rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {filtered.length ? <div className="divide-y divide-slate-800">
              {filtered.map(lead => <article key={lead.id} className="grid min-w-0 gap-3 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><MessageCircle size={18}/></span><div className="min-w-0"><p className="font-semibold text-white">{lead.tour_title || lead.page_title || "Website WhatsApp inquiry"}</p><p className="mt-0.5 text-xs text-slate-500">{lead.tour_slug ? "Package: " + lead.tour_slug : "General website inquiry"}</p></div></div>
                  <p className="mt-3 break-words text-sm leading-6 text-slate-300">{lead.message}</p>
                </div>
                <div className="min-w-0">
                  <p className="break-all text-xs leading-5 text-slate-400">{lead.page_url}</p>
                  <a href={lead.page_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Open source page <ExternalLink size={12}/></a>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 xl:justify-end"><Clock3 size={14}/><span>{new Date(lead.clicked_at || lead.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</span><span className="rounded-full bg-amber-400/10 px-2.5 py-1 font-semibold text-amber-300">Click recorded</span></div>
              </article>)}
            </div> : <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-slate-400"><MousePointerClick size={22}/></span><h3 className="mt-4 font-semibold text-white">{loading ? "Loading WhatsApp activity…" : search ? "No matching inquiries" : "No WhatsApp clicks yet"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">When a visitor clicks the website WhatsApp button, the click and its page/message details will appear here.</p></div>}
          </div>
          <p className="px-1 text-xs leading-5 text-slate-500">Status filter is based on website click tracking only. These records show WhatsApp link clicks only. They do not confirm that a visitor sent the message or reveal their WhatsApp phone number or replies.</p>
        </section>
      </div>
    </main>
  );
}
