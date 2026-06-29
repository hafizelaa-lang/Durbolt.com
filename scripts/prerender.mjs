/**
 * Post-build pre-rendering: generates dist/products/{slug}/index.html and
 * dist/divisions/{slug}/index.html with correct <title>, <meta>, canonical,
 * OG tags, and a <noscript> H1/H2/H3 block so curl and non-JS crawlers see
 * the right content. React takes over client-side via the bundled scripts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

// ── Slug utility (mirrors src/utils/seo.js) ────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Load division data as JSON-compatible (strip function-generated img URLs) ─
// Import divisions.js which uses ES module syntax — works in Node ESM context
const { DIVISIONS } = await import("../src/data/divisions.js");
const { ARTICLES } = await import("../src/data/articles.js");

// ── Read base dist/index.html ──────────────────────────────────────────────
const baseHtml = readFileSync(join(DIST, "index.html"), "utf-8");

function escape(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function patchHtml(html, { title, description, ogTitle, ogDescription, canonical, noscriptBody, jsonLd }) {
  let out = html;

  // <title>
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);

  // <meta name="description">
  out = out.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escape(description)}$2`
  );

  // og:title
  out = out.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${escape(ogTitle || title)}$2`
  );

  // og:description
  out = out.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${escape(ogDescription || description)}$2`
  );

  // og:url
  out = out.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${escape(canonical)}$2`
  );

  // canonical
  out = out.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escape(canonical)}$2`
  );

  // Inject JSON-LD before </head>
  if (jsonLd) {
    out = out.replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`
    );
  }

  // Inject noscript block before </body> with H1/H2/H3 for non-JS crawlers
  if (noscriptBody) {
    out = out.replace(
      "</body>",
      `<noscript>${noscriptBody}</noscript>\n</body>`
    );
  }

  return out;
}

function writeRoute(relPath, html) {
  const dir = join(DIST, relPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`  ✓  /dist${relPath}/index.html`);
}

let count = 0;

// ── Division pages ─────────────────────────────────────────────────────────
for (const div of DIVISIONS) {
  const slug = toSlug(div.name);
  const canonical = `https://durbolt.com/divisions/${slug}`;
  const title = `${div.name} | Durbolt Power — B2B Critical Power Infrastructure`;
  const description = `${div.name} — ${div.tagline} ${div.products.length} product lines. B2B supplier USA. Factory-direct pricing. Industrial power infrastructure. Global fulfillment.`;

  const noscript = `<h1>${div.name}</h1><h2>${div.tagline}</h2><p>${div.description}</p>`;

  const html = patchHtml(baseHtml, { title, description, canonical, noscriptBody: noscript });
  writeRoute(`/divisions/${slug}`, html);
  count++;
}

// ── Solutions page ──────────────────────────────────────────────────────────
{
  const canonical = "https://durbolt.com/solutions";
  const title = "Turnkey Power Solutions | Durbolt Power — Data Center, Industrial & Grid-Scale Packages";
  const description = "Complete power infrastructure packages for data centers, industrial facilities, telecom, and grid-scale projects. Factory-direct pricing. 7 engineered bundles starting from $100K.";
  const noscript = `<h1>Turnkey Power Solutions</h1><h2>Engineered packages for the world's most demanding infrastructure projects</h2><p>7 pre-engineered bundle packages: AI Data Center, Critical Backup, Grid-Scale BESS Solar, Industrial Facility, Telecom 5G, Middle East Project, EV Charging Infrastructure. Factory-direct pricing from $100K.</p>`;
  const html = patchHtml(baseHtml, { title, description, canonical, noscriptBody: noscript });
  writeRoute("/solutions", html);
  count++;
}

// ── Product pages ───────────────────────────────────────────────────────────
for (const div of DIVISIONS) {
  for (const product of div.products) {
    const slug = toSlug(product.name);
    const canonical = `https://durbolt.com/products/${slug}`;
    const title = `${product.name} | Durbolt Power — B2B Critical Power Infrastructure`;
    const description = `${product.name} — ${product.spec}. B2B supplier USA. Industrial ${product.name.toLowerCase()} supplier with factory-direct pricing. Global fulfillment. Middle East supplier.`;

    const noscript = `<h1>${product.name}</h1><h2>${div.name}</h2><h3>${product.spec}</h3>`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.spec,
      "brand": { "@type": "Brand", "name": "Durbolt Power" },
      "manufacturer": { "@type": "Organization", "name": "Durbolt Power", "url": "https://durbolt.com" },
      "url": canonical,
      "audience": { "@type": "BusinessAudience", "audienceType": "B2B" }
    };

    const html = patchHtml(baseHtml, { title, description, canonical, noscriptBody: noscript, jsonLd });
    writeRoute(`/products/${slug}`, html);
    count++;
  }
}

// ── Blog index ──────────────────────────────────────────────────────────────
{
  const canonical = "https://durbolt.com/blog";
  const title = "Power Intelligence Hub | Durbolt Power — Critical Infrastructure Insights";
  const description = "Technical guides, buyer's guides, and market intelligence for critical power infrastructure professionals. Generators, BESS, switchgear, UPS, and more.";
  const noscript = `<h1>Power Intelligence Hub</h1><h2>Technical insights and market intelligence for critical infrastructure professionals</h2>`;
  const html = patchHtml(baseHtml, { title, description, canonical, noscriptBody: noscript });
  writeRoute("/blog", html);
  count++;
}

// ── Article pages ────────────────────────────────────────────────────────────
for (const article of ARTICLES) {
  const canonical = `https://durbolt.com/blog/${article.slug}`;
  const title = `${article.title} | Durbolt Power`;
  const description = article.excerpt || `${article.title} — Technical content from Durbolt Power's editorial team.`;
  const noscript = `<h1>${article.title}</h1><h2>${article.category}</h2><p>${article.excerpt || ""}</p>`;
  const html = patchHtml(baseHtml, { title, description, canonical, noscriptBody: noscript });
  writeRoute(`/blog/${article.slug}`, html);
  count++;
}

console.log(`\nPre-rendering complete: ${count} pages generated (${DIVISIONS.length} divisions + ${DIVISIONS.reduce((n, d) => n + d.products.length, 0)} products + ${ARTICLES.length} articles)\n`);
