#!/usr/bin/env node
// Durbolt Power Catalogue v2 — Landscape A4, cinematic industrial design

import { chromium } from '/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { DIVISIONS } from '../src/data/divisions.js';
import { PRODUCT_SPECS } from '../src/data/productSpecs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dist', 'catalogue');
const PDF_PATH = path.join(OUT_DIR, 'durbolt-power-catalogue-2025.pdf');
const HTML_PATH = path.join(OUT_DIR, 'index.html');

// ── Constants ───────────────────────────────────────────────────────────────

const ACCENT  = '#E8631A';
const DARK_BG = '#060C14';
const CARD_BG = '#0A1220';
const SANS    = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const MONO    = "'JetBrains Mono', monospace";
const BODY    = "'Inter', 'Segoe UI', sans-serif";

const PLACEHOLDER = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#0d1728"/><text x="50%" y="50%" fill="#1e2d45" font-size="16" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">IMAGE</text></svg>'
).toString('base64')}`;

// ── Image fetching ───────────────────────────────────────────────────────────

async function fetchBase64(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct  = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
    return `data:${ct};base64,${buf.toString('base64')}`;
  } catch (e) {
    console.warn(`  ⚠  ${url.slice(0, 70)}: ${e.message}`);
    return null;
  }
}

async function buildImageMap() {
  const urls = [...new Set(DIVISIONS.flatMap(d => d.products.map(p => p.imageUrl).filter(Boolean)))];
  console.log(`\nFetching ${urls.length} product images...`);
  const map = new Map();
  for (let i = 0; i < urls.length; i += 5) {
    const batch   = urls.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchBase64));
    batch.forEach((u, j) => {
      map.set(u, results[j] ?? PLACEHOLDER);
      console.log(`  [${i + j + 1}/${urls.length}] ${u.slice(0, 75)}`);
    });
  }
  return map;
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{background:#050A12;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:297mm;height:210mm;background:${DARK_BG};position:relative;overflow:hidden;page-break-after:always;break-after:page;}
.page:last-child{page-break-after:avoid;break-after:avoid;}
@page{size:297mm 210mm;margin:0;}
table{border-collapse:collapse;}
/* ── Web Viewer ──────────────────────────────────────────────────────────── */
.viewer-toolbar{position:fixed;top:0;left:0;right:0;height:52px;background:#080E18;border-bottom:2px solid #E8631A;display:flex;align-items:center;justify-content:space-between;flex-wrap:nowrap;gap:8px;padding:0 12px;z-index:9999;box-sizing:border-box;}
.viewer-logo{font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:800;font-size:13px;letter-spacing:0.1em;color:#fff;white-space:nowrap;flex-shrink:0;}
.viewer-meta{font-family:"JetBrains Mono",monospace;font-size:7px;color:#6a6a7a;letter-spacing:0.14em;text-align:center;flex:1;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.viewer-dl{font-family:"JetBrains Mono",monospace;font-size:8px;font-weight:700;color:#E8631A;letter-spacing:0.1em;text-decoration:none;white-space:nowrap;border:1px solid rgba(232,99,26,0.4);padding:5px 10px;flex-shrink:0;}
.viewer-dl:hover{background:rgba(232,99,26,0.1);}
.viewer-pages{padding-top:68px;padding-bottom:48px;display:flex;flex-direction:column;align-items:flex-start!important;background:#050A12;overflow-x:hidden;}
.viewer-pages .page{box-shadow:0 6px 32px rgba(0,0,0,0.65),0 0 0 1px rgba(232,99,26,0.07);touch-action:pan-y;flex-shrink:0;}
@media print{.viewer-toolbar{display:none!important;}.viewer-pages{padding-top:0!important;}body,html{margin:0;padding:0;}.page{margin:0;}}
`;

function logoHTML(size = 26) {
  return `<span style="font-family:${SANS};font-weight:800;font-size:${size}px;letter-spacing:0.08em;color:#fff;line-height:1;">— DURBOLT </span><span style="font-family:${SANS};font-weight:800;font-size:${size}px;letter-spacing:0.08em;color:${ACCENT};line-height:1;">POWER</span><span style="font-family:${SANS};font-weight:800;font-size:${size}px;letter-spacing:0.08em;color:#fff;line-height:1;"> —</span>`;
}

function topRule(color = ACCENT) {
  return `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:${color};z-index:10;"></div>`;
}

function pageMeta(breadcrumb, num) {
  return `<div style="position:absolute;top:9px;left:22px;right:22px;display:flex;justify-content:space-between;align-items:center;z-index:9;">
    <span style="font-family:${MONO};font-size:6.5px;color:#E8631A;letter-spacing:0.18em;text-transform:uppercase;">${breadcrumb}</span>
    <span style="font-family:${MONO};font-size:6.5px;color:#555;">${num}</span>
  </div>`;
}

function bottomBar(left, right) {
  return `<div style="position:absolute;bottom:0;left:0;right:0;height:20px;border-top:1px solid #0a1020;display:flex;align-items:center;padding:0 28px;justify-content:space-between;">
    <span style="font-family:${MONO};font-size:6px;color:#666;letter-spacing:0.12em;">${left}</span>
    <span style="font-family:${MONO};font-size:6px;color:#555;">${right}</span>
  </div>`;
}

// ── Cover page ───────────────────────────────────────────────────────────────

function coverPage() {
  return `<div class="page" style="background:${DARK_BG};">
  ${topRule()}
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,${ACCENT}0d 0%,transparent 55%);"></div>
  <div style="position:absolute;top:0;left:54%;width:1px;height:100%;background:linear-gradient(to bottom,${ACCENT}00,${ACCENT}33 30%,${ACCENT}22 70%,${ACCENT}00);"></div>
  <div style="position:absolute;top:0;right:0;width:46%;height:100%;background:linear-gradient(to left,${DARK_BG}CC,transparent);"></div>

  <div style="position:absolute;top:50%;left:42px;transform:translateY(-50%);">
    <div style="margin-bottom:18px;">${logoHTML(30)}</div>
    <div style="font-family:${SANS};font-weight:900;font-size:78px;line-height:0.88;color:#fff;letter-spacing:-0.02em;text-transform:uppercase;margin-bottom:18px;">PRODUCT<br><span style="color:${ACCENT};">CATALOGUE</span></div>
    <div style="width:44px;height:3px;background:${ACCENT};margin-bottom:16px;"></div>
    <div style="font-family:${BODY};font-size:10px;color:#A0AEC0;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:5px;">CRITICAL POWER INFRASTRUCTURE</div>
    <div style="font-family:${MONO};font-size:8.5px;color:#888;letter-spacing:0.1em;">2025 EDITION &nbsp;·&nbsp; durbolt.com</div>
  </div>

  <div style="position:absolute;top:50%;right:42px;transform:translateY(-50%);text-align:right;">
    <div style="font-family:${MONO};font-size:7px;color:${ACCENT};letter-spacing:0.22em;text-transform:uppercase;margin-bottom:18px;">OUR DIVISIONS</div>
    ${DIVISIONS.map(d => `
    <div style="margin-bottom:16px;">
      <div style="font-family:${SANS};font-weight:700;font-size:13.5px;color:#FFFFFF;letter-spacing:0.04em;text-transform:uppercase;">${d.name}</div>
      <div style="font-family:${BODY};font-size:7.5px;color:#888;margin-top:2px;">${d.tagline}</div>
    </div>`).join('')}
  </div>

  <div style="position:absolute;bottom:0;left:0;right:0;height:26px;background:rgba(232,99,26,0.06);border-top:1px solid rgba(232,99,26,0.12);display:flex;align-items:center;padding:0 42px;justify-content:space-between;">
    <span style="font-family:${MONO};font-size:6.5px;color:#666;letter-spacing:0.14em;">FACTORY-DIRECT PRICING &nbsp;·&nbsp; GLOBAL FULFILLMENT &nbsp;·&nbsp; 44 PRODUCT LINES</span>
    <span style="font-family:${MONO};font-size:6.5px;color:#666;">info@durbolt.com</span>
  </div>
</div>`;
}

// ── About page ───────────────────────────────────────────────────────────────

function aboutPage(num) {
  return `<div class="page" style="background:${DARK_BG};">
  ${topRule()}
  ${pageMeta('DURBOLT POWER', num)}

  <div style="position:absolute;top:26px;left:42px;right:42px;bottom:22px;display:flex;gap:32px;align-items:flex-start;padding-top:12px;">
    <div style="flex:1.1;">
      <div style="font-family:${MONO};font-size:7px;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">ABOUT DURBOLT POWER</div>
      <div style="font-family:${SANS};font-weight:900;font-size:34px;color:#fff;text-transform:uppercase;line-height:0.95;letter-spacing:0.01em;margin-bottom:16px;">Critical Infrastructure.<br><span style="color:${ACCENT};">Built to Last.</span></div>
      <p style="font-family:${BODY};font-size:8.5px;color:#A0AEC0;line-height:1.75;margin-bottom:12px;">
        Durbolt Power is a B2B supplier of industrial-grade critical power infrastructure — engineered for the most demanding environments in data centers, oil &amp; gas, utilities, and mission-critical facilities worldwide.
      </p>
      <p style="font-family:${BODY};font-size:8.5px;color:#A0AEC0;line-height:1.75;margin-bottom:16px;">
        With direct factory relationships and global fulfillment capability, we deliver 44 product lines across four specialized divisions — from 500kW generator sets to 100MWh containerized BESS deployments.
      </p>
      <div style="width:32px;height:2px;background:${ACCENT};margin-bottom:14px;"></div>
      <div style="font-family:${MONO};font-size:7px;color:${ACCENT};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">KEY CAPABILITIES</div>
      ${['Factory-direct pricing — no middlemen', 'Global fulfillment: USA, UAE, KSA, Egypt', 'Custom engineering &amp; turnkey solutions', 'Full compliance: CE, UL, IEC, ISO', 'Technical support &amp; site commissioning'].map(cap => `
      <div style="display:flex;align-items:flex-start;margin-bottom:5px;">
        <span style="color:${ACCENT};margin-right:8px;font-size:9px;flex-shrink:0;">—</span>
        <span style="font-family:${BODY};font-size:8px;color:#A0AEC0;">${cap}</span>
      </div>`).join('')}
    </div>

    <div style="flex:1;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${[['44','Product Lines'],['4','Divisions'],['500kW','to 100MWh+'],['Global','Fulfillment']].map(([n,l]) => `
        <div style="background:${CARD_BG};border:1px solid #111d30;padding:12px 14px;border-left:3px solid ${ACCENT};">
          <div style="font-family:${SANS};font-weight:900;font-size:28px;color:#fff;line-height:1;letter-spacing:-0.02em;">${n}</div>
          <div style="font-family:${MONO};font-size:6.5px;color:#888;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">${l}</div>
        </div>`).join('')}
      </div>

      <div style="font-family:${MONO};font-size:7px;color:${ACCENT};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">DIVISIONS</div>
      ${DIVISIONS.map(d => `
      <div style="display:flex;align-items:flex-start;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #0c1420;">
        <div style="width:3px;height:34px;background:${d.accentFrom};margin-right:12px;flex-shrink:0;margin-top:1px;"></div>
        <div>
          <div style="font-family:${SANS};font-weight:700;font-size:11px;color:#FFFFFF;letter-spacing:0.04em;text-transform:uppercase;">${d.name}</div>
          <div style="font-family:${BODY};font-size:7px;color:#888;margin-top:2px;">${d.products.length} products &nbsp;·&nbsp; ${d.tagline}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
  ${bottomBar('DURBOLT POWER — PRODUCT CATALOGUE 2025', num)}
</div>`;
}

// ── TOC page ─────────────────────────────────────────────────────────────────

function tocPage(entries, num) {
  return `<div class="page" style="background:${DARK_BG};">
  ${topRule()}
  ${pageMeta('DURBOLT POWER', num)}

  <div style="position:absolute;top:26px;left:42px;right:42px;bottom:22px;padding-top:10px;">
    <div style="font-family:${MONO};font-size:7px;color:${ACCENT};letter-spacing:0.22em;text-transform:uppercase;margin-bottom:6px;">CONTENTS</div>
    <div style="font-family:${SANS};font-weight:900;font-size:36px;color:#fff;text-transform:uppercase;line-height:1;margin-bottom:18px;">TABLE OF <span style="color:${ACCENT};">CONTENTS</span></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 36px;">
      ${entries.map(e => {
        if (e.type === 'division') return `
        <div style="grid-column:1/-1;display:flex;align-items:center;padding:7px 0;margin-top:4px;border-bottom:1px solid ${e.accent}22;">
          <div style="width:4px;height:4px;background:${e.accent};margin-right:10px;flex-shrink:0;"></div>
          <span style="font-family:${SANS};font-weight:700;font-size:14px;color:#FFFFFF;letter-spacing:0.04em;text-transform:uppercase;flex:1;">${e.label}</span>
          <span style="font-family:${MONO};font-size:9px;color:#888;">${e.pg}</span>
        </div>`;
        return `
        <div style="display:flex;align-items:center;padding:3px 0 3px 14px;">
          <span style="font-family:${BODY};font-size:9px;color:#A0AEC0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:6px;">${e.label}</span>
          <span style="font-family:${MONO};font-size:8.5px;color:#888;flex-shrink:0;">${e.pg}</span>
        </div>`;
      }).join('')}
    </div>
  </div>
  ${bottomBar('DURBOLT POWER — PRODUCT CATALOGUE 2025', num)}
</div>`;
}

// ── Division divider ──────────────────────────────────────────────────────────

function divisionPage(div, num) {
  const a = div.accentFrom;
  const nameLines = div.name.includes(' & ')
    ? div.name.split(' & ').map((part, i) => i === 0 ? part : `<span style="color:${a};">&amp;</span> ${part}`)
    : [div.name];

  return `<div class="page" style="background:${DARK_BG};">
  ${topRule(a)}
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,${a}0f 0%,transparent 65%);"></div>
  <div style="position:absolute;top:0;left:0;width:5px;height:100%;background:${a};"></div>
  <div style="position:absolute;bottom:-30px;right:-20px;font-family:${SANS};font-weight:900;font-size:260px;color:#fff;opacity:0.018;line-height:1;user-select:none;pointer-events:none;">${div.id}</div>

  <div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 60px 0 60px;">
    <div>
      <div style="font-family:${MONO};font-size:8px;color:${a};letter-spacing:0.25em;text-transform:uppercase;margin-bottom:16px;">DIVISION 0${div.id} &nbsp;·&nbsp; ${div.products.length} PRODUCTS</div>
      <div style="font-family:${SANS};font-weight:900;font-size:58px;color:#fff;text-transform:uppercase;line-height:0.92;letter-spacing:-0.01em;margin-bottom:18px;">${nameLines.join('<br>')}</div>
      <div style="width:44px;height:3px;background:${a};margin-bottom:18px;"></div>
      <div style="font-family:${BODY};font-size:10px;color:#A0AEC0;line-height:1.75;max-width:440px;">${div.description}</div>
      <div style="margin-top:22px;font-family:${SANS};font-weight:700;font-size:13px;color:${a};letter-spacing:0.1em;text-transform:uppercase;">${div.tagline}</div>
    </div>
  </div>

  <div style="position:absolute;bottom:14px;right:24px;font-family:${MONO};font-size:7px;color:#666;">${num}</div>
  <div style="position:absolute;bottom:14px;left:60px;font-family:${MONO};font-size:6.5px;color:#666;letter-spacing:0.12em;text-transform:uppercase;">DURBOLT POWER — ${div.name.toUpperCase()}</div>
</div>`;
}

// ── Hero product page (1 per page, all 44 products) ─────────────────────────

function heroPage(product, div, images, num) {
  const a     = div.accentFrom;
  const img   = images.get(product.imageUrl) || PLACEHOLDER;
  const fit   = product.contain ? 'contain' : 'cover';
  const spec  = PRODUCT_SPECS[product.name];
  const cats  = spec ? spec.categories.slice(0, 3) : [];
  const certs = spec ? spec.certifications.slice(0, 6) : [];
  const apps  = spec ? spec.applications.slice(0, 4) : [];

  return `<div class="page" style="background:${DARK_BG};">
  ${topRule(a)}

  <div style="position:absolute;top:0;left:0;width:54%;height:100%;overflow:hidden;">
    <img src="${img}" style="width:100%;height:100%;object-fit:${fit};object-position:center;" alt="${product.name}" />
    <div style="position:absolute;inset:0;background:linear-gradient(to right,transparent 40%,#080F1A88 80%,#080F1A 100%);"></div>
  </div>

  <div style="position:absolute;top:0;left:54%;right:0;bottom:0;background:#080F1A;display:flex;flex-direction:column;overflow:hidden;">

    <div style="padding:16px 24px 0 22px;flex-shrink:0;">
      <div style="font-family:${MONO};font-size:7px;color:${a};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:9px;">DIV 0${div.id} · ${div.name.toUpperCase()}</div>
      <div style="font-family:${SANS};font-weight:900;font-size:28px;color:#fff;text-transform:uppercase;line-height:1.0;letter-spacing:0.01em;margin-bottom:7px;">${product.name}</div>
      ${product.sku ? `<div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:8px;padding:3px 9px;border:1px solid rgba(232,99,26,0.3);">
        <span style="font-family:${MONO};font-size:6px;color:#555;letter-spacing:0.18em;text-transform:uppercase;">PART NO.</span>
        <span style="font-family:${MONO};font-size:7.5px;font-weight:700;color:${a};letter-spacing:0.12em;">${product.sku}</span>
      </div>` : ''}
      <div style="font-family:${MONO};font-size:8px;color:#E8631A;line-height:1.5;margin-top:${product.sku ? '0' : '0'};margin-bottom:8px;">${product.spec}</div>
      <div style="border-bottom:1px solid rgba(232,99,26,0.3);margin-bottom:10px;"></div>
    </div>

    <div style="flex:1;padding:0 24px 0 22px;overflow:hidden;display:flex;flex-direction:column;gap:8px;">
      ${cats.map(cat => `
      <div>
        <div style="font-family:${MONO};font-size:6px;color:${a};letter-spacing:0.18em;text-transform:uppercase;margin-bottom:3px;">${cat.title}</div>
        <table style="width:100%;">
          ${cat.rows.slice(0, 4).map(([k, v]) => `
          <tr style="border-bottom:1px solid #0c1528;">
            <td style="font-family:${MONO};font-size:6.5px;color:#A0AEC0;padding:2.5px 0;width:44%;letter-spacing:0.03em;">${k}</td>
            <td style="font-family:${MONO};font-size:6.5px;color:#E2E8F0;padding:2.5px 0;text-align:right;">${v}</td>
          </tr>`).join('')}
        </table>
      </div>`).join('')}

      ${certs.length ? `<div>
        <div style="font-family:${MONO};font-size:6px;color:#E8631A;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:4px;">CERTIFICATIONS</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${certs.map(c => `<span style="font-family:${MONO};font-size:6px;color:#CBD5E0;background:rgba(232,99,26,0.06);border:1px solid rgba(255,255,255,0.15);padding:2px 6px;">${c}</span>`).join('')}
        </div>
      </div>` : ''}

      ${apps.length ? `<div>
        <div style="font-family:${MONO};font-size:6px;color:#E8631A;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:3px;">APPLICATIONS</div>
        <div style="font-family:${BODY};font-size:7px;color:#A0AEC0;line-height:1.5;">${apps.join(' · ')}</div>
      </div>` : ''}

      <div style="flex:1;min-height:0;"></div>
      <div style="font-family:${BODY};font-style:italic;font-size:6.5px;color:#666;line-height:1.5;padding-bottom:10px;">Unit configuration, color, and finish may vary depending on project requirements and specifications.</div>
    </div>

    <div style="height:32px;background:${a};display:flex;align-items:center;padding:0 22px;justify-content:space-between;flex-shrink:0;">
      <span style="font-family:${MONO};font-size:8px;font-weight:700;color:#fff;letter-spacing:0.18em;text-transform:uppercase;">REQUEST QUOTE</span>
      <span style="font-family:${MONO};font-size:8px;font-weight:700;color:#fff;letter-spacing:0.14em;text-transform:uppercase;">SALES@DURBOLT.COM →</span>
    </div>
  </div>
</div>`;
}

// ── Back cover ───────────────────────────────────────────────────────────────

function backCoverPage() {
  return `<div class="page" style="background:${DARK_BG};">
  ${topRule()}
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,#0d1828 0%,${DARK_BG} 65%);"></div>
  <div style="position:absolute;inset:0;opacity:0.025;background:repeating-linear-gradient(0deg,transparent,transparent 22px,${ACCENT} 22px,${ACCENT} 23px),repeating-linear-gradient(90deg,transparent,transparent 22px,${ACCENT} 22px,${ACCENT} 23px);"></div>

  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="margin-bottom:18px;">${logoHTML(34)}</div>
    <div style="font-family:${SANS};font-weight:300;font-size:12px;color:#888;letter-spacing:0.32em;text-transform:uppercase;margin-bottom:26px;">CRITICAL POWER INFRASTRUCTURE</div>
    <div style="width:44px;height:2px;background:${ACCENT};margin-bottom:26px;"></div>
    <div style="display:flex;gap:52px;margin-bottom:26px;">
      ${[['WEBSITE','durbolt.com'],['EMAIL','info@durbolt.com'],['COVERAGE','USA · UAE · KSA · EG']].map(([l,v]) => `
      <div>
        <div style="font-family:${MONO};font-size:6.5px;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">${l}</div>
        <div style="font-family:${BODY};font-size:9px;color:#A0AEC0;">${v}</div>
      </div>`).join('')}
    </div>
    <div style="font-family:${MONO};font-size:6.5px;color:#666;letter-spacing:0.1em;">© 2025 DURBOLT POWER &nbsp;·&nbsp; ALL RIGHTS RESERVED &nbsp;·&nbsp; B2B SUPPLIER — FACTORY-DIRECT PRICING</div>
  </div>
</div>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const images = await buildImageMap();

  // Build all pages and collect TOC entries
  const pages    = [];
  const tocItems = [];
  let   pg       = 1;

  // Cover
  pages.push(coverPage());
  pg++;

  // About
  pages.push(aboutPage(pg));
  pg++;

  // TOC (placeholder — filled in after all pages are built)
  const TOC_MARKER = '<!-- TOC -->';
  pages.push(TOC_MARKER);
  const tocPg = pg;
  pg++;

  // Divisions — every product gets a full hero page
  for (const div of DIVISIONS) {
    tocItems.push({ type: 'division', label: div.name, pg, accent: div.accentFrom });
    pages.push(divisionPage(div, pg));
    pg++;

    for (const p of div.products) {
      tocItems.push({ type: 'product', label: p.name, pg });
      pages.push(heroPage(p, div, images, pg));
      pg++;
    }
  }

  // Back cover
  pages.push(backCoverPage());
  const totalPages = pg;

  // Build TOC and inject
  const toc = tocPage(tocItems, tocPg);
  const finalPages = pages.map(p => (p === TOC_MARKER ? toc : p));

  // Write HTML
  const pgCount = finalPages.length;
  const viewerToolbar = `<div class="viewer-toolbar">
  <div class="viewer-logo"><span style="color:#fff">— DURBOLT </span><span style="color:#E8631A">POWER</span><span style="color:#fff"> —</span></div>
  <div class="viewer-meta">${pgCount} PGS&nbsp;·&nbsp;44 PRODUCTS</div>
  <a class="viewer-dl" href="durbolt-power-catalogue-2025.pdf">↓ DOWNLOAD PDF</a>
</div>`;
  const viewerJs = `<script>
(function(){
  var PW = 1122, PH = 794;
  function scale(){
    var vw = Math.min(document.documentElement.clientWidth, window.innerWidth);
    var s = Math.min(1, (vw - 16) / PW);
    if(s < 0.25) s = 0.25;
    var scaledH = Math.round(PH * s);
    var scaledW = Math.round(PW * s);
    var ml = Math.max(0, Math.floor((vw - scaledW) / 2));
    var gap = 16;
    var mb = scaledH - PH + gap;
    document.querySelectorAll('.viewer-pages .page').forEach(function(p){
      p.style.transform = 'scale(' + s + ')';
      p.style.transformOrigin = 'top left';
      p.style.marginLeft = ml + 'px';
      p.style.marginBottom = mb + 'px';
      p.style.display = 'block';
    });
    document.querySelector('.viewer-pages').style.paddingBottom = '32px';
  }
  window.addEventListener('resize', scale);
  setTimeout(scale, 0);
  setTimeout(scale, 300);
  setTimeout(scale, 800);
})();
</script>`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Durbolt Power — Product Catalogue 2025</title>
<style>${css}</style>
</head>
<body>
${viewerToolbar}
<div class="viewer-pages">
${finalPages.join('\n')}
</div>
${viewerJs}
</body>
</html>`;

  fs.writeFileSync(HTML_PATH, html);
  console.log(`\nHTML: ${HTML_PATH}`);
  console.log(`Pages: ${totalPages}`);

  // Generate PDF with Playwright
  console.log('\nLaunching Playwright for PDF...');
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  await page.setViewportSize({ width: 1122, height: 794 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  console.log('Waiting for fonts & images...');
  await page.waitForTimeout(10000);

  console.log('Generating PDF...');
  await page.pdf({
    path: PDF_PATH,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  console.log(`PDF: ${PDF_PATH}`);

  // Screenshots — cover, division divider, 3 hero pages
  console.log('\nCapturing screenshots...');
  const SHOT_DIR = '/root/catalogue-v5-screenshots';
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  const els = await page.$$('.page');
  console.log(`Found ${els.length} page elements`);

  // Structure: 0=cover, 1=about, 2=TOC, 3=div1-divider, 4=first hero, 3+15=div2-divider, etc.
  const targets = [
    { idx: 0,  name: 'cover' },
    { idx: 3,  name: 'division-divider' },
    { idx: 4,  name: 'hero-01' },
    { idx: 12, name: 'hero-mid' },
    { idx: 20, name: 'hero-late' },
  ];

  for (const { idx, name } of targets) {
    if (els[idx]) {
      const p = `${SHOT_DIR}/${name}.png`;
      await els[idx].screenshot({ path: p });
      console.log(`  ${name}: ${p}`);
    }
  }

  await browser.close();

  const pdfMB = (fs.statSync(PDF_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`\n=== CATALOGUE V5 COMPLETE ===`);
  console.log(`Pages: ${totalPages}`);
  console.log(`PDF:   ${pdfMB} MB — ${PDF_PATH}`);
  console.log(`HTML:  ${HTML_PATH}`);
  console.log(`Shots: ${SHOT_DIR}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
