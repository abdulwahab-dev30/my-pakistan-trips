import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearCookie, REFRESH_COOKIE, verifyCmsAdmin } from "../_lib/search-console";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const admin = await verifyCmsAdmin(req);
  if (!admin.ok) return res.status(admin.status).json({ error: admin.error });
  clearCookie(res, REFRESH_COOKIE);
  return res.status(200).json({ connected: false });
}
