import type { ApiRequest, ApiResponse } from "../_lib/search-console.js";
import { getCookie, REFRESH_COOKIE, refreshGoogleAccessToken, verifyCmsAdmin, clearCookie } from "../_lib/search-console.js";

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "G-S2S70VQ1BF";

async function googleGet(url: string, accessToken: string) {
  const response = await fetch(url, { headers: { Authorization: "Bearer " + accessToken } });
  const data: any = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Google Analytics could not return data.");
  return data;
}

async function findPropertyId(accessToken: string): Promise<string> {
  if (process.env.GA4_PROPERTY_ID) return process.env.GA4_PROPERTY_ID.replace(/^properties\//, "");

  let pageToken = "";
  const summaries: any[] = [];
  do {
    const url = "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200" +
      (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const page = await googleGet(url, accessToken);
    summaries.push(...(page.accountSummaries || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  const properties = summaries.flatMap(account => account.propertySummaries || []);
  for (const property of properties) {
    const propertyId = String(property.property || "").replace(/^properties\//, "");
    if (!propertyId) continue;
    const streams = await googleGet(
      "https://analyticsadmin.googleapis.com/v1beta/properties/" + propertyId + "/dataStreams?pageSize=200",
      accessToken
    );
    const matched = (streams.dataStreams || []).some((stream: any) =>
      stream.webStreamData?.measurementId === MEASUREMENT_ID
    );
    if (matched) return propertyId;
  }
  throw new Error("No GA4 property was found for measurement ID " + MEASUREMENT_ID + ". Make sure the Google account has Viewer access to that Analytics property and the Google Analytics Admin API is enabled.");
}

async function runReport(accessToken: string, propertyId: string, body: Record<string, unknown>) {
  const response = await fetch(
    "https://analyticsdata.googleapis.com/v1beta/properties/" + propertyId + ":runReport",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data: any = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Google Analytics Data API request failed.");
  return data;
}

function value(row: any, index: number) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const admin = await verifyCmsAdmin(req);
  if (!admin.ok) return res.status(admin.status).json({ error: admin.error });

  const refreshToken = getCookie(req, REFRESH_COOKIE);
  if (!refreshToken) return res.status(401).json({ connected: false, error: "Connect your Google account to load GA4 reports." });
  const token = await refreshGoogleAccessToken(refreshToken);
  if (!token.accessToken) {
    if (token.error?.includes("invalid_grant")) clearCookie(res, REFRESH_COOKIE);
    return res.status(401).json({ connected: false, error: "Google authorization expired. Reconnect Google Analytics." });
  }

  const allowedDays = [7, 28, 90];
  const requestedRange = String(req.query.days || "28");
  const allTime = requestedRange === "all";
  const requestedDays = Number(requestedRange);
  const days = allTime ? "all" : (allowedDays.includes(requestedDays) ? requestedDays : 28);
  const dateRange = allTime
    ? [{ startDate: "2020-01-01", endDate: "yesterday" }]
    : [{ startDate: days + "daysAgo", endDate: "yesterday" }];
  const summaryDateRanges = allTime
    ? dateRange
    : [...dateRange, { startDate: (Number(days) * 2) + "daysAgo", endDate: (Number(days) + 1) + "daysAgo" }];

  try {
    const propertyId = await findPropertyId(token.accessToken);
    const [summary, devices, channels, events, pages] = await Promise.all([
      runReport(token.accessToken, propertyId, {
        dateRanges: summaryDateRanges,
        metrics: [{ name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "keyEvents" }],
      }),
      runReport(token.accessToken, propertyId, {
        dateRanges: dateRange,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        limit: 10,
      }),
      runReport(token.accessToken, propertyId, {
        dateRanges: [{ startDate: days + "daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        limit: 10,
      }),
      runReport(token.accessToken, propertyId, {
        dateRanges: [{ startDate: days + "daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "keyEvents" }],
        limit: 20,
      }),
      runReport(token.accessToken, propertyId, {
        dateRanges: [{ startDate: days + "daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
    ]);

    const current = allTime ? summary.rows?.[0] : (summary.rows?.find((row: any) => row.dimensionValues?.[0]?.value === "0") || summary.rows?.[0]);
    const previous = allTime ? undefined : (summary.rows?.find((row: any) => row.dimensionValues?.[0]?.value === "1") || summary.rows?.[1]);
    const metricSet = (row: any) => ({
      activeUsers: value(row, 0), newUsers: value(row, 1), sessions: value(row, 2),
      pageViews: value(row, 3), keyEvents: value(row, 4),
    });

    return res.status(200).json({
      connected: true,
      propertyId,
      measurementId: MEASUREMENT_ID,
      days,
      summary: metricSet(current),
      ...(previous ? { previous: metricSet(previous) } : {}),
      devices: (devices.rows || []).map((row: any) => ({
        device: row.dimensionValues?.[0]?.value || "Other",
        activeUsers: value(row, 0), sessions: value(row, 1),
      })),
      channels: (channels.rows || []).map((row: any) => ({
        channel: row.dimensionValues?.[0]?.value || "Other",
        sessions: value(row, 0), activeUsers: value(row, 1),
      })),
      events: (events.rows || []).map((row: any) => ({
        event: row.dimensionValues?.[0]?.value || "Other",
        count: value(row, 0), keyEvents: value(row, 1),
      })),
      pages: (pages.rows || []).map((row: any) => ({
        path: row.dimensionValues?.[0]?.value || "/",
        pageViews: value(row, 0), activeUsers: value(row, 1),
      })),
    });
  } catch (error: any) {
    console.error("GA4 report failed:", error?.message || error);
    return res.status(502).json({ connected: false, error: error?.message || "Could not load Google Analytics reports." });
  }
}
