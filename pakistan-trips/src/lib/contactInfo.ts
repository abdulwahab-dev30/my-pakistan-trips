import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";
import fallback from "../data/trips-data.json";

export type ContactInfo = {
  company_name: string;
  license_number: string;
  contact_numbers: string[];
  phone: string;
  secondary_phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  pickup_points: { lahore?: string; islamabad_rawalpindi?: string };
  office_hours: string;
  map_embed_url: string;
};

const fallbackInfo: ContactInfo = {
  company_name: fallback.company,
  license_number: fallback.license_number,
  contact_numbers: fallback.contact_numbers || [],
  phone: fallback.contact_numbers?.[0] || "",
  secondary_phone: fallback.contact_numbers?.[1] || "",
  whatsapp: fallback.contact_numbers?.[0] || "",
  email: fallback.email || "",
  address: fallback.address || "",
  website: fallback.website || "",
  pickup_points: fallback.pickup_points || {},
  office_hours: "",
  map_embed_url: "",
};

function normalize(row: any): ContactInfo {
  const numbers = Array.isArray(row?.contact_numbers) && row.contact_numbers.length
    ? row.contact_numbers.filter(Boolean)
    : [row?.phone, row?.secondary_phone].filter(Boolean);
  return {
    ...fallbackInfo,
    ...(row || {}),
    company_name: row?.company_name || fallbackInfo.company_name,
    license_number: row?.license_number || fallbackInfo.license_number,
    contact_numbers: numbers.length ? numbers : fallbackInfo.contact_numbers,
    phone: row?.phone || numbers[0] || fallbackInfo.phone,
    secondary_phone: row?.secondary_phone || numbers[1] || fallbackInfo.secondary_phone,
    whatsapp: row?.whatsapp || row?.phone || numbers[0] || fallbackInfo.whatsapp,
    email: row?.email || fallbackInfo.email,
    address: row?.address || fallbackInfo.address,
    website: row?.website || fallbackInfo.website,
    pickup_points: row?.pickup_points && Object.keys(row.pickup_points).length ? row.pickup_points : fallbackInfo.pickup_points,
  };
}

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(fallbackInfo);
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("contact_info").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (!error && data && active) setContactInfo(normalize(data));
    };
    void load();
    const channel = supabase.channel("public-contact-info")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_info" }, () => { void load(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, []);
  return contactInfo;
}

export { fallbackInfo };
