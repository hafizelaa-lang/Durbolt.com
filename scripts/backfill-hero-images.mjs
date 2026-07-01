/**
 * Standalone hero image backfill for durbolt articles.
 * Does NOT require DURBOLT_BLOG_LLM_KEY.
 *
 * Usage:
 *   node scripts/backfill-hero-images.mjs           (preview — print new URLs, no write)
 *   node scripts/backfill-hero-images.mjs --apply   (preview + write to articles.js)
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ARTICLES_PATH = join(ROOT, "src/data/articles.js");
const APPLY = process.argv.includes("--apply");

// ── Image API credentials (same as generate-articles.mjs) ─────────────────

const UNSPLASH_KEY   = "dRMhHRImxLn3Ut7Nt6HfOooq4dEurw4HuwI93ipa5zY";
const PEXELS_KEY     = "disPnWUjrXUaD0SXxDqvHWbbbl1FBNfyBJWiGM11jbyYi1auCv3hxT6t";
const PIXABAY_KEY    = "55665226-135b23f5f3f26f4a07ae93fc5";

// ── Keyword mapping (identical to generate-articles.mjs) ──────────────────

const KEYWORD_MAP = [
  { terms: ["load bank", "load test", "load testing"], keyword: "electrical load testing industrial" },
  { terms: ["surge protection", "surge protective", "spd", "lightning protection", "overvoltage"], keyword: "lightning surge electrical protection" },
  { terms: ["exhaust", "muffler", "silencer", "noise attenuation", "flue"], keyword: "industrial exhaust chimney stack" },
  { terms: ["enclosure", "ip65", "nema 4x", "weatherproof", "ip rating", "nema rating"], keyword: "weatherproof industrial enclosure outdoor" },
  { terms: ["ddp", "delivered duty paid", "incoterm", "shipping industrial", "freight forwarding"], keyword: "cargo ship port industrial logistics" },
  { terms: ["ats", "automatic transfer switch", "transfer switch", "transfer switching"], keyword: "automatic transfer switch electrical panel" },
  { terms: ["hyperscale", "medium voltage switchgear", "mv distribution", "33kv", "11kv"], keyword: "hyperscale data center power distribution" },
  { terms: ["bess vs ups", "bess and ups", "ups system", "uninterruptible power"], keyword: "battery ups critical power facility" },
  { terms: ["uae", "dubai", "abu dhabi", "dewa", "regional", "middle east data center"], keyword: "dubai data center aerial night" },
  { terms: ["off-grid", "hybrid generator", "hybrid power", "hybrid system"], keyword: "solar hybrid power plant off grid" },
  { terms: ["generator", "diesel", "natural gas", "genset", "backup power"], keyword: "diesel generator power plant" },
  { terms: ["switchgear", "iec 61439", "certification", "iec certification", "lv switchgear"], keyword: "electrical switchgear substation" },
  { terms: ["battery", "lfp", "nmc", "lithium", "chemistry", "bess", "battery storage", "battery energy"], keyword: "lithium battery energy storage technology" },
  { terms: ["data center", "cooling", "precision", "chiller", "server"], keyword: "data center power infrastructure" },
  { terms: ["solar", "microgrid", "grid-scale", "grid modernization", "power factor"], keyword: "solar farm energy storage facility" },
  { terms: ["cable", "fiber", "connectivity", "conductor", "busbar", "busway", "busduct", "armored"], keyword: "industrial cable infrastructure" },
  { terms: ["switchgear", "transformer", "distribution", "substation", "medium voltage"], keyword: "electrical substation infrastructure" },
  { terms: ["grid", "utility", "power grid"], keyword: "power grid utility aerial" },
];

const POLLINATIONS_PROMPTS = {
  "industrial exhaust chimney stack": "wide cinematic view of industrial facility with tall exhaust stacks and chimney infrastructure at dusk, dramatic sky, no people no text no logos",
  "weatherproof industrial enclosure outdoor": "cinematic wide view of industrial equipment enclosures mounted outdoors in harsh environment, dramatic lighting, no people no text no logos",
  "solar hybrid power plant off grid": "wide cinematic aerial view of off-grid hybrid solar and generator power plant in remote landscape, golden hour, no people no text no logos",
  "diesel generator power plant": "wide cinematic aerial view of diesel power generation plant with large generator halls at dusk, dramatic industrial sky, no people no text no logos",
  "electrical load testing industrial": "cinematic wide view of industrial electrical testing facility interior with high-voltage equipment bays, dramatic lighting, no people no text no logos",
  "lightning surge electrical protection": "dramatic cinematic shot of lightning storm over high voltage electrical transmission infrastructure at night, long exposure, no people no text no logos",
  "electrical switchgear substation": "aerial cinematic view of electrical switchgear substation with rows of high voltage equipment, open landscape, dramatic sky, no people no text no logos",
  "lithium battery energy storage technology": "wide cinematic aerial view of large-scale battery energy storage facility with rows of containers in open landscape, golden hour, no people no text no logos",
  "dubai data center aerial night": "cinematic aerial view of modern data center campus in desert landscape at night with dramatic lighting, no people no text no logos",
  "automatic transfer switch electrical panel": "cinematic view of modern electrical power distribution room with switchgear panels and cable management, dramatic industrial lighting, no people no text no logos",
  "battery ups critical power facility": "wide cinematic view of critical power facility interior with UPS banks and battery cabinets, dramatic industrial lighting, no people no text no logos",
  "cargo ship port industrial logistics": "wide cinematic aerial view of industrial cargo port with container ships and cranes at golden hour, no people no text no logos",
  "hyperscale data center power distribution": "cinematic aerial view of massive hyperscale data center campus with power infrastructure and cooling towers, dramatic sky, no people no text no logos",
  "solar farm energy storage facility": "wide cinematic aerial view of vast solar farm with battery storage containers in desert landscape, golden hour lighting, photorealistic, no people no text no logos",
  "electrical substation infrastructure": "aerial cinematic view of electrical substation and high voltage power grid in open landscape, dramatic sky, no people no text no logos",
  "data center power infrastructure": "wide cinematic aerial view of modern data center campus at night with dramatic lighting and landscaped grounds, no people no text no logos",
  "industrial cable infrastructure": "cinematic wide angle view of large industrial facility exterior with aerial perspective, moody atmospheric lighting, no people no text no logos",
  "power grid utility aerial": "aerial cinematic view of power grid transmission lines crossing open landscape at golden hour, dramatic sky, photorealistic, no people no text no logos",
  "industrial power facility landscape": "wide cinematic aerial view of industrial power generation facility at dusk, dramatic sky, power lines, landscape photography, no people no text no logos",
};

function getSearchKeyword(title, excerpt) {
  const combined = `${title} ${excerpt}`.toLowerCase();
  for (const { terms, keyword } of KEYWORD_MAP) {
    if (terms.some((t) => combined.includes(t))) return keyword;
  }
  return "industrial power facility landscape";
}

function slugSeed(slug) {
  let hash = 0;
  for (const c of slug) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  return Math.abs(hash) % 99999;
}

async function tryUnsplash(keyword, idx) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=10&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results ?? [];
    if (!results.length) return null;
    return results[idx % results.length]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function tryPexels(keyword, idx) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=10`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data?.photos ?? [];
    if (!photos.length) return null;
    return photos[idx % photos.length]?.src?.large ?? null;
  } catch {
    return null;
  }
}

async function tryPixabay(keyword, idx) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=horizontal&category=industry&per_page=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = data?.hits ?? [];
    if (!hits.length) return null;
    return hits[idx % hits.length]?.largeImageURL ?? null;
  } catch {
    return null;
  }
}

function pollinationsFallback(keyword, slug) {
  const prompt = POLLINATIONS_PROMPTS[keyword]
    ?? `wide cinematic aerial landscape view of ${keyword}, dramatic lighting, photorealistic, no people no text no logos`;
  const seed = slugSeed(slug);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&model=flux&nologo=true&seed=${seed}`;
}

async function getHeroImage(title, excerpt, slug) {
  const keyword = getSearchKeyword(title, excerpt);
  const idx = slugSeed(slug) % 10;

  const unsplash = await tryUnsplash(keyword, idx);
  if (unsplash) {
    return { url: unsplash, source: `Unsplash`, keyword };
  }

  const pexels = await tryPexels(keyword, idx);
  if (pexels) {
    return { url: pexels, source: `Pexels`, keyword };
  }

  const pixabay = await tryPixabay(keyword, idx);
  if (pixabay) {
    return { url: pixabay, source: `Pixabay`, keyword };
  }

  return { url: pollinationsFallback(keyword, slug), source: `Pollinations`, keyword };
}

// ── Read / write articles ──────────────────────────────────────────────────

function readArticles() {
  const content = readFileSync(ARTICLES_PATH, "utf-8");
  const prefix = "export const ARTICLES = ";
  const startIdx = content.indexOf(prefix);
  const jsonStr = content.slice(startIdx + prefix.length).replace(/;\s*$/, "").trim();
  return JSON.parse(jsonStr);
}

function writeArticles(articles) {
  const content = `// Auto-generated by scripts/generate-articles.mjs — do not edit manually\nexport const ARTICLES = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(ARTICLES_PATH, content, "utf-8");
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const articles = readArticles();
  console.log(`\nFetching hero images for ${articles.length} articles...\n`);
  console.log(`${"Slug".padEnd(58)} ${"Source".padEnd(12)} Keyword → URL`);
  console.log("─".repeat(140));

  const results = [];
  for (const article of articles) {
    const { url, source, keyword } = await getHeroImage(article.title, article.excerpt, article.slug);
    results.push({ slug: article.slug, oldUrl: article.heroImg, newUrl: url, source, keyword });
    const changed = url !== article.heroImg ? " *" : "  ";
    console.log(`${changed} ${article.slug.padEnd(56)} ${source.padEnd(12)} [${keyword}]`);
    console.log(`     → ${url}`);
  }

  const changed = results.filter((r) => r.newUrl !== r.oldUrl).length;
  console.log(`\n${"─".repeat(140)}`);
  console.log(`Images that would change: ${changed} / ${articles.length}`);

  if (APPLY) {
    for (const r of results) {
      const a = articles.find((a) => a.slug === r.slug);
      if (a) a.heroImg = r.newUrl;
    }
    writeArticles(articles);
    console.log(`\n✅ Written to ${ARTICLES_PATH}\n`);
  } else {
    console.log(`\n(Preview only — run with --apply to write changes)\n`);
  }

  // Output machine-readable JSON summary for easy review
  console.log("\n=== JSON PREVIEW ===");
  console.log(JSON.stringify(results.map((r) => ({ slug: r.slug, source: r.source, url: r.newUrl })), null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
