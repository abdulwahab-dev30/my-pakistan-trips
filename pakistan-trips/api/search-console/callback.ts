import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearCookie, getCookie, getRedirectUri, REFRESH_COOKIE, STATE_COOKIE, setCookie } from "./_lib/search-console";

function back(res: VercelResponse, status: string) {
  return res.redirect(302, "/admin/dashboard?searchConsole=" + encodeURIComponent(status));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed.");
  }
  const query = req.query || {};
  const code = typeof query.code === "string" ? query.code : "";
  const state = typeof query.state === "string" ? query.state : "";
  const expectedState = getCookie(req, STATE_COOKIE);
  clearCookie(res, STATE_COOKIE);

  if (query.error) return back(res, "cancelled");
  if (!code || !state || !expectedState || state !== expectedState) return back(res, "invalid_state");
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return back(res, "not_configured");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      }),
    });
    const data: any = await response.json();
    if (!response.ok) {
      console.error("Search Console OAuth token exchange failed:", data?.error || "unknown_error");
      return back(res, "token_error");
    }
    if (!data.refresh_token) return back(res, "missing_refresh_token");
    setCookie(res, REFRESH_COOKIE, data.refresh_token, 60 * 60 * 24 * 180);
    return back(res, "connected");
  } catch (error) {
    console.error("Search Console OAuth callback failed:", error);
    return back(res, "token_error");
  }
}
