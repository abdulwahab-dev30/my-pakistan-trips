import { supabase } from "./supabase";

export type WhatsAppQuotaReservation = {
  allowed: boolean;
  sent_count: number;
  monthly_limit: number;
  remaining: number;
  month_start: string;
};

/**
 * Atomically reserves one of the 1,000 monthly website-send slots.
 * Call immediately before a server-side WhatsApp send. If the send fails,
 * the server must release the reservation before returning an error.
 */
export async function reserveWhatsAppMessage(): Promise<WhatsAppQuotaReservation> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("reserve_whatsapp_message");
  if (error) throw new Error(error.message || "Could not check the WhatsApp monthly limit.");

  const quota = data as WhatsAppQuotaReservation;
  if (!quota?.allowed) {
    throw new Error("Monthly WhatsApp sending limit reached (1,000 messages). It will reset next month.");
  }

  return quota;
}
