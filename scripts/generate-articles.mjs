/**
 * Durbolt Power — AI Article Generator
 * Usage:
 *   node scripts/generate-articles.mjs --generate-all     (generates all 8 initial articles)
 *   node scripts/generate-articles.mjs                    (generates 4 articles from CONTENT_QUEUE)
 *   node scripts/generate-articles.mjs --backfill-images  (re-runs image waterfall on all existing articles)
 *
 * Uses Groq llama-3.3-70b-versatile (DURBOLT_BLOG_LLM_KEY) for content generation — Durbolt-only key.
 * Uses Unsplash → Pexels → Pixabay → Pollinations waterfall for hero images.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ARTICLES_PATH = join(ROOT, "src/data/articles.js");

const DURBOLT_BLOG_LLM_KEY = process.env.DURBOLT_BLOG_LLM_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

if (!DURBOLT_BLOG_LLM_KEY) {
  console.error("Error: DURBOLT_BLOG_LLM_KEY is not set in environment.");
  console.error("Add it to /root/durbolt/.env — get a Groq key at console.groq.com");
  process.exit(1);
}

// Print masked key confirmation at startup
const maskedKey = "..." + DURBOLT_BLOG_LLM_KEY.slice(-4);
console.log(`[DURBOLT BLOG] Groq key loaded: ${maskedKey}`);

const GENERATE_ALL = process.argv.includes("--generate-all");
const SKIP_BUILD = process.argv.includes("--skip-build");
const BACKFILL_IMAGES = process.argv.includes("--backfill-images");

const UNIVERSAL_HERO_IMG = 'https://i.ibb.co/rRGWng3L/A8-C483-DD-2-D55-4441-93-DB-BDB6-E933-D669.png';

// ── KEYWORD MAPPING ────────────────────────────────────────────────────────

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

function getSearchKeyword(title, topic) {
  const combined = `${title} ${topic}`.toLowerCase();
  for (const { terms, keyword } of KEYWORD_MAP) {
    if (terms.some((t) => combined.includes(t.toLowerCase()))) return keyword;
  }
  return "industrial power facility landscape";
}

// ── IMAGE WATERFALL ────────────────────────────────────────────────────────

async function tryUnsplash(keyword, idx) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=10&client_id=dRMhHRImxLn3Ut7Nt6HfOooq4dEurw4HuwI93ipa5zY`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results ?? [];
    return results[idx % results.length]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function tryPexels(keyword, idx) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=10`;
    const res = await fetch(url, {
      headers: { Authorization: "disPnWUjrXUaD0SXxDqvHWbbbl1FBNfyBJWiGM11jbyYi1auCv3hxT6t" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data?.photos ?? [];
    return photos[idx % photos.length]?.src?.large ?? null;
  } catch {
    return null;
  }
}

async function tryPixabay(keyword, idx) {
  try {
    const url = `https://pixabay.com/api/?key=55665226-135b23f5f3f26f4a07ae93fc5&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=horizontal&category=industry&per_page=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = data?.hits ?? [];
    return hits[idx % hits.length]?.largeImageURL ?? null;
  } catch {
    return null;
  }
}

// Pollinations fallback — wide cinematic landscapes only, no close-up equipment
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

function pollinationsFallback(keyword, slug) {
  const prompt = POLLINATIONS_PROMPTS[keyword]
    ?? `wide cinematic aerial landscape view of ${keyword}, dramatic lighting, photorealistic, no people no text no logos`;
  const seed = slugSeed(slug);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&model=flux&nologo=true&seed=${seed}`;
}

async function getArticleHeroImage(articleTitle, articleTopic, slug) {
  const keyword = getSearchKeyword(articleTitle, articleTopic);
  // Deterministic per-slug offset so same-keyword articles pick different photos
  const idx = slugSeed(slug) % 10;

  const unsplash = await tryUnsplash(keyword, idx);
  if (unsplash) {
    console.log(`  [IMAGE SOURCE: Unsplash idx=${idx}] keyword="${keyword}"`);
    return unsplash;
  }

  const pexels = await tryPexels(keyword, idx);
  if (pexels) {
    console.log(`  [IMAGE SOURCE: Pexels idx=${idx}] keyword="${keyword}"`);
    return pexels;
  }

  const pixabay = await tryPixabay(keyword, idx);
  if (pixabay) {
    console.log(`  [IMAGE SOURCE: Pixabay idx=${idx}] keyword="${keyword}"`);
    return pixabay;
  }

  console.log(`  [IMAGE SOURCE: Pollinations] keyword="${keyword}"`);
  return pollinationsFallback(keyword, slug);
}

// ── UTILITIES ──────────────────────────────────────────────────────────────

// Deterministic seed from slug so Pollinations URLs are stable across re-runs
function slugSeed(slug) {
  let hash = 0;
  for (const c of slug) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  return Math.abs(hash) % 99999;
}

function readExistingArticles() {
  try {
    const content = readFileSync(ARTICLES_PATH, "utf-8");
    const prefix = "export const ARTICLES = ";
    const startIdx = content.indexOf(prefix);
    if (startIdx === -1) return [];
    // Take everything after the prefix, strip the trailing ; and whitespace
    const jsonStr = content.slice(startIdx + prefix.length).replace(/;\s*$/, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

function writeArticles(articles) {
  const content = `// Auto-generated by scripts/generate-articles.mjs — do not edit manually\nexport const ARTICLES = ${JSON.stringify(articles, null, 2)};\n`;
  writeFileSync(ARTICLES_PATH, content, "utf-8");
}

const SYSTEM_PROMPT = `You are the head of technical content for Durbolt Power, competing with ABB, Eaton, and Schneider Electric. Write for facility managers, EPC contractors, data center operators, and procurement directors. Tone: authoritative, precise, technical but accessible. Cite IEC, UL, NEMA, IEEE, ANSI standards. Minimum 1,200 words total across all sections. Return JSON only with no markdown code fences: { "title": "", "excerpt": "", "sections": [{ "heading": "", "body": "", "type": "paragraph|pullquote|specbox|callout|bulletlist" }], "pullQuotes": ["", ""], "specTable": { "headers": [], "rows": [[]] } or null, "relatedProductNames": [] }`;

async function callGroq(topic) {
  const body = JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: topic },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DURBOLT_BLOG_LLM_KEY}`,
    },
    body,
  });

  if (res.status === 429) {
    console.log("  [DURBOLT BLOG: Groq quota hit — retry in 60s]");
    await new Promise((r) => setTimeout(r, 60000));
    const retry = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DURBOLT_BLOG_LLM_KEY}`,
      },
      body,
    });
    if (!retry.ok) {
      const retryText = await retry.text();
      throw new Error(`Groq API error ${retry.status}: ${retryText.slice(0, 300)}`);
    }
    return retry;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 300)}`);
  }

  return res;
}

async function generateArticleContent(topic) {
  const response = await callGroq(topic);
  const data = await response.json();
  let rawContent = data.choices?.[0]?.message?.content ?? "";
  // Strip any accidental markdown fences
  rawContent = rawContent.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  return JSON.parse(rawContent);
}

// 8 initial articles
const INITIAL_ARTICLES = [
  {
    slug: "diesel-generator-vs-bess-backup-power-2025",
    category: "BUYER'S GUIDE",
    readTime: 9,
    topic: "Write a comprehensive buyer's guide comparing Diesel Generators vs Battery Energy Storage Systems (BESS) for backup power in 2025. Cover: total cost of ownership (TCO) analysis, runtime capability, maintenance requirements, response time, environmental impact, and which solution wins for data centers, hospitals, telecom infrastructure, and industrial facilities. Include specific kWh costs, capital expenditure comparisons, and a recommendation matrix. Use section types: paragraph, callout, specbox, bulletlist, pullquote. Include a specTable comparing key metrics. relatedProductNames must be from: Industrial Generator Sets, Battery Energy Storage (BESS), Load Banks.",
    relatedProductNames: ["Industrial Generator Sets", "Battery Energy Storage (BESS)", "Load Banks"],
  },
  {
    slug: "iec-61439-switchgear-certification-complete-guide",
    category: "TECHNICAL",
    readTime: 7,
    topic: "Write a comprehensive technical guide to IEC 61439 switchgear certification. Cover: what the standard covers (LV switchgear and controlgear assemblies), testing requirements (form separation, type testing vs. partial type testing), how to verify compliance when sourcing from OEM suppliers, documentation to demand, and critical red flags that indicate non-compliant equipment. Include specific clause references (IEC 61439-1, -2). Use callout boxes for red flags and standards references. Include a specTable of key IEC 61439 tests and requirements. relatedProductNames must include: Modular Electrical Switchgear, Motor Control Centers (MCC), Medium Voltage Transformers.",
    relatedProductNames: ["Modular Electrical Switchgear", "Motor Control Centers (MCC)", "Medium Voltage Transformers"],
  },
  {
    slug: "lfp-vs-nmc-battery-chemistry-commercial-bess",
    category: "TECHNICAL",
    readTime: 8,
    topic: "Write a deep technical comparison of LFP (Lithium Iron Phosphate) vs NMC (Nickel Manganese Cobalt) battery chemistry for commercial BESS applications. Cover: cycle life (LFP 3,000-6,000 cycles vs NMC 1,500-2,000), thermal runaway risk and safety implications (reference UL 9540A), energy density tradeoffs (Wh/kg), cost per kWh at scale, temperature performance, calendar aging, BMS requirements, and why LFP has become the dominant chemistry for commercial and grid-scale BESS. Include a specTable comparing key chemistry parameters. relatedProductNames must include: Battery Energy Storage (BESS), Lithium Battery Modules, Containerized Grid-Scale BESS.",
    relatedProductNames: ["Battery Energy Storage (BESS)", "Lithium Battery Modules", "Containerized Grid-Scale BESS"],
  },
  {
    slug: "uae-data-center-critical-power-infrastructure-2025",
    category: "REGIONAL",
    readTime: 10,
    topic: "Write a market intelligence article on critical power infrastructure requirements for UAE data centers in 2025. Cover: DEWA grid connection requirements and utility coordination process, power density challenges in desert climate (45°C+ ambient affecting cooling load), ESMA import certification and IEC conformance requirements, why DDP (Delivered Duty Paid) Incoterm is essential for UAE procurement, key data center developments (G42, Moro Hub, ADNOC, global hyperscalers), estimated market size and growth, and procurement recommendations for EPC contractors specifying generators, switchgear, and cooling. Include a callout on ESMA certification and a specTable of UAE climate derating factors. relatedProductNames must include: Industrial Generator Sets, Modular Electrical Switchgear, Precision Air Conditioning.",
    relatedProductNames: ["Industrial Generator Sets", "Modular Electrical Switchgear", "Precision Air Conditioning"],
  },
  {
    slug: "how-to-size-automatic-transfer-switch",
    category: "BUYER'S GUIDE",
    readTime: 8,
    topic: "Write a practical buyer's guide for sizing an Automatic Transfer Switch (ATS) in exactly 6 numbered steps: 1) Calculate total connected load in amps, 2) Determine service entrance ampacity and voltage, 3) Select transition type (open vs closed), 4) Choose NEMA enclosure rating, 5) Specify control and communications features, 6) Prepare RFQ documentation. Also cover: UL 1008 requirements, IEC 60947-6-1 standard, common sizing mistakes (undersizing neutral, ignoring future load growth), when to oversize, and what information to include in an RFQ (single line diagram, load schedule, fault current rating). Include a specTable of ATS current ratings vs applications and a callout on UL 1008 testing requirements. relatedProductNames must include: Automatic Transfer Switches, Manual Transfer Switches, Industrial Generator Sets.",
    relatedProductNames: ["Automatic Transfer Switches", "Manual Transfer Switches", "Industrial Generator Sets"],
  },
  {
    slug: "medium-voltage-switchgear-hyperscale-data-centers",
    category: "MARKET INTELLIGENCE",
    readTime: 9,
    topic: "Write a market intelligence analysis of medium voltage switchgear demand driven by hyperscale data centers and AI infrastructure. Cover: how AI GPU clusters are driving power density from 5kW/rack to 50-100kW+/rack, why hyperscalers are moving 33kV/11kV MV distribution deeper into facilities, typical project values ($10M-$50M+ for major MV switchgear deployments), current lead times crisis (18-36 months for custom MV gear from ABB, Eaton, Schneider), how AWS, Microsoft, Google, Meta specify MV infrastructure (ANSI/IEEE C37 standards), procurement strategies including dual-sourcing from certified OEM manufacturers. Include a specTable of hyperscale power density progression and a pullquote about AI driving infrastructure transformation. relatedProductNames must include: Modular Electrical Switchgear, Medium Voltage Transformers, Busway & Busduct Systems.",
    relatedProductNames: ["Modular Electrical Switchgear", "Medium Voltage Transformers", "Busway & Busduct Systems"],
  },
  {
    slug: "bess-vs-ups-critical-infrastructure-comparison",
    category: "BUYER'S GUIDE",
    readTime: 8,
    topic: "Write a buyer's guide comparing BESS vs UPS for critical infrastructure applications. Cover: response time difference (UPS <4ms IEEE 1100, BESS 100-300ms), runtime capability (UPS: 5-30 minutes, BESS: 2-8 hours), capital cost per kWh, ideal applications for each (UPS for data center IT equipment, BESS for facility-level backup), hybrid architectures combining UPS for instant protection and BESS for extended runtime, maintenance comparison (VRLA vs LFP batteries), IEEE 1188, IEC 62040 standards. Include a decision matrix table as specTable showing which to choose for hospitals, data centers, telecom, and industrial plants. relatedProductNames must include: Battery Energy Storage (BESS), Industrial UPS Systems, Automatic Transfer Switches.",
    relatedProductNames: ["Battery Energy Storage (BESS)", "Industrial UPS Systems", "Automatic Transfer Switches"],
  },
  {
    slug: "ddp-shipping-industrial-equipment-b2b-guide",
    category: "BUYER'S GUIDE",
    readTime: 6,
    topic: "Write a complete guide to DDP (Delivered Duty Paid) shipping for high-value industrial equipment. Cover: exact legal definition of DDP under Incoterms 2020 (seller bears all risk, cost, and customs duties to named place of destination), comparison vs FOB (risk transfers at origin port, buyer pays freight and import duties), CIF (risk transfers at destination port but buyer pays import duties — a common trap), why DDP is the only acceptable Incoterm for critical power equipment above $50K (avoid hidden duty surprises, customs delays that derail project timelines, damage claims disputes), how to negotiate DDP terms with Chinese manufacturers, key contract clauses to include, and red flags when a supplier refuses DDP. Include a specTable comparing Incoterms 2020 risk/cost split and a callout on common DDP vs CIF confusion traps. relatedProductNames must include: Industrial Generator Sets, Containerized Grid-Scale BESS, Modular Electrical Switchgear.",
    relatedProductNames: ["Industrial Generator Sets", "Containerized Grid-Scale BESS", "Modular Electrical Switchgear"],
  },
];

// 40-topic queue for automated weekly pipeline
const CONTENT_QUEUE = [
  { slug: "diesel-vs-natural-gas-generator-comparison", topic: "Diesel vs Natural Gas Generators for Industrial Facilities: Cost, Emissions, and Performance Comparison", category: "BUYER'S GUIDE" },
  { slug: "generator-load-bank-testing-procedures", topic: "Generator Load Bank Testing: Complete Procedures, Standards, and Why It's Non-Negotiable for Critical Facilities", category: "TECHNICAL" },
  { slug: "weatherproof-enclosure-ratings-ip65-nema-4x", topic: "IP65 vs NEMA 4X Enclosures: Understanding Weatherproof Ratings for Critical Power Equipment", category: "TECHNICAL" },
  { slug: "surge-protection-critical-power-infrastructure", topic: "Surge Protection Devices for Critical Power Infrastructure: Selection Guide and Installation Standards", category: "TECHNICAL" },
  { slug: "hybrid-generator-bess-off-grid-industrial", topic: "Hybrid Generator + BESS Systems for Off-Grid Industrial Sites: Design Guide and Economics", category: "BUYER'S GUIDE" },
  { slug: "auto-voltage-regulator-vs-ups", topic: "Auto Voltage Regulators vs UPS Systems: Which Does Your Facility Actually Need?", category: "BUYER'S GUIDE" },
  { slug: "industrial-exhaust-systems-generator-sets", topic: "Industrial Exhaust Systems for Generator Sets: Specification Guide and Noise Attenuation Standards", category: "TECHNICAL" },
  { slug: "telecom-tower-battery-backup-power", topic: "Battery Backup Power for Telecom Towers and 5G Infrastructure: LFP vs VRLA and Design Considerations", category: "TECHNICAL" },
  { slug: "grid-scale-bess-project-development", topic: "Grid-Scale BESS Project Development: Timeline, Costs, Permitting, and Procurement Guide", category: "MARKET INTELLIGENCE" },
  { slug: "evaluate-chinese-bess-manufacturer", topic: "How to Evaluate a Chinese BESS Manufacturer Before Ordering: Factory Audit Checklist and Red Flags", category: "BUYER'S GUIDE" },
  { slug: "bess-fire-suppression-systems", topic: "Fire Suppression Systems for Lithium Battery Installations: NFPA 855 Requirements and Best Practices", category: "TECHNICAL" },
  { slug: "bess-peak-shaving-commercial-industrial", topic: "BESS for Peak Shaving in Commercial and Industrial Facilities: ROI Calculation and Sizing Guide", category: "BUYER'S GUIDE" },
  { slug: "solar-storage-economics-middle-east", topic: "Solar Plus Storage Economics for Middle East Projects: Costs, Incentives, and Project Development", category: "REGIONAL" },
  { slug: "containerized-bess-deployment-checklist", topic: "Containerized BESS Deployment Checklist for EPC Contractors: Site Requirements, Commissioning, and Testing", category: "TECHNICAL" },
  { slug: "battery-management-system-specs-guide", topic: "Battery Management Systems (BMS): What to Look for in Specifications When Evaluating BESS Suppliers", category: "TECHNICAL" },
  { slug: "residential-vs-commercial-bess-differences", topic: "Residential vs Commercial BESS: Key Technical and Commercial Differences Every Buyer Should Know", category: "BUYER'S GUIDE" },
  { slug: "copper-vs-aluminum-busbar-data-center", topic: "Copper Busbar vs Aluminum Busbar for Data Center Power Distribution: Technical and Cost Comparison", category: "TECHNICAL" },
  { slug: "power-factor-correction-roi-industrial", topic: "Power Factor Correction ROI Calculation for Industrial Facilities: How to Justify the Investment", category: "BUYER'S GUIDE" },
  { slug: "medium-voltage-cable-selection-guide", topic: "Medium Voltage Cable Selection Guide 6kV to 35kV: XLPE vs EPR and Installation Standards", category: "TECHNICAL" },
  { slug: "modular-data-center-power-skid-specs", topic: "Modular Data Center Power Skids: Specification, Sizing, and Procurement for Rapid Deployment", category: "TECHNICAL" },
  { slug: "grounding-bonding-critical-power-systems", topic: "Grounding and Bonding Requirements for Critical Power Systems: IEEE Standards and Best Practices", category: "TECHNICAL" },
  { slug: "isolation-transformer-applications", topic: "Isolation Transformers: Medical Grade vs Industrial Applications and When You Need K-Rating", category: "TECHNICAL" },
  { slug: "adss-vs-gyxtw-fiber-optic-aerial", topic: "ADSS vs GYXTW Fiber Optic Cable for Aerial Installation: Which to Specify and Why", category: "TECHNICAL" },
  { slug: "precision-cooling-vs-hvac-data-center", topic: "Precision Cooling vs Standard HVAC for Data Centers: Why CRAC/CRAH Units Are Non-Negotiable", category: "TECHNICAL" },
  { slug: "industrial-chiller-sizing-mission-critical", topic: "Industrial Chiller Sizing for Mission Critical Facilities: Step-by-Step Engineering Guide", category: "TECHNICAL" },
  { slug: "ev-charging-infrastructure-commercial-fleet", topic: "EV Charging Infrastructure Planning for Commercial Fleet Operators: Power Requirements and ROI", category: "BUYER'S GUIDE" },
  { slug: "armored-power-cable-swa-vs-sta", topic: "Armored Power Cable Selection: SWA vs STA vs Unarmored and When to Use Each", category: "TECHNICAL" },
  { slug: "control-instrumentation-cable-industrial", topic: "Control and Instrumentation Cable for Industrial Automation: Specification Guide and Shielding Standards", category: "TECHNICAL" },
  { slug: "saudi-arabia-vision-2030-power-infrastructure", topic: "Saudi Arabia Vision 2030 Infrastructure Spending: Critical Power Opportunities for B2B Suppliers", category: "REGIONAL" },
  { slug: "egypt-energy-sector-modernization", topic: "Egypt Energy Sector Modernization: Infrastructure Projects and B2B Supply Opportunities 2025", category: "REGIONAL" },
  { slug: "us-data-center-construction-boom-2025", topic: "The US Data Center Construction Boom: Which States Are Building Most and What Power Infrastructure They Need", category: "MARKET INTELLIGENCE" },
  { slug: "ira-impact-commercial-energy-storage", topic: "IRA Inflation Reduction Act Impact on Commercial Energy Storage Procurement in 2025", category: "MARKET INTELLIGENCE" },
  { slug: "critical-power-equipment-tariffs-import", topic: "Critical Power Equipment Tariffs and Import Strategies for US Buyers in 2025: Navigating Section 301", category: "MARKET INTELLIGENCE" },
  { slug: "middle-east-renewable-energy-bess-2025", topic: "Middle East Renewable Energy Projects 2025: BESS and Solar Opportunities for Infrastructure Suppliers", category: "REGIONAL" },
  { slug: "ai-data-center-power-density-crisis", topic: "The AI Data Center Power Density Crisis: What It Means for Critical Infrastructure Buyers and Suppliers", category: "INDUSTRY TRENDS" },
  { slug: "grid-modernization-switchgear-opportunities", topic: "Grid Modernization Spending and What It Means for Switchgear and Transformer Suppliers", category: "INDUSTRY TRENDS" },
  { slug: "microgrid-rise-industrial-commercial", topic: "The Rise of Microgrids for Industrial and Commercial Facilities: Technology, Economics, and Procurement", category: "INDUSTRY TRENDS" },
  { slug: "carbon-reduction-bess-commercial-real-estate", topic: "Carbon Reduction Mandates Driving BESS Adoption in Commercial Real Estate: Market Analysis 2025", category: "INDUSTRY TRENDS" },
  { slug: "ev-charging-infrastructure-investment", topic: "EV Charging Infrastructure Investment Opportunities for Facility Operators and Developers", category: "INDUSTRY TRENDS" },
  { slug: "ot-cybersecurity-industrial-control-systems", topic: "OT Cybersecurity Requirements for Industrial Control Systems and SCADA: What Critical Infrastructure Buyers Need to Know", category: "INDUSTRY TRENDS" },
];

async function generateOne(config, existingSlugs) {
  if (existingSlugs.has(config.slug)) {
    console.log(`  ↷  Skipping (already exists): ${config.slug}`);
    return null;
  }

  console.log(`\n  ⟳  Generating: ${config.slug} ...`);

  let apiData;
  try {
    apiData = await generateArticleContent(config.topic);
  } catch (err) {
    console.error(`  ✗  API error for ${config.slug}: ${err.message}`);
    return null;
  }

  const title = apiData.title || config.topic;
  const img = UNIVERSAL_HERO_IMG;

  const article = {
    slug: config.slug,
    category: config.category,
    title,
    excerpt: apiData.excerpt || "",
    heroImg: img,
    readTime: config.readTime || Math.max(5, Math.ceil((apiData.sections || []).reduce((n, s) => n + (s.body?.split(" ").length || 0), 0) / 200)),
    date: new Date().toISOString().slice(0, 10),
    sections: apiData.sections || [],
    pullQuotes: apiData.pullQuotes || [],
    specTable: apiData.specTable || null,
    relatedProductNames: config.relatedProductNames || apiData.relatedProductNames || [],
  };

  const wordCount = (article.sections || []).reduce((n, s) => n + (s.body?.split(" ").length || 0), 0);
  console.log(`  ✓  Generated: ${article.title}`);
  console.log(`     Words: ${wordCount} | Hero: ${img.slice(0, 80)}...`);

  return article;
}

async function backfillImages() {
  const articles = readExistingArticles();
  if (articles.length === 0) {
    console.log("No existing articles found.");
    return;
  }

  console.log(`\n🖼️  Backfilling hero images for ${articles.length} existing article(s)\n`);
  let updated = 0;

  for (const article of articles) {
    console.log(`\n  Processing: ${article.slug}`);
    const oldUrl = article.heroImg;
    const newUrl = UNIVERSAL_HERO_IMG;

    if (newUrl !== oldUrl) {
      article.heroImg = newUrl;
      updated++;
      console.log(`  OLD: ${oldUrl}`);
      console.log(`  NEW: ${newUrl}`);
    } else {
      console.log(`  Unchanged: ${newUrl.slice(0, 80)}...`);
    }
  }

  if (updated > 0) {
    writeArticles(articles);
    console.log(`\n✅ Updated ${updated} article image(s).\n`);
  } else {
    console.log(`\n✅ No images changed.\n`);
  }

  return updated;
}

async function main() {
  if (BACKFILL_IMAGES) {
    const updated = await backfillImages();
    if (!SKIP_BUILD && updated > 0) {
      console.log("🔨 Running npm run build ...\n");
      try {
        execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
        console.log("\n✅ Build complete — site updated.\n");
      } catch (err) {
        console.error("Build failed:", err.message);
        process.exit(1);
      }
    }
    process.exit(0);
  }

  const existing = readExistingArticles();
  const existingSlugs = new Set(existing.map((a) => a.slug));
  const articles = [...existing];
  let generated = 0;

  if (GENERATE_ALL) {
    console.log(`\n🔥 Durbolt Power — Generating all ${INITIAL_ARTICLES.length} initial articles\n`);
    for (const config of INITIAL_ARTICLES) {
      const article = await generateOne(config, existingSlugs);
      if (article) {
        articles.push(article);
        existingSlugs.add(article.slug);
        generated++;
        writeArticles(articles);
      }
    }
  } else {
    // Weekly pipeline: generate 4 articles per run
    const queue = CONTENT_QUEUE.filter((c) => !existingSlugs.has(c.slug));
    const batch = queue.slice(0, 4);

    if (batch.length === 0) {
      console.log("✓ All queued articles have been generated.");
      process.exit(0);
    }

    console.log(`\n📰 Durbolt Power — Weekly pipeline: generating ${batch.length} articles\n`);
    for (const config of batch) {
      const article = await generateOne(config, existingSlugs);
      if (article) {
        articles.push(article);
        existingSlugs.add(article.slug);
        generated++;
        writeArticles(articles);
      }
    }
  }

  console.log(`\n✅ Done. ${generated} article(s) generated. Total in library: ${articles.length}\n`);

  if (!SKIP_BUILD && generated > 0) {
    console.log("🔨 Running npm run build ...\n");
    try {
      execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
      console.log("\n✅ Build complete — site updated.\n");
    } catch (err) {
      console.error("Build failed:", err.message);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
