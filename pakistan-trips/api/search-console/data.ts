import type { ApiRequest, ApiResponse } from "../_lib/search-console";
import { getCookie, REFRESH_COOKIE, refreshGoogleAccessToken, searchAnalytics, verifyCmsAdmin, clearCookie, dateString } from "../_lib/search-console";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const admin = await verifyCmsAdmin(req);
  if (!admin.ok) return res.status(admin.status).json({ error: admin.error });
  const refreshToken = getCookie(req, REFRESH_COOKIE);
  if (!refreshToken) return res.status(401).json({ connected: false, error: "Connect a Google account to load Search Console data." });

  const token = await refreshGoogleAccessToken(refreshToken);
  if (!token.accessToken) {
    if (token.error?.includes("invalid_grant")) clearCookie(res, REFRESH_COOKIE);
    return res.status(401).json({ connected: false, error: "Google authorization expired. Please reconnect Search Console." });
  }

  try {
    const sitesResponse = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: "Bearer " + token.accessToken },
    });
    const sitesData: any = await sitesResponse.json();
    if (!sitesResponse.ok) throw new Error(sitesData?.error?.message || "Could not load your Search Console properties.");
    const sites: any[] = Array.isArray(sitesData.siteEntry) ? sitesData.siteEntry : [];
    if (!sites.length) return res.status(200).json({ connected: true, properties: [], error: "This Google account has no Search Console properties with access." });

    const requested = typeof req.query.siteUrl === "string" ? req.query.siteUrl : "";
    const preferred = process.env.SEARCH_CONSOLE_SITE_URL || "";
    const siteUrl = requested || (preferred && sites.some(site => site.siteUrl === preferred) ? preferred : "") ||
      (sites.find(site => site.siteUrl === "sc-domain:mypakistantrips.com")?.siteUrl) ||
      (sites.find(site => site.siteUrl === "https://mypakistantrips.com/")?.siteUrl) ||
      sites[0].siteUrl;
    if (!sites.some(site => site.siteUrl === siteUrl)) return res.status(403).json({ error: "That Search Console property is not available to this Google account." });

    const today = new Date();
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 3));
    const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
    const previousEnd = new Date(start); previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
    const previousStart = new Date(previousEnd); previousStart.setUTCDate(previousStart.getUTCDate() - 27);
    const startDate = dateString(start);
    const endDate = dateString(end);
    const previousStartDate = dateString(previousStart);
    const previousEndDate = dateString(previousEnd);

    const [summaryRows, previousRows, daily, queries, pages] = await Promise.all([
      searchAnalytics(token.accessToken, siteUrl, startDate, endDate, [], 1),
      searchAnalytics(token.accessToken, siteUrl, previousStartDate, previousEndDate, [], 1),
      searchAnalytics(token.accessToken, siteUrl, startDate, endDate, ["date"], 28),
      searchAnalytics(token.accessToken, siteUrl, startDate, endDate, ["query"], 10),
      searchAnalytics(token.accessToken, siteUrl, startDate, endDate, ["page"], 10),
    ]);
    const metrics = (row: any = {}) => ({
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    });
    return res.status(200).json({
      connected: true,
      properties: sites.map(site => ({ siteUrl: site.siteUrl, permissionLevel: site.permissionLevel })),
      siteUrl,
      period: { startDate, endDate, previousStartDate, previousEndDate },
      summary: metrics(summaryRows[0]),
      previous: metrics(previousRows[0]),
      daily: daily.map((row: any) => ({ date: row.keys?.[0], ...metrics(row) })),
      topQueries: queries.map((row: any) => ({ query: row.keys?.[0], ...metrics(row) })),
      topPages: pages.map((row: any) => ({ page: row.keys?.[0], ...metrics(row) })),
    });
  } catch (error: any) {
    console.error("Search Console data request failed:", error?.message || error);
    return res.status(502).json({ error: error?.message || "Could not load Search Console data." });
  }
}
