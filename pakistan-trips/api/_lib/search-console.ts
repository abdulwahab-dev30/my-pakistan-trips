import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";

export const REFRESH_COOKIE = "mptr_sc_refresh";
export const STATE_COOKIE = "mptr_sc_state";
export const SCOPES = "https://www.googleapis.com/auth/webmasters.readonly";

export function getCookie(req: VercelRequest, name: string): string {
  const header = req.headers.cookie || "";
  const match = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function appendCookie(res: VercelResponse, cookie: string) {
  const current = res.getHeader("Set-Cookie");
  const values = Array.isArray(current) ? current.map(String) : current ? [String(current)] : [];
  res.setHeader("Set-Cookie", [...values, cookie]);
}

export function setCookie(res: VercelResponse, name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  appendCookie(res, name + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + maxAge + secure);
}

export function clearCookie(res: VercelResponse, name: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  appendCookie(res, name + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" + secure);
}

export function getRedirectUri() {
  return process.env.SEARCH_CONSOLE_REDIRECT_URI || "https://mypakistantrips.com/api/search-console/callback";
}

export function requireGoogleConfig(res: VercelResponse): boolean {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ error: "Google Search Console is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Vercel Environment Variables." });
    return false;
  }
  return true;
}

export async function verifyCmsAdmin(req: VercelRequest): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseKey) return { ok: false, status: 401, error: "A valid admin session is required." };

  try {
    const userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: supabaseKey, Authorization: "Bearer " + token },
    });
    if (!userResponse.ok) return { ok: false, status: 401, error: "Your admin session is invalid or expired." };
    const user: any = await userResponse.json();
    if (!user?.id) return { ok: false, status: 401, error: "Could not verify your admin account." };
    const adminResponse = await fetch(
      supabaseUrl + "/rest/v1/tour_cms_admins?select=user_id&user_id=eq." + encodeURIComponent(user.id),
      { headers: { apikey: supabaseKey, Authorization: "Bearer " + token } },
    );
    if (!adminResponse.ok) return { ok: false, status: 403, error: "Could not verify CMS admin permissions." };
    const admins: any[] = await adminResponse.json();
    if (!admins.some(item => item.user_id === user.id)) return { ok: false, status: 403, error: "This account is not an authorized CMS admin." };
    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, status: 503, error: "Admin verification is temporarily unavailable." };
  }
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken?: string; error?: string }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data: any = await response.json();
  if (!response.ok || !data.access_token) return { error: data.error_description || data.error || "Google access token refresh failed." };
  return { accessToken: data.access_token };
}

export function makeOAuthState() {
  return randomBytes(32).toString("hex");
}

export function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function searchAnalytics(accessToken: string, siteUrl: string, startDate: string, endDate: string, dimensions: string[] = [], rowLimit = 10) {
  const url = "https://www.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query";
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, type: "web" }),
  });
  const data: any = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Google Search Console could not return analytics.");
  return Array.isArray(data.rows) ? data.rows : [];
}
