import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity, BarChart3, CalendarDays, CheckCircle2, CircleAlert, ExternalLink,
  FileText, Image as ImageIcon, LayoutDashboard, Menu, MessageSquare,
  RefreshCw, Star, TrendingUp, Wallet, Globe, Search, Unplug, MousePointerClick,
  Eye, Smartphone, ChevronDown, SearchCheck
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

type CountResult = { count: number | null; error: string | null };
type Stats = {
  tours: number | null; publishedTours: number | null; draftTours: number | null;
  internationalTours: number | null; faqs: number | null; reviews: number | null;
  galleryImages: number | null; tourImages: number | null;
};
type RecentTour = { id: string; title: string; slug: string | null; published: boolean; updated_at: string | null };
type SearchMetric = { clicks: number; impressions: number; ctr: number; position: number };
type SearchConsoleData = {
  connected: boolean;
  properties: { siteUrl: string; permissionLevel: string }[];
  siteUrl: string;
  period: { startDate: string; endDate: string; previousStartDate: string; previousEndDate: string };
  summary: SearchMetric;
  previous: SearchMetric;
  daily: (SearchMetric & { date: string })[];
  topQueries: (SearchMetric & { query: string })[];
  topPages: (SearchMetric & { page: string })[];
};

const emptyStats: Stats = {
  tours: null, publishedTours: null, draftTours: null, internationalTours: null,
  faqs: null, reviews: null, galleryImages: null, tourImages: null,
};

async function countRows(table: string, filters?: (query: any) => any): Promise<CountResult> {
  try {
    let query = supabase!.from(table).select("id", { count: "exact", head: true });
    if (filters) query = filters(query);
    const { count, error } = await query;
    return { count: error ? null : (count ?? 0), error: error?.message || null };
  } catch (error: any) {
    return { count: null, error: error?.message || "Unable to load count." };
  }
}

async function countCloudinaryGalleryImages(): Promise<CountResult> {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "lvv2vfug";
    const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/gallery.json?t=${Date.now()}`);
    if (!response.ok) throw new Error("Cloudinary gallery list is not available.");
    const result = await response.json();
    const count = Array.isArray(result.resources)
      ? result.resources.filter((image: any) => image.public_id && image.version && image.format).length
      : 0;
    return { count, error: null };
  } catch (error: any) {
    return { count: null, error: error?.message || "Unable to load Cloudinary gallery count." };
  }
}

function StatCard({ label, value, note, icon: Icon, accent = "emerald" }: {
  label: string; value: number | null; note: string; icon: React.ElementType; accent?: string;
}) {
  const accentClass = accent === "rose" ? "text-rose-300 bg-rose-400/10 border-rose-400/20" :
    accent === "sky" ? "text-sky-300 bg-sky-400/10 border-sky-400/20" :
    accent === "amber" ? "text-amber-300 bg-amber-400/10 border-amber-400/20" :
    "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  return (
    <article className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/10 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-xl border " + accentClass}><Icon size={19}/></div>
        <span className="text-right text-[10px] text-slate-500 sm:text-xs">Live database</span>
      </div>
      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">{value === null ? "—" : value.toLocaleString("en-PK")}</p>
      <h3 className="mt-1 text-sm font-semibold text-slate-300">{label}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function NotConnected({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-3 sm:p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-slate-400"><Icon size={18}/></div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-200">{title}</p>
        <p className="mt-1 break-words text-sm leading-6 text-slate-500">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300"><CircleAlert size={13}/> Not connected</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon, reverse = false }: {
  label: string; value: string; change?: number; icon: React.ElementType; reverse?: boolean;
}) {
  const good = change === undefined ? null : (reverse ? change <= 0 : change >= 0);
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400"><Icon size={15}/><span>{label}</span></div>
      <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{value}</p>
      {change !== undefined && <p className={"mt-1 text-xs " + (good ? "text-emerald-300" : "text-rose-300")}>{change > 0 ? "+" : ""}{change.toFixed(1)}% vs previous 28 days</p>}
    </div>
  );
}

function SearchConsolePanel({ accessToken }: { accessToken: string }) {
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (siteUrl?: string) => {
    setBusy(true);
    setError("");
    try {
      const url = "/api/search-console/data" + (siteUrl ? "?siteUrl=" + encodeURIComponent(siteUrl) : "");
      const response = await fetch(url, { headers: { Authorization: "Bearer " + accessToken }, credentials: "same-origin" });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) { setConnected(false); setData(null); }
        throw new Error(result.error || "Could not load Search Console data.");
      }
      setConnected(Boolean(result.connected));
      setData(result as SearchConsoleData);
      if (result.error) setNotice(result.error);
      else setNotice("");
    } catch (err: any) {
      setError(err?.message || "Search Console data could not be loaded.");
    } finally {
      setBusy(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("searchConsole");
    if (status) {
      const messages: Record<string, string> = {
        connected: "Google Search Console connected. Loading your verified properties…",
        cancelled: "Google connection was cancelled.",
        invalid_state: "The Google security check expired. Please try connecting again.",
        not_configured: "Google OAuth credentials are missing in Vercel.",
        token_error: "Google could not complete authorization. Check your OAuth client settings and try again.",
        missing_refresh_token: "Google did not return a refresh token. Reconnect and approve access when prompted.",
      };
      if (status === "connected") setNotice(messages[status]);
      else setError(messages[status] || "Google connection could not be completed.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    load();
  }, [load]);

  async function connect() {
    setConnecting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/search-console/auth", {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken },
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.authorizationUrl) throw new Error(result.error || "Could not start Google authorization.");
      window.location.assign(result.authorizationUrl);
    } catch (err: any) {
      setError(err?.message || "Could not connect Google Search Console.");
      setConnecting(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Disconnect Google Search Console from this admin dashboard?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/search-console/disconnect", {
        method: "POST",
        headers: { Authorization: "Bearer " + accessToken },
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not disconnect Google.");
      setData(null);
      setConnected(false);
      setNotice("Google Search Console disconnected from this browser.");
    } catch (err: any) {
      setError(err?.message || "Could not disconnect Google.");
    } finally {
      setBusy(false);
    }
  }

  const pct = (current: number, previous: number) => previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);
  const format = (value: number) => value.toLocaleString("en-PK");
  const maxClicks = Math.max(1, ...(data?.daily || []).map(row => row.clicks));

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300"><Search size={20}/></div>
          <div className="min-w-0"><h3 className="text-lg font-bold text-white">Google Search Console</h3><p className="mt-1 text-xs leading-5 text-slate-400">Organic Google Search performance · last 28 complete days</p></div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          {connected ? <>
            <button type="button" onClick={() => load(data?.siteUrl)} disabled={busy} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-sky-400 disabled:opacity-50 sm:flex-none"><RefreshCw size={14} className={busy ? "animate-spin" : ""}/> Refresh</button>
            <button type="button" onClick={disconnect} disabled={busy} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-rose-400 disabled:opacity-50 sm:flex-none"><Unplug size={14}/> Disconnect</button>
          </> : <button type="button" onClick={connect} disabled={connecting} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300 disabled:opacity-50 sm:w-auto"><Search size={16}/>{connecting ? "Connecting…" : "Connect Google Search Console"}</button>}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 break-words rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="mt-4 break-words rounded-xl border border-sky-900 bg-sky-950/40 p-3 text-sm text-sky-200">{notice}</p>}

      {connected && data?.properties?.length ? <>
        <div className="mt-5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-xs font-semibold text-slate-400" htmlFor="gsc-property">Search Console property</label>
          <div className="relative w-full min-w-0 sm:max-w-md">
            <select id="gsc-property" value={data.siteUrl} onChange={event => load(event.target.value)} className="min-h-11 w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pr-9 text-sm text-slate-100 outline-none focus:border-sky-400">
              {data.properties.map(property => <option key={property.siteUrl} value={property.siteUrl}>{property.siteUrl}</option>)}
            </select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          </div>
        </div>
        {data.summary && <p className="mt-3 text-xs text-slate-500">Data from {data.period.startDate} to {data.period.endDate}. Search Console data can be delayed by a few days.</p>}
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total clicks" value={format(data.summary.clicks)} change={pct(data.summary.clicks, data.previous.clicks)} icon={MousePointerClick}/>
          <MetricCard label="Impressions" value={format(data.summary.impressions)} change={pct(data.summary.impressions, data.previous.impressions)} icon={Eye}/>
          <MetricCard label="Average CTR" value={(data.summary.ctr * 100).toFixed(2) + "%"} change={pct(data.summary.ctr, data.previous.ctr)} icon={TrendingUp}/>
          <MetricCard label="Average position" value={data.summary.position.toFixed(1)} change={pct(data.summary.position, data.previous.position)} icon={SearchCheck} reverse/>
        </div>

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold text-slate-100">Daily clicks</h4><span className="text-[11px] text-slate-500">28 days</span></div>
            <div className="mt-5 flex h-36 min-w-0 items-end gap-1 overflow-hidden">
              {data.daily.map((row, index) => <div key={row.date || index} title={row.date + ": " + row.clicks + " clicks"} className="group relative flex h-full min-w-0 flex-1 items-end">
                <div className="w-full rounded-t-sm bg-sky-400/80 transition-colors group-hover:bg-sky-300" style={{ height: Math.max(3, (row.clicks / maxClicks) * 100) + "%" }}/>
              </div>)}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>{data.daily[0]?.date || "—"}</span><span>{data.daily[data.daily.length - 1]?.date || "—"}</span></div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <h4 className="font-semibold text-slate-100">Device performance</h4>
            <p className="mt-1 text-xs text-slate-500">Search impressions by device are available through the property report.</p>
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-900 p-3"><Smartphone size={18} className="shrink-0 text-sky-300"/><div className="min-w-0"><p className="text-sm font-semibold text-slate-200">Mobile-first search insights</p><p className="mt-1 text-xs leading-5 text-slate-500">Use the top pages and queries below to identify mobile search opportunities.</p></div></div>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <h4 className="font-semibold text-slate-100">Top search queries</h4>
            <div className="mt-3 divide-y divide-slate-800">
              {data.topQueries.length ? data.topQueries.map((row, index) => <div key={row.query || index} className="flex min-w-0 items-center justify-between gap-3 py-3"><p className="min-w-0 flex-1 break-words text-sm text-slate-300">{row.query || "Hidden query"}</p><div className="shrink-0 text-right"><p className="text-sm font-semibold text-white">{format(row.clicks)} clicks</p><p className="mt-1 text-[11px] text-slate-500">{format(row.impressions)} impressions</p></div></div>) : <p className="py-5 text-sm text-slate-500">No query data returned for this period.</p>}
            </div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <h4 className="font-semibold text-slate-100">Top pages from Google</h4>
            <div className="mt-3 divide-y divide-slate-800">
              {data.topPages.length ? data.topPages.map((row, index) => <div key={row.page || index} className="flex min-w-0 items-center justify-between gap-3 py-3"><p className="min-w-0 flex-1 break-all text-xs leading-5 text-slate-300">{row.page}</p><div className="shrink-0 text-right"><p className="text-sm font-semibold text-white">{format(row.clicks)} clicks</p><p className="mt-1 text-[11px] text-slate-500">{format(row.impressions)} impressions</p></div></div>) : <p className="py-5 text-sm text-slate-500">No page data returned for this period.</p>}
            </div>
          </div>
        </div>
      </> : connected && <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">The connected Google account has no Search Console properties available. Add your website as a property in Search Console and grant this Google account access.</div>}
      {!connected && !error && <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm leading-6 text-slate-400">Connect the Google account that has access to the verified <strong className="text-slate-200">mypakistantrips.com</strong> Search Console property. Only read-only Search Console access is requested.</div>}
    </section>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(undefined);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recentTours, setRecentTours] = useState<RecentTour[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const [tours, published, drafts, international, faqs, reviews, gallery, tourImages] = await Promise.all([
      countRows("tours"),
      countRows("tours", q => q.eq("published", true)),
      countRows("tours", q => q.eq("published", false)),
      countRows("international_tours"),
      countRows("faqs"),
      countRows("testimonials"),
      countCloudinaryGalleryImages(),
      countRows("tour_images"),
    ]);
    setStats({
      tours: tours.count, publishedTours: published.count, draftTours: drafts.count,
      internationalTours: international.count, faqs: faqs.count, reviews: reviews.count,
      galleryImages: gallery.count, tourImages: tourImages.count,
    });
    const failures = [tours, published, drafts, international, faqs, reviews, gallery, tourImages].filter(item => item.error);
    if (failures.length) setError("Some statistics could not be loaded. Check the admin read policies for the affected tables.");
    const { data, error: recentError } = await supabase.from("tours")
      .select("id,title,slug,published,updated_at").order("updated_at", { ascending: false }).limit(5);
    if (!recentError) setRecentTours((data || []) as RecentTour[]);
    else setRecentTours([]);
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
        if (active) { setAuthorized(true); await loadDashboard(); }
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
  }, [loadDashboard]);

  if (checking || session === undefined) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">Verifying admin access…</div>;
  }
  if (!session || !authorized) return <Navigate to="/admin/login" replace/>;

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-slate-950 text-white">
      <Helmet><title>Admin Dashboard | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin menu" aria-expanded={menuOpen} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 lg:hidden"><Menu size={20}/></button>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 sm:text-xs">My Pakistan Trips</p><h1 className="mt-1 truncate text-lg font-bold sm:text-2xl">Business overview</h1></div>
          </div>
          <button type="button" onClick={loadDashboard} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 disabled:opacity-50 sm:text-sm"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/><span>Refresh data</span></button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:flex-row">
        <AdminSidebar active="dashboard" open={menuOpen} onClose={() => setMenuOpen(false)}/>
        <section className="min-w-0 flex-1 space-y-4 sm:space-y-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0"><p className="text-sm text-slate-400">Your website and CMS at a glance</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Dashboard overview</h2></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 sm:text-xs"><CheckCircle2 size={14}/> Connected to Supabase</span>
          </div>
          {error && <p role="status" className="break-words rounded-xl border border-amber-800 bg-amber-950/30 p-3 text-sm text-amber-200">{error}</p>}
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
            <StatCard label="Total tour packages" value={stats.tours} note="All CMS tour records" icon={Globe}/>
            <StatCard label="Published tours" value={stats.publishedTours} note="Visible tour records" icon={CheckCircle2}/>
            <StatCard label="Draft tours" value={stats.draftTours} note="Unpublished tour records" icon={FileText} accent="amber"/>
            <StatCard label="International tours" value={stats.internationalTours} note="International package records" icon={TrendingUp} accent="sky"/>
            <StatCard label="FAQs" value={stats.faqs} note="FAQ records in CMS" icon={MessageSquare}/>
            <StatCard label="Customer reviews" value={stats.reviews} note="Testimonial records" icon={Star} accent="amber"/>
            <StatCard label="Gallery images" value={stats.galleryImages} note="Cloudinary gallery images" icon={ImageIcon} accent="rose"/>
            <StatCard label="Tour images" value={stats.tourImages} note="Images linked to tour records" icon={ImageIcon} accent="sky"/>
          </div>

          <SearchConsolePanel accessToken={session.access_token}/>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 sm:gap-6">
            <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><div className="min-w-0"><h3 className="font-bold">Recently updated tours</h3><p className="mt-1 text-xs text-slate-500">Latest records from your CMS</p></div><a href="/admin/tours" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Manage tours <ExternalLink size={13}/></a></div>
              <div className="mt-4 divide-y divide-slate-800">
                {recentTours.length ? recentTours.map(tour => <div key={tour.id} className="flex min-w-0 items-center justify-between gap-2 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{tour.title}</p><p className="mt-1 truncate text-xs text-slate-500">/{tour.slug || "no-slug"}</p></div>
                  <span className={"shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-[11px] " + (tour.published ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300")}>{tour.published ? "Published" : "Draft"}</span>
                </div>) : <p className="py-6 text-sm text-slate-500">No tour records available, or the records could not be read.</p>}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
              <div className="flex items-center gap-2"><Activity className="shrink-0 text-emerald-300" size={19}/><div className="min-w-0"><h3 className="font-bold">Analytics connections</h3><p className="mt-1 text-xs text-slate-500">External data sources for business analytics</p></div></div>
              <div className="mt-4 space-y-3">
                <NotConnected title="Google Analytics 4" description="Connect GA4 separately to display visitors, sessions, page views, devices and traffic sources." icon={BarChart3}/>
              </div>
            </section>
          </div>

          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <div className="flex items-center gap-2"><LayoutDashboard className="shrink-0 text-emerald-300" size={19}/><div className="min-w-0"><h3 className="font-bold">Business modules not yet connected</h3><p className="mt-1 text-xs text-slate-500">These figures remain unavailable until real records exist.</p></div></div>
            <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
              <NotConnected title="Bookings" description="No bookings table was found in the current database schema." icon={CalendarDays}/>
              <NotConnected title="Revenue & payments" description="No payment or invoice records were found in the current database schema." icon={Wallet}/>
              <div className="min-w-0 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 sm:p-4"><div className="flex items-center gap-2 text-emerald-300"><MessageSquare size={18}/><p className="font-semibold text-slate-200">WhatsApp Leads</p></div><p className="mt-2 text-sm leading-6 text-slate-400">View website visitors who clicked to enquire on WhatsApp.</p><a href="/admin/whatsapp-leads" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300">Open leads <ExternalLink size={13}/></a></div>
            </div>
          </section>
          <p className="px-1 text-xs leading-5 text-slate-500">Dashboard statistics are read-only. Existing tour, FAQ, gallery, review and authentication workflows are not modified by this page.</p>
        </section>
      </div>
    </main>
  );
}
