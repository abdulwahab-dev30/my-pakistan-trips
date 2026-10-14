import { supabase, supabaseConfigured } from "./supabase";
import { tours as localTours } from "../data/tours.js";

const clean = (row) => ({ ...(row?.data || {}), id: row?.id, slug: row?.slug || row?.data?.slug, title: row?.title || row?.data?.title, published: row?.published ?? true });

export async function getPublishedTours() {
  if (!supabaseConfigured) return localTours;
  const { data, error } = await supabase.from("tours").select("id,slug,title,published,data,updated_at").eq("published", true).order("title");
  if (error) { console.error("Unable to load CMS tours:", error.message); return localTours; }
  return data?.length ? data.map(clean) : localTours;
}
export async function getTourBySlug(slug) {
  if (supabaseConfigured) {
    const { data, error } = await supabase.from("tours").select("id,slug,title,published,data").eq("slug", slug).eq("published", true).maybeSingle();
    if (!error && data) return clean(data);
  }
  return localTours.find(t => t.slug === slug) || null;
}
export async function getAdminTours() {
  if (!supabaseConfigured) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel environment variables.");
  const { data, error } = await supabase.from("tours").select("id,slug,title,published,data,updated_at").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(clean);
}
export async function saveTour(tour, id) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const slug = (tour.slug || tour.title || "").toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("Please provide a tour title or slug.");
  const payload = { slug, title: tour.title, published: Boolean(tour.published), data: { ...tour, slug, title: tour.title } };
  const query = id ? supabase.from("tours").update(payload).eq("id", id) : supabase.from("tours").insert(payload);
  const { error } = await query;
  if (error) throw error;
}
export async function deleteTour(id) {
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) throw error;
}
export async function importLocalTours() {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const { data: existing, error: readError } = await supabase.from("tours").select("slug");
  if (readError) throw readError;
  const known = new Set((existing || []).map(x => x.slug));
  const rows = localTours.filter(t => !known.has(t.slug)).map(t => ({ slug: t.slug, title: t.title, published: true, data: t }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("tours").insert(rows);
  if (error) throw error;
  return rows.length;
}
