import { supabase } from "./supabase";

type WhatsAppLeadInput = {
  message: string;
  source?: string;
  tourTitle?: string;
  tourSlug?: string;
};

export async function trackWhatsAppLead(input: WhatsAppLeadInput): Promise<void> {
  if (!supabase) {
    console.error("WhatsApp lead tracking unavailable: Supabase is not configured.");
    return;
  }

  const payload = {
    source: input.source || "floating_whatsapp_button",
    page_url: window.location.href.slice(0, 2048),
    page_title: document.title.slice(0, 300),
    tour_title: input.tourTitle?.slice(0, 300) || null,
    tour_slug: input.tourSlug?.slice(0, 200) || null,
    message: input.message.slice(0, 2000),
  };

  try {
    const { error } = await supabase.from("whatsapp_leads").insert(payload);
    if (error) {
      console.error("WhatsApp inquiry could not be saved:", error.message, error.code);
    }
  } catch (error) {
    console.error("WhatsApp inquiry tracking failed:", error);
  }
}
