import { supabase, supabaseConfigured } from "./supabase";
import { tours as localTours } from "../data/tours.js";

const clean = (row) => ({ ...(row?.data || {}), id: row?.id, slug: row?.slug || row?.data?.slug, title: row?.title || row?.data?.title, published: row?.published ?? true });

export async function getPublishedTours() {
  if (!supabaseConfigured) return localTours;
  const { data, error } = await supabase.from("tours").select("id,slug,title,published,data,updated_at").eq("published", true).order("title");
  if (error) { console.error("Unable to load CMS tours:", error.message); return localTours; }
  return (data || []).map(clean);
}
export async function getTourBySlug(slug) {
  if (supabaseConfigured) {
    const { data, error } = await supabase.from("tours").select("id,slug,title,published,data").eq("slug", slug).eq("published", true).maybeSingle();
    if (!error) return data ? clean(data) : null;
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
  const payload = {\n    slug, title: tour.title, published: Boolean(tour.published),\n    // Legacy tours columns are still NOT NULL in the production database.\n    location: tour.location || tour.destination || tour.title || "Pakistan",\n    duration: tour.duration || "Not specified",\n    price: Number(tour.price) || 0,\n    description: tour.overview || tour.description || "",\n    full_description: tour.fullDescription || tour.overview || tour.description || "",\n    featured: Boolean(tour.featured),\n    itinerary: tour.itinerary || [],\n    included_services: tour.included || tour.included_services || [],\n    travel_tips: tour.travelTips || tour.travel_tips || [],\n    data: { ...tour, slug, title: tour.title },\n  };
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
  const rows = localTours.filter(t => !known.has(t.slug)).map(t => ({\n    slug: t.slug, title: t.title, published: true,\n    location: t.location || t.destination || t.title || "Pakistan",\n    duration: t.duration || "Not specified",\n    price: Number(t.price) || 0,\n    description: t.overview || t.description || "",\n    full_description: t.fullDescription || t.overview || t.description || "",\n    featured: Boolean(t.featured),\n    itinerary: t.itinerary || [],\n    included_services: t.included || t.included_services || [],\n    travel_tips: t.travelTips || t.travel_tips || [],\n    data: t,\n  }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("tours").insert(rows);
  if (error) throw error;
  return rows.length;
}
