import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tours } from "../src/data/tours.js";

const dist = join(process.cwd(), "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const site = "https://mypakistantrips.com";
const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

function withSeo(html, title, description, canonical, image = "") {
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:type" content="website"><meta property="og:site_name" content="My Pakistan Trips">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:image" content="${escapeHtml(image)}">` : ""
  ].join("");
  return html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`).replace("</head>", `${tags}</head>`);
}

function saveRoute(route, html) {
  const folder = join(dist, route);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "index.html"), html);
}

const listingDescription = "Explore tour packages across Pakistan's northern areas, including Naran, Hunza, Skardu, Kumrat, Neelum Valley, Astore and Swat.";
const cards = tours.map(t => `<article><h2><a href="/tours/${encodeURIComponent(t.slug)}">${escapeHtml(t.h1 || t.title)}</a></h2><p>${escapeHtml(t.metaDescription || t.overview || "")}</p><p>${escapeHtml(t.duration || "")}</p></article>`).join("");
const listing = `<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / Tours</nav><header><h1>Pakistan Tour Packages</h1><p>${escapeHtml(listingDescription)}</p></header><section>${cards}</section></main>`;
saveRoute("tours", withSeo(template.replace('<div id="root"></div>', `<div id="root">${listing}</div>`), "Pakistan Tour Packages | My Pakistan Trips", listingDescription, site + "/tours"));

for (const tour of tours) {
  const canonical = `${site}/tours/${encodeURIComponent(tour.slug)}`;
  const title = tour.seoTitle || `${tour.title} | My Pakistan Trips`;
  const description = tour.metaDescription || tour.overview || `Explore the ${tour.title} with My Pakistan Trips.`;
  const image = (tour.images || []).find(x => x.src && !x.src.includes("placehold.co") && !x.src.includes("unsplash.com"))?.src || "";
  const itinerary = (tour.itinerary || []).map((day, i) => `<li><h2>${escapeHtml(day.title || day.day || `Day ${i + 1}`)}</h2><p>${escapeHtml(day.description || "")}</p></li>`).join("");
  const attractions = (tour.mainAttractions || []).map(x => `<li>${escapeHtml(x)}</li>`).join("");
  const price = typeof tour.price === "number" ? `<p>Starting from PKR ${tour.price.toLocaleString("en-PK")} per person</p>` : "";
  const body = `<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/tours">Tours</a> / ${escapeHtml(tour.title)}</nav><article><header><h1>${escapeHtml(tour.h1 || tour.title)}</h1><p>${escapeHtml(tour.duration || "")}</p><p>${escapeHtml(tour.overview || description)}</p>${price}</header><section><h2>Tour itinerary</h2><ol>${itinerary}</ol></section><section><h2>Main attractions</h2><ul>${attractions}</ul></section><p><a href="/tours">Explore more Pakistan tours</a></p></article></main>`;
  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "TouristTrip", name: tour.title, description, url: canonical }).replaceAll("<", "\\u003c");
  let html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  html = withSeo(html, title, description, canonical, image).replace("</head>", `<script type="application/ld+json">${schema}</script></head>`);
  saveRoute(`tours/${tour.slug}`, html);
}
console.log(`Generated static SEO HTML for /tours and ${tours.length} local tour pages.`);
