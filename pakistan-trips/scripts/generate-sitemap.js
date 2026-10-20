import { writeFileSync } from "node:fs";
import { tours as localTours } from "../src/data/tours.js";

const site = "https://mypakistantrips.com";
const lastmod = new Date().toISOString().slice(0, 10);

async function getPublishedCmsSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase env vars are missing; sitemap will include local tours only.");
    return [];
  }

  try {
    const endpoint = new URL("/rest/v1/tours", url);
    endpoint.searchParams.set("select", "slug,published");
    endpoint.searchParams.set("published", "eq.true");
    endpoint.searchParams.set("slug", "not.is.null");

    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase returned HTTP ${response.status}`);
    }

    const rows = await response.json();
    return rows
      .map((row) => row.slug)
      .filter((slug) => typeof slug === "string" && slug.trim());
  } catch (error) {
    console.warn(
      "Could not load published CMS tours for sitemap; using local tours only:",
      error.message,
    );
    return [];
  }
}

const cmsSlugs = await getPublishedCmsSlugs();
const slugs = new Set([
  ...localTours.map((tour) => tour.slug),
  ...cmsSlugs,
].filter((slug) => typeof slug === "string" && slug.trim()));

const routes = ["/", "/tours", "/international-tours", ...[...slugs].map((slug) => `/tours/${slug}`)];
const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map(
      (route) =>
        `  <url>\n    <loc>${escapeXml(site + route)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join("\n") +
  "\n</urlset>\n";

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`Generated sitemap.xml with ${routes.length} URLs.`);