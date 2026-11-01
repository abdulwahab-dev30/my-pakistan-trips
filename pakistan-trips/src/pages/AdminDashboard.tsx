import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity, BarChart3, CalendarDays, CheckCircle2, CircleAlert, ExternalLink,
  FileText, Image as ImageIcon, LayoutDashboard, Menu, MessageSquare,
  RefreshCw, Star, TrendingUp, Wallet, Globe
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

function StatCard({ label, value, note, icon: Icon, accent = "emerald" }: {
  label: string; value: number | null; note: string; icon: React.ElementType; accent?: string;
}) {
  const accentClass = accent === "rose" ? "text-rose-300 bg-rose-400/10 border-rose-400/20" :
    accent === "sky" ? "text-sky-300 bg-sky-400/10 border-sky-400/20" :
    accent === "amber" ? "text-amber-300 bg-amber-400/10 border-amber-400/20" :
    "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div className={"grid h-11 w-11 place-items-center rounded-xl border " + accentClass}><Icon size={20}/></div>
        <span className="text-xs text-slate-500">Live database</span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-white">{value === null ? "—" : value.toLocaleString("en-PK")}</p>
      <h3 className="mt-1 text-sm font-semibold text-slate-300">{label}</h3>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </article>
  );
}

function NotConnected({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-slate-400"><Icon size={18}/></div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-200">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300"><CircleAlert size={13}/> Not connected</span>
      </div>
    </div>
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
      countRows("gallery_images"),
      countRows("tour_images"),
    ]);
    setStats({
      tours: tours.count, publishedTours: published.count, draftTours: drafts.count,
      internationalTours: international.count, faqs: faqs.count, reviews: reviews.count,
      galleryImages: gallery.count, tourImages: tourImages.count,
    });
    const failures = [tours, published, drafts, international, faqs, reviews, gallery, tourImages]
      .filter(item => item.error).map(item => item.error);
    if (failures.length) setError("Some statistics could not be loaded. Check the admin read policies for the affected tables.");
    const { data, error: recentError } = await supabase
      .from("tours")
      .select("id,title,slug,published,updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);
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
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Verifying admin access…</div>;
  }
  if (!session || !authorized) return <Navigate to="/admin/login" replace/>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Helmet><title>Admin Dashboard | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 lg:hidden"><Menu size={20}/></button>
            <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Business overview</h1></div>
          </div>
          <button type="button" onClick={loadDashboard} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-400 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/><span className="hidden sm:inline">Refresh data</span></button>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <AdminSidebar active="dashboard" open={menuOpen} onClose={() => setMenuOpen(false)}/>
        <section className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm text-slate-400">Your website and CMS at a glance</p><h2 className="mt-1 text-2xl font-bold">Dashboard overview</h2></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"><CheckCircle2 size={14}/> Connected to Supabase</span>
          </div>
          {error && <p role="status" className="rounded-xl border border-amber-800 bg-amber-950/30 p-3 text-sm text-amber-200">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total tour packages" value={stats.tours} note="All CMS tour records" icon={Globe}/>
            <StatCard label="Published tours" value={stats.publishedTours} note="Visible tour records" icon={CheckCircle2}/>
            <StatCard label="Draft tours" value={stats.draftTours} note="Unpublished tour records" icon={FileText} accent="amber"/>
            <StatCard label="International tours" value={stats.internationalTours} note="International package records" icon={TrendingUp} accent="sky"/>
            <StatCard label="FAQs" value={stats.faqs} note="FAQ records in CMS" icon={MessageSquare}/>
            <StatCard label="Customer reviews" value={stats.reviews} note="Testimonial records" icon={Star} accent="amber"/>
            <StatCard label="Gallery images" value={stats.galleryImages} note="Supabase gallery records" icon={ImageIcon} accent="rose"/>
            <StatCard label="Tour images" value={stats.tourImages} note="Images linked to tour records" icon={ImageIcon} accent="sky"/>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Recently updated tours</h3><p className="mt-1 text-xs text-slate-500">Latest records from your CMS</p></div><a href="/admin/tours" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Manage tours <ExternalLink size={13}/></a></div>
              <div className="mt-4 divide-y divide-slate-800">
                {recentTours.length ? recentTours.map(tour => <div key={tour.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{tour.title}</p><p className="mt-1 truncate text-xs text-slate-500">/{tour.slug || "no-slug"}</p></div>
                  <span className={"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold " + (tour.published ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300")}>{tour.published ? "Published" : "Draft"}</span>
                </div>) : <p className="py-6 text-sm text-slate-500">No tour records available, or the records could not be read.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-2"><Activity className="text-emerald-300" size={19}/><div><h3 className="font-bold">Analytics connections</h3><p className="mt-1 text-xs text-slate-500">External data sources needed for full business analytics</p></div></div>
              <div className="mt-4 space-y-3">
                <NotConnected title="Google Analytics 4" description="Connect GA4 to display visitors, sessions, page views, devices and traffic sources." icon={BarChart3}/>
                <NotConnected title="Google Search Console" description="Connect Search Console to display Google clicks, impressions, queries and search positions." icon={TrendingUp}/>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2"><LayoutDashboard className="text-emerald-300" size={19}/><div><h3 className="font-bold">Business modules not yet connected</h3><p className="mt-1 text-xs text-slate-500">These figures will remain unavailable until the website has real records for them.</p></div></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <NotConnected title="Bookings" description="No bookings table was found in the current database schema." icon={CalendarDays}/>
              <NotConnected title="Revenue & payments" description="No payment or invoice records were found in the current database schema." icon={Wallet}/>
              <NotConnected title="Customer inquiries" description="No inquiry or lead records were found in the current database schema." icon={MessageSquare}/>
            </div>
          </section>
          <p className="text-xs leading-5 text-slate-500">Dashboard statistics are read-only. Existing tour, FAQ, gallery, review and authentication workflows are not modified by this page.</p>
        </section>
      </div>
    </main>
  );
}
