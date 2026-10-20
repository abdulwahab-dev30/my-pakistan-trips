import { supabase, supabaseConfigured } from "./supabase";

export type InternationalTourDay = { day: number; title: string; description: string; location?: string };
export type InternationalTourImage = { src: string; alt?: string; publicId?: string };
export type InternationalTour = {
  id?: string; slug: string; title: string; label: string; destination: string;
  duration_days: number; duration_nights: number; price_usd: number; price_note: string;
  overview: string; seo_title: string; meta_description: string; highlights: string[];
  itinerary: InternationalTourDay[]; included: string[]; excluded: string[];
  images: InternationalTourImage[]; whatsapp_link: string; published: boolean; featured: boolean;
};

export async function getPublishedInternationalTours(): Promise<InternationalTour[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.from("international_tours").select("*").eq("published", true).order("featured", { ascending: false }).order("title");
  if (error) { console.error("Unable to load international tours:", error.message); return []; }
  return (data || []) as InternationalTour[];
}

export async function getInternationalTourBySlug(slug: string): Promise<InternationalTour | null> {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase.from("international_tours").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) { console.error("Unable to load international tour:", error.message); return null; }
  return (data || null) as InternationalTour | null;
}

export async function getAdminInternationalTours(): Promise<InternationalTour[]> {
  if (!supabaseConfigured) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.");
  const { data, error } = await supabase.from("international_tours").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as InternationalTour[];
}

export async function saveInternationalTour(tour: InternationalTour, id?: string) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const slug = (tour.slug || tour.title || "").toLowerCase().trim().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("Please provide a package title or URL slug.");
  if (!tour.title.trim()) throw new Error("Package title is required.");
  const days = Math.max(1, Number(tour.duration_days) || 1);
  const payload = {
    ...tour, id: undefined, slug, duration_days: days,
    duration_nights: Math.max(0, Math.min(days - 1, Number(tour.duration_nights) || 0)),
    price_usd: Math.max(0, Number(tour.price_usd) || 0),
    itinerary: Array.from({ length: days }, (_, index) => {
      const day = (tour.itinerary || []).find(item => Number(item.day) === index + 1);
      return { day: index + 1, title: day?.title || "", description: day?.description || "", location: day?.location || "" };
    }),
  };
  const query = id
    ? supabase.from("international_tours").update(payload).eq("id", id)
    : supabase.from("international_tours").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteInternationalTour(id: string) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("international_tours").delete().eq("id", id);
  if (error) throw error;
}
