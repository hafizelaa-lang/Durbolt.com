import { createServer } from "http";
import { existsSync, statSync, createReadStream, mkdirSync, readFileSync, appendFileSync, writeFileSync } from "fs";
import { extname, join, normalize } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createGzip } from "zlib";
import { pipeline } from "stream";
import { get as httpsGet } from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "dist");
const DATA_DIR = join(__dirname, "data");
const VISITS_FILE    = join(DATA_DIR, "visits.jsonl");
const RFQ_LEADS_FILE = join(DATA_DIR, "rfq_leads.jsonl");
const GEO_CACHE_FILE = join(DATA_DIR, "geo_cache.json");
const PORT = 8082;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "4095";

// Load .env
try {
  for (const line of readFileSync(join(__dirname, ".env"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(VISITS_FILE))    writeFileSync(VISITS_FILE, "");
if (!existsSync(RFQ_LEADS_FILE)) writeFileSync(RFQ_LEADS_FILE, "");
if (!existsSync(GEO_CACHE_FILE)) writeFileSync(GEO_CACHE_FILE, "{}");

// In-memory caches
let geoCache = {};
try { geoCache = JSON.parse(readFileSync(GEO_CACHE_FILE, "utf8")); } catch {}
const rateLimit = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".svg", ".txt"]);

// ─── Helpers ────────────────────────────────────────────────────────────────

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function parseUserAgent(ua = "") {
  const device =
    /Mobile|Android/i.test(ua) && !/iPad/i.test(ua)
      ? "Mobile"
      : /iPad|Tablet/i.test(ua)
      ? "Tablet"
      : "Desktop";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)
    ? "macOS"
    : /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad/i.test(ua)
    ? "iOS"
    : /Linux/i.test(ua)
    ? "Linux"
    : "Unknown";
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\//i.test(ua)
    ? "Opera"
    : /Chrome\//i.test(ua)
    ? "Chrome"
    : /Firefox\//i.test(ua)
    ? "Firefox"
    : /Safari\//i.test(ua)
    ? "Safari"
    : "Other";
  return { device, os, browser };
}

const LOCAL_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1$|::ffff:127\.|localhost)/i;

async function lookupGeo(ip) {
  if (geoCache[ip]) return geoCache[ip];
  if (LOCAL_IP_RE.test(ip)) {
    return { country: "Local", countryCode: "LO", region: "", city: "Localhost", org: "Local Network" };
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => { req.destroy(); resolve(null); }, 3000);
    const req = httpsGet(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      { headers: { "User-Agent": "durbolt-analytics/1.0" } },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          clearTimeout(timer);
          try {
            const j = JSON.parse(data);
            if (j.error) { resolve(null); return; }
            const geo = {
              country: j.country_name || "Unknown",
              countryCode: j.country_code || "",
              region: j.region || "",
              city: j.city || "",
              org: j.org || "",
            };
            geoCache[ip] = geo;
            try { writeFileSync(GEO_CACHE_FILE, JSON.stringify(geoCache)); } catch {}
            resolve(geo);
          } catch { resolve(null); }
        });
      }
    );
    req.on("error", () => { clearTimeout(timer); resolve(null); });
  });
}

function readVisits() {
  try {
    const content = readFileSync(VISITS_FILE, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (d) => (body += d.slice(0, 4096)));
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}

function checkRateLimit(ip) {
  const now = Date.now();
  const window = (rateLimit.get(ip) || []).filter((t) => now - t < 60000);
  if (window.length >= 20) return false;
  rateLimit.set(ip, [...window, now]);
  return true;
}

function requireAuth(req, res) {
  if (!ADMIN_TOKEN) {
    jsonRes(res, 404, { error: "Not found" });
    return false;
  }
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_TOKEN) {
    jsonRes(res, 404, { error: "Not found" });
    return false;
  }
  return true;
}

function jsonRes(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

// ─── API handlers ───────────────────────────────────────────────────────────

async function handleTrack(req, res) {
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) return jsonRes(res, 429, { error: "Rate limited" });
  try {
    const body = await parseBody(req);
    const ua = parseUserAgent(req.headers["user-agent"]);
    const visit = {
      ip,
      rawUa: (req.headers["user-agent"] || "").slice(0, 300),
      device: ua.device,
      os: ua.os,
      browser: ua.browser,
      page: String(body.page || "/").slice(0, 200),
      referrer: String(body.referrer || "").slice(0, 500),
      sessionId: String(body.sessionId || "").slice(0, 64),
      isNew: Boolean(body.isNew),
      timestamp: Date.now(),
    };
    appendFileSync(VISITS_FILE, JSON.stringify(visit) + "\n");
    // Background geo lookup to populate cache
    lookupGeo(ip).catch(() => {});
    return jsonRes(res, 200, { ok: true });
  } catch {
    return jsonRes(res, 400, { error: "Bad request" });
  }
}

async function handleLogin(req, res) {
  try {
    const body = await parseBody(req);
    if (!ADMIN_TOKEN || body.password !== ADMIN_TOKEN) {
      return jsonRes(res, 401, { error: "Invalid credentials" });
    }
    return jsonRes(res, 200, { ok: true, token: ADMIN_TOKEN });
  } catch {
    return jsonRes(res, 400, { error: "Bad request" });
  }
}

async function handleAnalytics(req, res) {
  if (!requireAuth(req, res)) return;

  const visits = readVisits();
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  // Enrich with cached geo
  const enriched = visits.map((v) => ({
    ...v,
    geo: geoCache[v.ip] || { country: "Unknown", countryCode: "", city: "", org: "" },
  }));

  // Summary
  const todayCount = enriched.filter((v) => v.timestamp >= todayStart.getTime()).length;
  const weekCount = enriched.filter((v) => v.timestamp >= weekAgo).length;
  const uniqueIPs = new Set(enriched.map((v) => v.ip)).size;

  // Top pages
  const pageCounts = {};
  enriched.forEach((v) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 12)
    .map(([page, count]) => ({ page, count }));

  // Traffic sources
  const srcCounts = {};
  enriched.forEach((v) => {
    let src = "Direct";
    if (v.referrer) {
      try {
        const h = new URL(v.referrer).hostname.replace(/^www\./, "");
        src = h.includes("google") ? "Google"
          : h.includes("linkedin") ? "LinkedIn"
          : h.includes("facebook") ? "Facebook"
          : h.includes("twitter") || h.includes("t.co") ? "Twitter/X"
          : h.includes("bing") ? "Bing"
          : h.includes("durbolt") ? "Internal"
          : h || "Direct";
      } catch { src = "Direct"; }
    }
    srcCounts[src] = (srcCounts[src] || 0) + 1;
  });
  const sources = Object.entries(srcCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 10)
    .map(([source, count]) => ({ source, count }));

  // Countries
  const countryCounts = {};
  enriched.forEach((v) => {
    const c = v.geo.country || "Unknown";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const countries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 20)
    .map(([country, count]) => ({ country, count, code: enriched.find((e) => e.geo.country === country)?.geo.countryCode || "" }));

  // Devices
  const devices = {};
  enriched.forEach((v) => { devices[v.device || "Unknown"] = (devices[v.device || "Unknown"] || 0) + 1; });

  // Weekly trend (last 14 days)
  const weeklyTrend = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400000); d.setHours(0, 0, 0, 0);
    const next = d.getTime() + 86400000;
    weeklyTrend.push({
      date: d.toISOString().slice(0, 10),
      count: enriched.filter((v) => v.timestamp >= d.getTime() && v.timestamp < next).length,
    });
  }

  // Daily summary (yesterday)
  const yesterday = enriched.filter(
    (v) => v.timestamp >= yesterdayStart.getTime() && v.timestamp < todayStart.getTime()
  );
  const ySessions = new Set(yesterday.map((v) => v.sessionId));
  const ySessionPages = {};
  yesterday.forEach((v) => { ySessionPages[v.sessionId] = (ySessionPages[v.sessionId] || 0) + 1; });
  const yBounces = Object.values(ySessionPages).filter((c) => c === 1).length;

  // Bounce rate per page
  const sessionPageMap = {};
  enriched.forEach((v) => {
    if (!sessionPageMap[v.sessionId]) sessionPageMap[v.sessionId] = [];
    sessionPageMap[v.sessionId].push(v.page);
  });
  const pageBounce = {};
  Object.values(sessionPageMap).forEach((pages) => {
    const isB = pages.length === 1;
    [...new Set(pages)].forEach((p) => {
      if (!pageBounce[p]) pageBounce[p] = { views: 0, bounces: 0 };
      pageBounce[p].views++;
      if (isB) pageBounce[p].bounces++;
    });
  });

  // IP visit counts for bot detection
  const ipCounts = {};
  enriched.forEach((v) => { ipCounts[v.ip] = (ipCounts[v.ip] || 0) + 1; });
  const bots = Object.entries(ipCounts)
    .filter(([, c]) => c > 20)
    .sort(([, a], [, b]) => b - a)
    .map(([ip, count]) => ({ ip, count, geo: geoCache[ip] || {} }));

  // Online now (unique IPs with visits in the last 5 minutes)
  const fiveMinAgo = now - 5 * 60 * 1000;
  const onlineNow = new Set(enriched.filter((v) => v.timestamp >= fiveMinAgo).map((v) => v.ip)).size;

  // Hourly pageviews for today (UTC hours 0–23)
  const hourlyToday = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: 0 }));
  enriched.filter((v) => v.timestamp >= todayStart.getTime()).forEach((v) => {
    hourlyToday[new Date(v.timestamp).getUTCHours()].views++;
  });

  // New vs returning visitors (based on isNew flag across all enriched visits)
  let newCount = 0, returningCount = 0;
  enriched.forEach((v) => { if (v.isNew) newCount++; else returningCount++; });

  // 30-day trend
  const trend30d = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000); d.setHours(0, 0, 0, 0);
    const next = d.getTime() + 86400000;
    trend30d.push({
      date: d.toISOString().slice(0, 10),
      visitors: enriched.filter((v) => v.timestamp >= d.getTime() && v.timestamp < next).length,
    });
  }

  // Recent visits for table (last 500, newest first) — strip raw UA
  const recentVisits = enriched.slice(-500).reverse().map(({ rawUa, ...v }) => v);

  jsonRes(res, 200, {
    summary: { today: todayCount, week: weekCount, allTime: enriched.length, uniqueIPs },
    visits: recentVisits,
    topPages,
    sources,
    countries,
    devices,
    weeklyTrend,
    trend30d,
    hourlyToday,
    returningVsNew: { new: newCount, returning: returningCount },
    onlineNow,
    pageBounce,
    daily: {
      yesterday: {
        visits: yesterday.length,
        uniqueIPs: new Set(yesterday.map((v) => v.ip)).size,
        sessions: ySessions.size,
        bounceRate: ySessions.size > 0 ? Math.round((yBounces / ySessions.size) * 100) : 0,
      },
    },
    bots,
  });
}

// ─── RFQ handler ─────────────────────────────────────────────────────────────

async function handleRFQ(req, res) {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", async () => {
    try {
      const { name, company, email, phone, product, message, attachments = [] } = JSON.parse(body);
      console.log(`[RFQ] Incoming: name=${name} company=${company} email=${email} product=${product} files=${attachments.length}`);
      if (!name || !company || !email || !product) {
        const missing = ["name","company","email","product"].filter(f => !({name,company,email,product}[f]));
        console.error("[RFQ] Missing required fields:", missing.join(", "));
        return jsonRes(res, 400, { error: "Missing required fields", missing });
      }
      if (!RESEND_API_KEY) {
        console.error("[RFQ] RESEND_API_KEY not set");
        return jsonRes(res, 500, { error: "Email service not configured" });
      }

      const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const row = (label, value) =>
        `<tr>
          <td style="padding:10px 14px;background:#f7f7f7;font-size:11px;font-weight:700;color:#555;width:130px;letter-spacing:0.07em;border-bottom:1px solid #e8e8e8;vertical-align:top">${label}</td>
          <td style="padding:10px 14px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #e8e8e8">${value}</td>
        </tr>`;

      const attachList = attachments.length
        ? `<div style="margin:24px 0 0">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#555;letter-spacing:0.07em">ATTACHED FILES (${attachments.length})</p>
            ${attachments.map((a) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f7f7f7;border-left:3px solid #E8631A;margin-bottom:4px;font-size:13px;color:#1a1a1a">&#128206; ${esc(a.filename)}</div>`).join("")}
          </div>`
        : "";

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f0f0f0">
<div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:620px;margin:24px auto;background:#ffffff;border:1px solid #e0e0e0">
  <div style="background:#0A0A0A;padding:28px 32px;border-bottom:3px solid #E8631A">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:20px;height:2px;background:#E8631A"></div>
      <span style="font-size:14px;font-weight:900;letter-spacing:0.14em;color:#ffffff">DURBOLT <span style="color:#E8631A">POWER</span></span>
      <div style="width:20px;height:2px;background:#E8631A"></div>
    </div>
    <p style="margin:6px 0 0;color:#888;font-size:11px;letter-spacing:0.1em">NEW RFQ SUBMISSION · durbolt.com</p>
  </div>

  <div style="padding:32px">
    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0A0A0A">${esc(company)}</h2>
    <p style="margin:0 0 24px;color:#999;font-size:13px">Submitted via durbolt.com · ${new Date().toUTCString()}</p>

    <table style="width:100%;border-collapse:collapse">
      ${row("CONTACT", esc(name))}
      ${row("EMAIL", `<a href="mailto:${esc(email)}" style="color:#E8631A;text-decoration:none">${esc(email)}</a>`)}
      ${row("PHONE", esc(phone) || "—")}
      ${row("PRODUCT", esc(product))}
    </table>

    ${message ? `<div style="margin:24px 0 0">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#555;letter-spacing:0.07em">PROJECT DETAILS</p>
      <div style="background:#f7f7f7;padding:16px;font-size:14px;color:#1a1a1a;line-height:1.75;white-space:pre-wrap">${esc(message)}</div>
    </div>` : ""}

    ${attachList}

    <div style="margin-top:28px">
      <a href="mailto:${esc(email)}" style="display:inline-block;background:#E8631A;color:#ffffff;padding:13px 26px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-decoration:none">REPLY TO INQUIRY →</a>
    </div>
  </div>

  <div style="background:#f7f7f7;padding:14px 32px;border-top:1px solid #e8e8e8">
    <p style="margin:0;font-size:11px;color:#aaa">Durbolt Power · durbolt.com · sales@durbolt.com</p>
  </div>
</div>
</body></html>`;

      const payload = {
        from: "Durbolt Power <contact@durbolt.com>",
        to: ["sales@durbolt.com"],
        reply_to: email,
        subject: `New Inquiry from ${name} — Durbolt.com`,
        html,
      };

      if (attachments.length) {
        payload.attachments = attachments.map(({ filename, content }) => ({ filename, content }));
      }

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify(payload),
      });

      const resendBody = await r.text();
      console.log(`[RFQ] Resend HTTP ${r.status}: ${resendBody}`);

      if (!r.ok) {
        console.error(`[RFQ] Resend rejected: from=${payload.from} to=${payload.to} key=${RESEND_API_KEY.slice(0,12)}...`);
        return jsonRes(res, 500, { error: "Failed to send email" });
      }

      let resendId = "";
      try { resendId = JSON.parse(resendBody).id || ""; } catch {}

      const lead = {
        timestamp: Date.now(),
        name, company, email,
        phone: phone || "",
        product,
        message: message || "",
        attachments_count: attachments.length,
        attachments: attachments.map(({ filename, content, contentType }) => ({
          filename,
          contentType: contentType || "application/octet-stream",
          size: content ? Math.round(content.length * 0.75) : 0,
          content: content || "",
        })),
        resend_id: resendId,
      };
      try { appendFileSync(RFQ_LEADS_FILE, JSON.stringify(lead) + "\n"); } catch (e) { console.error("[RFQ] Failed to write lead:", e.message); }

      console.log(`[RFQ] Sent: ${company} / ${email} — ${product}${attachments.length ? ` (+${attachments.length} file${attachments.length > 1 ? "s" : ""})` : ""}`);
      return jsonRes(res, 200, { ok: true });
    } catch (e) {
      console.error("[RFQ] Exception:", e);
      return jsonRes(res, 500, { error: "Server error" });
    }
  });
}

// ─── Ops leads handler ────────────────────────────────────────────────────────

async function handleOpsLeads(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    const content = readFileSync(RFQ_LEADS_FILE, "utf8");
    const leads = content.split("\n").filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean)
      .reverse();
    return jsonRes(res, 200, { leads });
  } catch {
    return jsonRes(res, 200, { leads: [] });
  }
}

// ─── Main server ─────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0].split("#")[0];

  // API routes
  if (urlPath.startsWith("/api/")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    if (urlPath === "/api/track" && req.method === "POST") return handleTrack(req, res);
    if (urlPath === "/api/analytics" && req.method === "GET") return handleAnalytics(req, res);
    if (urlPath === "/api/admin/login" && req.method === "POST") return handleLogin(req, res);
    if (urlPath === "/api/rfq" && req.method === "POST") return handleRFQ(req, res);
    if (urlPath === "/api/ops/leads" && req.method === "GET") return handleOpsLeads(req, res);

    return jsonRes(res, 404, { error: "Not found" });
  }

  // Static file serving
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(DIST_DIR, safePath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    const routeIndex = join(filePath, "index.html");
    if (existsSync(routeIndex)) {
      filePath = routeIndex;
    } else {
      filePath = join(DIST_DIR, "index.html");
    }
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  const ext = extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  const isHtml = ext === ".html";
  const cacheControl = isHtml ? "no-cache, must-revalidate" : "public, max-age=31536000, immutable";
  const acceptsGzip = (req.headers["accept-encoding"] || "").includes("gzip");
  const canGzip = acceptsGzip && COMPRESSIBLE.has(ext);

  const headers = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  };

  if (canGzip) {
    headers["Content-Encoding"] = "gzip";
    res.writeHead(200, headers);
    const gzip = createGzip();
    pipeline(createReadStream(filePath), gzip, res, (err) => {
      if (err) console.error("Stream error:", err.message);
    });
  } else {
    res.writeHead(200, headers);
    pipeline(createReadStream(filePath), res, (err) => {
      if (err) console.error("Stream error:", err.message);
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[durbolt] Server running on :${PORT}`);
  if (!ADMIN_TOKEN) console.warn("[durbolt] WARNING: ADMIN_TOKEN not set — analytics API requires token");
});
