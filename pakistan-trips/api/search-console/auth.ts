import type { ApiRequest, ApiResponse } from "../_lib/search-console";
import { makeOAuthState, requireGoogleConfig, SCOPES, setCookie, STATE_COOKIE, getRedirectUri, verifyCmsAdmin } from "../_lib/search-console";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const admin = await verifyCmsAdmin(req);
  if (!admin.ok) return res.status(admin.status).json({ error: admin.error });
  if (!requireGoogleConfig(res)) return;

  const state = makeOAuthState();
  setCookie(res, STATE_COOKIE, state, 600);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return res.status(200).json({ authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString() });
}
