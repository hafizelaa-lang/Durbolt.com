#!/usr/bin/env node
/**
 * Durbolt Power — Premium Product Catalogue Generator 2025
 * Outputs: /dist/catalogue/index.html + /dist/catalogue/durbolt-power-catalogue-2025.pdf
 */

import { chromium } from '/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIVISIONS } from '../src/data/divisions.js';
import { PRODUCT_SPECS } from '../src/data/productSpecs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../dist/catalogue');
mkdirSync(OUT, { recursive: true });

const BRAND   = '#E8631A';
const DARK    = '#080F1A';
const DARK2   = '#04060C';
const MONO    = `'JetBrains Mono', 'Courier New', monospace`;
const HEADING = `'Space Grotesk', 'Arial Black', sans-serif`;

const ALL_PRODUCT_COUNT = DIVISIONS.reduce((a, d) => a + d.products.length, 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function e(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function logoSVG(large = false) {
  const fs = large ? 56 : 13;
  const gap = large ? 16 : 10;
  const barW = large ? 40 : 22;
  const barH = large ? 3 : 2;
  return `
    <div style="display:flex;align-items:center;gap:${gap}px;">
      <div style="width:${barW}px;height:${barH}px;background:${BRAND};flex-shrink:0;box-shadow:0 0 10px ${BRAND}88;"></div>
      <span style="font-family:${HEADING};font-weight:800;font-size:${fs}px;letter-spacing:0.18em;line-height:1;color:#fff;">
        DURBOLT <span style="color:${BRAND};">POWER</span>
      </span>
      <div style="width:${barW}px;height:${barH}px;background:${BRAND};flex-shrink:0;box-shadow:0 0 10px ${BRAND}88;"></div>
    </div>`;
}

function specTable(productName, accent) {
  const s = PRODUCT_SPECS[productName];
  if (!s) return '';
  const cats = s.categories.slice(0, 3);
  return cats.map(cat => `
    <div style="margin-bottom:10px;">
      <div style="
        font-family:${MONO};font-size:8px;font-weight:700;color:${accent};
        letter-spacing:0.18em;text-transform:uppercase;
        margin-bottom:5px;padding-bottom:4px;
        border-bottom:1px solid ${accent}30;
      ">${e(cat.title)}</div>
      <table style="width:100%;border-collapse:collapse;">
        ${cat.rows.slice(0, 4).map(([lbl, val]) => `
          <tr>
            <td style="font-family:${MONO};font-size:8px;color:#666;padding:2.5px 0;width:36%;vertical-align:top;letter-spacing:0.03em;">${e(lbl)}</td>
            <td style="font-family:${MONO};font-size:8px;color:#C0C0C0;padding:2.5px 0 2.5px 8px;letter-spacing:0.02em;">${e(val)}</td>
          </tr>`).join('')}
      </table>
    </div>`).join('');
}

function certBadges(productName, accent) {
  const s = PRODUCT_SPECS[productName];
  if (!s?.certifications?.length) return '';
  return s.certifications.slice(0, 6).map(c => `
    <span style="
      font-family:${MONO};font-size:7.5px;font-weight:600;
      color:${accent};border:1px solid ${accent}44;
      padding:2px 7px;letter-spacing:0.1em;
      display:inline-block;margin-right:4px;margin-bottom:3px;
    ">${e(c)}</span>`).join('');
}

function applications(productName) {
  const s = PRODUCT_SPECS[productName];
  if (!s?.applications?.length) return '';
  return s.applications.slice(0, 5).join('  ·  ');
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    background: #000;
    width: 794px;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 794px;
    height: 1123px;
    background: ${DARK};
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Web viewer spacing between pages */
  @media screen {
    .page { margin-bottom: 8px; }
    body { padding: 24px; }
    #viewer-bar {
      position: fixed; top: 0; left: 0; right: 0;
      background: rgba(4,6,12,0.97);
      border-bottom: 1px solid rgba(232,99,26,0.3);
      padding: 10px 24px;
      display: flex; align-items: center; justify-content: space-between;
      z-index: 100;
    }
  }

  @media print {
    @page { size: A4; margin: 0; }
    html, body { width: 210mm; padding: 0; }
    .page { width: 210mm; height: 297mm; }
    #viewer-bar, #viewer-bar * { display: none !important; }
  }
`;

// ─── Page: Cover ──────────────────────────────────────────────────────────────

function coverPage() {
  return `
<div class="page" style="
  background: radial-gradient(ellipse at 50% 40%, #0D1825 0%, ${DARK2} 70%);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
">
  <!-- Grid pattern -->
  <div style="position:absolute;inset:0;
    background-image:
      linear-gradient(rgba(232,99,26,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,99,26,0.035) 1px, transparent 1px);
    background-size:44px 44px;
    pointer-events:none;
  "></div>

  <!-- Vignette -->
  <div style="position:absolute;inset:0;
    background:radial-gradient(ellipse at center, transparent 20%, rgba(4,6,12,0.75) 100%);
  "></div>

  <!-- Corner accents -->
  <div style="position:absolute;top:40px;left:40px;width:48px;height:48px;
    border-top:2px solid ${BRAND};border-left:2px solid ${BRAND};opacity:0.6;"></div>
  <div style="position:absolute;top:40px;right:40px;width:48px;height:48px;
    border-top:2px solid ${BRAND};border-right:2px solid ${BRAND};opacity:0.6;"></div>
  <div style="position:absolute;bottom:40px;left:40px;width:48px;height:48px;
    border-bottom:2px solid ${BRAND};border-left:2px solid ${BRAND};opacity:0.6;"></div>
  <div style="position:absolute;bottom:40px;right:40px;width:48px;height:48px;
    border-bottom:2px solid ${BRAND};border-right:2px solid ${BRAND};opacity:0.6;"></div>

  <!-- Main content -->
  <div style="position:relative;z-index:1;text-align:center;padding:0 60px;">

    <!-- Orange line top -->
    <div style="width:80px;height:2px;background:${BRAND};margin:0 auto 44px;
      box-shadow:0 0 24px ${BRAND};"></div>

    <!-- Logo -->
    <div style="margin-bottom:10px;">
      ${logoSVG(true)}
    </div>

    <!-- Tagline -->
    <div style="
      font-family:${MONO};font-size:10px;letter-spacing:0.28em;color:#666;
      text-transform:uppercase;margin-bottom:52px;
    ">Critical Power Infrastructure · Engineered for the World</div>

    <!-- Catalogue title box -->
    <div style="
      border:1px solid rgba(232,99,26,0.35);
      padding:18px 48px;
      display:inline-block;
      margin-bottom:52px;
      background:rgba(232,99,26,0.04);
    ">
      <div style="font-family:${MONO};font-size:9px;color:${BRAND};letter-spacing:0.28em;
        text-transform:uppercase;margin-bottom:6px;">PRODUCT CATALOGUE</div>
      <div style="font-family:${HEADING};font-size:42px;font-weight:800;
        color:#fff;letter-spacing:0.12em;line-height:1;">2025</div>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:0;justify-content:center;border:1px solid rgba(255,255,255,0.06);">
      ${[
        ['44', 'Product Lines'],
        ['4', 'Divisions'],
        ['50+', 'Countries'],
        ['B2B', 'Direct Supply'],
      ].map(([n, l], i) => `
        <div style="
          padding:20px 36px;
          text-align:center;
          ${i > 0 ? 'border-left:1px solid rgba(255,255,255,0.06);' : ''}
        ">
          <div style="font-family:${HEADING};font-weight:800;font-size:26px;
            color:${BRAND};line-height:1;margin-bottom:5px;">${n}</div>
          <div style="font-family:${MONO};font-size:8px;color:#555;
            letter-spacing:0.2em;text-transform:uppercase;">${l}</div>
        </div>`).join('')}
    </div>

    <!-- Orange line bottom -->
    <div style="width:80px;height:2px;background:${BRAND};margin:48px auto 0;
      box-shadow:0 0 24px ${BRAND};"></div>
  </div>

  <!-- Footer -->
  <div style="
    position:absolute;bottom:36px;left:0;right:0;
    display:flex;justify-content:space-between;align-items:center;
    padding:0 52px;z-index:1;
  ">
    <div style="font-family:${MONO};font-size:8px;color:#444;letter-spacing:0.18em;">
      CONFIDENTIAL — B2B PROCUREMENT USE ONLY
    </div>
    <div style="font-family:${MONO};font-size:8px;color:#444;letter-spacing:0.18em;">
      DURBOLT.COM · SALES@DURBOLT.COM
    </div>
  </div>
</div>`;
}

// ─── Page: About ──────────────────────────────────────────────────────────────

function aboutPage() {
  const stats = [
    ['20+', 'Years of Experience', 'Established supplier of critical power infrastructure across global markets.'],
    ['500+', 'Projects Delivered', 'Data centers, hospitals, utilities, telecoms, oil & gas, and government.'],
    ['50+', 'Countries Served', 'Active supply chains across the USA, Middle East, Africa, and South Asia.'],
    ['$100M+', 'Sourced to Date', 'Factory-direct B2B pricing. No middlemen. No markup on margin.'],
  ];
  return `
<div class="page" style="background:${DARK};display:flex;flex-direction:column;">

  <!-- Header bar -->
  <div style="
    height:56px;display:flex;align-items:center;justify-content:space-between;
    padding:0 48px;border-bottom:1px solid rgba(232,99,26,0.15);
    flex-shrink:0;
  ">
    ${logoSVG(false)}
    <div style="font-family:${MONO};font-size:8px;color:#444;letter-spacing:0.2em;">ABOUT DURBOLT POWER</div>
  </div>

  <!-- Content -->
  <div style="flex:1;display:flex;flex-direction:column;padding:52px 48px 40px;">

    <!-- Section label -->
    <div style="font-family:${MONO};font-size:9px;font-weight:700;color:${BRAND};
      letter-spacing:0.26em;text-transform:uppercase;margin-bottom:14px;">
      COMPANY OVERVIEW
    </div>

    <!-- Heading -->
    <h1 style="font-family:${HEADING};font-size:42px;font-weight:800;
      color:#fff;letter-spacing:-0.02em;line-height:1.05;margin-bottom:20px;">
      Built for<br><span style="color:${BRAND};">Critical Infrastructure.</span>
    </h1>

    <!-- Description -->
    <p style="font-family:${HEADING};font-size:13px;color:#A0A0A0;line-height:1.75;
      max-width:540px;margin-bottom:44px;">
      Durbolt Power is a B2B-direct supplier of industrial power generation, distribution,
      energy storage, connectivity, and cooling infrastructure. We source factory-direct
      from certified manufacturers worldwide and supply procurement teams, EPCs, and
      engineering firms across 50+ countries — from the U.S. to the UAE, Saudi Arabia,
      Egypt, and beyond.
    </p>

    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-bottom:44px;">
      ${stats.map(([num, label, desc]) => `
        <div style="
          background:rgba(232,99,26,0.04);
          border:1px solid rgba(232,99,26,0.14);
          padding:28px 28px;
        ">
          <div style="font-family:${HEADING};font-size:38px;font-weight:800;
            color:${BRAND};line-height:1;margin-bottom:4px;">${num}</div>
          <div style="font-family:${MONO};font-size:9px;font-weight:700;color:#fff;
            letter-spacing:0.16em;text-transform:uppercase;margin-bottom:10px;">${label}</div>
          <p style="font-family:${HEADING};font-size:11px;color:#666;line-height:1.6;">${desc}</p>
        </div>`).join('')}
    </div>

    <!-- Division list -->
    <div>
      <div style="font-family:${MONO};font-size:9px;font-weight:700;color:${BRAND};
        letter-spacing:0.22em;text-transform:uppercase;margin-bottom:16px;">
        FOUR DIVISIONS · ${ALL_PRODUCT_COUNT} PRODUCT LINES
      </div>
      <div style="display:flex;gap:2px;">
        ${DIVISIONS.map(d => `
          <div style="
            flex:1;padding:14px 16px;
            background:rgba(255,255,255,0.02);
            border:1px solid ${d.accentFrom}22;
            border-left:3px solid ${d.accentFrom};
          ">
            <div style="font-family:${MONO};font-size:8px;color:${d.accentFrom};
              letter-spacing:0.16em;margin-bottom:5px;">DIV. ${String(d.id).padStart(2,'0')}</div>
            <div style="font-family:${HEADING};font-size:10px;font-weight:700;
              color:#E0E0E0;line-height:1.3;margin-bottom:4px;">${d.name}</div>
            <div style="font-family:${MONO};font-size:8px;color:#555;">
              ${d.products.length} products</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Certifications note -->
    <div style="
      margin-top:auto;
      padding-top:24px;
      border-top:1px solid rgba(255,255,255,0.06);
      display:flex;align-items:center;gap:16px;
    ">
      <div style="font-family:${MONO};font-size:8px;color:#444;letter-spacing:0.12em;">
        ALL PRODUCTS CERTIFIED TO:
      </div>
      ${['IEC','UL','CE','ANSI','ISO 9001','IEEE'].map(c => `
        <span style="font-family:${MONO};font-size:8px;font-weight:600;
          color:#666;border:1px solid #333;padding:2px 8px;
          letter-spacing:0.1em;">${c}</span>`).join('')}
    </div>
  </div>
</div>`;
}

// ─── Page: Division Divider ───────────────────────────────────────────────────

function divisionDivider(div) {
  const accent = div.accentFrom;
  return `
<div class="page" style="
  background:${DARK2};
  display:flex;flex-direction:column;
  position:relative;overflow:hidden;
">
  <!-- Background: large faded division number -->
  <div style="
    position:absolute;
    top:-30px;right:-20px;
    font-family:${HEADING};font-size:320px;font-weight:800;
    color:rgba(255,255,255,0.018);
    line-height:1;letter-spacing:-0.05em;
    pointer-events:none;user-select:none;
    white-space:nowrap;
  ">0${div.id}</div>

  <!-- Diagonal accent line -->
  <div style="
    position:absolute;
    top:0;left:0;right:0;bottom:0;
    background:linear-gradient(135deg,
      ${accent}08 0%,
      transparent 50%,
      ${accent}04 100%
    );
    pointer-events:none;
  "></div>

  <!-- Left accent bar -->
  <div style="
    position:absolute;left:0;top:0;bottom:0;
    width:5px;
    background:linear-gradient(180deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%);
    box-shadow:0 0 24px ${accent}88;
  "></div>

  <!-- Header -->
  <div style="
    height:56px;display:flex;align-items:center;justify-content:space-between;
    padding:0 48px 0 60px;
    border-bottom:1px solid ${accent}18;
    flex-shrink:0;
    position:relative;z-index:1;
  ">
    ${logoSVG(false)}
    <div style="font-family:${MONO};font-size:8px;color:${accent};letter-spacing:0.2em;opacity:0.7;">
      DIVISION ${String(div.id).padStart(2,'0')}
    </div>
  </div>

  <!-- Main content -->
  <div style="
    flex:1;display:flex;flex-direction:column;
    justify-content:center;
    padding:0 72px 0 60px;
    position:relative;z-index:1;
  ">
    <!-- Division badge -->
    <div style="
      display:inline-flex;align-items:center;gap:10px;
      margin-bottom:24px;
    ">
      <div style="width:32px;height:2px;background:${accent};box-shadow:0 0 12px ${accent};"></div>
      <span style="
        font-family:${MONO};font-size:9px;font-weight:700;
        color:${accent};letter-spacing:0.24em;text-transform:uppercase;
      ">DIVISION ${String(div.id).padStart(2,'0')} — ${div.products.length} PRODUCTS</span>
    </div>

    <!-- Division name -->
    <h1 style="
      font-family:${HEADING};font-size:52px;font-weight:800;
      color:#fff;letter-spacing:-0.02em;line-height:1.05;
      margin-bottom:16px;max-width:580px;
    ">${e(div.name)}</h1>

    <!-- Tagline -->
    <p style="
      font-family:${HEADING};font-size:18px;font-style:italic;
      color:${accent};margin-bottom:28px;letter-spacing:0.01em;
    ">${e(div.tagline)}</p>

    <!-- Accent rule -->
    <div style="
      width:280px;height:1px;
      background:linear-gradient(90deg, ${accent}, transparent);
      margin-bottom:28px;
    "></div>

    <!-- Description -->
    <p style="
      font-family:${HEADING};font-size:13px;color:#8A8A8A;
      line-height:1.8;max-width:520px;margin-bottom:52px;
    ">${e(div.description)}</p>

    <!-- Product list preview -->
    <div style="
      display:grid;grid-template-columns:repeat(3,1fr);gap:2px;
      max-width:620px;
    ">
      ${div.products.slice(0, 9).map((p, i) => `
        <div style="
          font-family:${MONO};font-size:8px;color:#555;
          padding:6px 10px;
          background:rgba(255,255,255,0.02);
          border-left:2px solid ${accent}33;
          letter-spacing:0.04em;
          line-height:1.4;
        ">${i+1 < 10 ? '0'+(i+1) : i+1} ${e(p.name)}</div>`).join('')}
      ${div.products.length > 9 ? `
        <div style="
          font-family:${MONO};font-size:8px;color:${accent};
          padding:6px 10px;
          background:${accent}08;
          border-left:2px solid ${accent};
          letter-spacing:0.1em;
        ">+${div.products.length - 9} MORE</div>` : ''}
    </div>
  </div>

  <!-- Footer bar -->
  <div style="
    height:44px;display:flex;align-items:center;justify-content:flex-end;
    padding:0 48px;
    border-top:1px solid ${accent}12;
    flex-shrink:0;position:relative;z-index:1;
  ">
    <div style="font-family:${MONO};font-size:8px;color:#333;letter-spacing:0.18em;">
      DURBOLT POWER · PRODUCT CATALOGUE 2025
    </div>
  </div>
</div>`;
}

// ─── Page: Product ────────────────────────────────────────────────────────────

function productPage(product, division, divProductIndex, divProductTotal, globalIndex) {
  const accent = division.accentFrom;
  const specs = specTable(product.name, accent);
  const certs = certBadges(product.name, accent);
  const apps  = applications(product.name);
  const imgFit = product.contain ? 'contain' : 'cover';
  const imgBg  = product.contain ? '#0A0A12' : DARK;

  return `
<div class="page" style="background:${DARK};display:flex;flex-direction:column;">

  <!-- Header bar -->
  <div style="
    height:44px;display:flex;align-items:center;justify-content:space-between;
    padding:0 20px 0 0;
    background:rgba(4,6,12,0.9);
    border-bottom:1px solid ${accent}18;
    flex-shrink:0;
  ">
    <div style="
      height:44px;display:flex;align-items:center;
      padding:0 18px;
      border-right:1px solid ${accent}18;
      gap:10px;
    ">
      <div style="width:3px;height:24px;background:${accent};flex-shrink:0;"></div>
      <span style="font-family:${MONO};font-size:8px;font-weight:700;color:${accent};
        letter-spacing:0.18em;text-transform:uppercase;">
        DIV. ${String(division.id).padStart(2,'0')} — ${e(division.name)}
      </span>
    </div>
    <div style="display:flex;align-items:center;gap:20px;">
      <div style="font-family:${MONO};font-size:8px;color:#444;letter-spacing:0.14em;">
        PRODUCT ${String(divProductIndex).padStart(2,'0')} OF ${String(divProductTotal).padStart(2,'0')}
      </div>
      <div style="font-family:${MONO};font-size:8px;color:#333;letter-spacing:0.1em;">
        P.${String(globalIndex + 3).padStart(2,'0')}
      </div>
    </div>
  </div>

  <!-- Body: two-column -->
  <div style="flex:1;display:flex;overflow:hidden;">

    <!-- LEFT: Image column -->
    <div style="
      width:340px;flex-shrink:0;
      position:relative;
      background:${imgBg};
      border-right:3px solid ${accent}22;
    ">
      <img
        src="${e(product.imageUrl)}"
        alt="${e(product.name)}"
        loading="eager"
        style="
          width:100%;height:100%;
          object-fit:${imgFit};
          display:block;
          ${product.contain ? 'padding:24px;' : ''}
        "
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      />
      <!-- Fallback if image fails -->
      <div style="
        display:none;
        position:absolute;inset:0;
        align-items:center;justify-content:center;
        flex-direction:column;gap:12px;
        background:linear-gradient(135deg, #0D1520 0%, #111B2B 100%);
      ">
        <div style="
          font-family:${MONO};font-size:10px;color:${accent};
          letter-spacing:0.14em;opacity:0.5;text-align:center;padding:0 20px;
        ">${e(product.name)}</div>
      </div>

      <!-- Bottom overlay with product name -->
      <div style="
        position:absolute;bottom:0;left:0;right:0;
        padding:14px 16px 10px;
        background:linear-gradient(180deg, transparent 0%, rgba(4,6,12,0.92) 100%);
      ">
        <div style="font-family:${MONO};font-size:8px;color:#555;letter-spacing:0.12em;">
          ${e(product.name)} — Durbolt Power
        </div>
      </div>

      <!-- Division number watermark -->
      <div style="
        position:absolute;top:16px;left:16px;
        font-family:${MONO};font-size:9px;font-weight:700;
        color:${accent};letter-spacing:0.16em;
        background:rgba(4,6,12,0.82);
        border:1px solid ${accent}44;
        padding:3px 8px;
      ">DIV. ${String(division.id).padStart(2,'0')}</div>
    </div>

    <!-- RIGHT: Content column -->
    <div style="
      flex:1;
      display:flex;flex-direction:column;
      padding:28px 28px 20px;
      overflow:hidden;
    ">

      <!-- Product name -->
      <h2 style="
        font-family:${HEADING};font-size:26px;font-weight:800;
        color:#fff;letter-spacing:-0.01em;line-height:1.15;
        margin-bottom:8px;
      ">${e(product.name)}</h2>

      <!-- Spec line -->
      <p style="
        font-family:${MONO};font-size:9.5px;color:${accent};
        letter-spacing:0.05em;line-height:1.5;
        margin-bottom:16px;
      ">${e(product.spec)}</p>

      <!-- Accent divider -->
      <div style="
        height:1px;
        background:linear-gradient(90deg, ${accent}50, transparent);
        margin-bottom:16px;
      "></div>

      <!-- Spec table -->
      <div style="flex:1;overflow:hidden;margin-bottom:12px;">
        ${specs}
      </div>

      <!-- Certifications -->
      ${certs ? `
        <div style="margin-bottom:10px;">
          <div style="font-family:${MONO};font-size:7.5px;font-weight:700;color:#444;
            letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">
            CERTIFICATIONS
          </div>
          <div>${certs}</div>
        </div>` : ''}

      <!-- Applications -->
      ${apps ? `
        <div style="margin-bottom:14px;">
          <div style="font-family:${MONO};font-size:7.5px;font-weight:700;color:#444;
            letter-spacing:0.2em;text-transform:uppercase;margin-bottom:4px;">
            APPLICATIONS
          </div>
          <p style="font-family:${MONO};font-size:8px;color:#666;
            letter-spacing:0.04em;line-height:1.6;">
            ${e(apps)}
          </p>
        </div>` : ''}

      <!-- Separator -->
      <div style="height:1px;background:rgba(255,255,255,0.05);margin-bottom:12px;"></div>

      <!-- Disclaimer -->
      <p style="
        font-family:${MONO};font-size:7.5px;color:#444;
        font-style:italic;letter-spacing:0.03em;line-height:1.5;
        margin-bottom:12px;
      ">Unit configuration, color, and finish may vary depending on project requirements and specifications.</p>

      <!-- CTA -->
      <div style="
        background:${accent};
        padding:12px 16px;
        display:flex;align-items:center;justify-content:space-between;
        flex-shrink:0;
      ">
        <span style="
          font-family:${MONO};font-size:9px;font-weight:700;
          color:#fff;letter-spacing:0.18em;text-transform:uppercase;
        ">REQUEST QUOTE</span>
        <span style="
          font-family:${MONO};font-size:9px;color:rgba(255,255,255,0.85);
          letter-spacing:0.08em;
        ">SALES@DURBOLT.COM  →</span>
      </div>

    </div>
  </div>
</div>`;
}

// ─── Page: Back Cover ─────────────────────────────────────────────────────────

function backCoverPage() {
  return `
<div class="page" style="
  background:radial-gradient(ellipse at 50% 60%, #0D1825 0%, ${DARK2} 70%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;overflow:hidden;
">
  <!-- Grid pattern -->
  <div style="position:absolute;inset:0;
    background-image:
      linear-gradient(rgba(232,99,26,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,99,26,0.03) 1px, transparent 1px);
    background-size:44px 44px;pointer-events:none;
  "></div>
  <div style="position:absolute;inset:0;
    background:radial-gradient(ellipse at center, transparent 30%, rgba(4,6,12,0.75) 100%);
  "></div>

  <!-- Corner accents -->
  <div style="position:absolute;top:40px;left:40px;width:40px;height:40px;
    border-top:2px solid ${BRAND};border-left:2px solid ${BRAND};opacity:0.5;"></div>
  <div style="position:absolute;top:40px;right:40px;width:40px;height:40px;
    border-top:2px solid ${BRAND};border-right:2px solid ${BRAND};opacity:0.5;"></div>
  <div style="position:absolute;bottom:40px;left:40px;width:40px;height:40px;
    border-bottom:2px solid ${BRAND};border-left:2px solid ${BRAND};opacity:0.5;"></div>
  <div style="position:absolute;bottom:40px;right:40px;width:40px;height:40px;
    border-bottom:2px solid ${BRAND};border-right:2px solid ${BRAND};opacity:0.5;"></div>

  <!-- Content -->
  <div style="position:relative;z-index:1;text-align:center;padding:0 60px;">
    <div style="width:60px;height:2px;background:${BRAND};margin:0 auto 44px;
      box-shadow:0 0 20px ${BRAND};"></div>

    ${logoSVG(true)}

    <div style="
      font-family:${MONO};font-size:10px;letter-spacing:0.28em;color:#555;
      text-transform:uppercase;margin:14px 0 52px;
    ">Critical Power Infrastructure · Engineered for the World</div>

    <!-- Contact block -->
    <div style="
      border:1px solid rgba(232,99,26,0.25);
      padding:32px 52px;
      display:inline-block;
      background:rgba(232,99,26,0.03);
      margin-bottom:40px;
    ">
      <div style="font-family:${MONO};font-size:9px;color:${BRAND};
        letter-spacing:0.24em;text-transform:uppercase;margin-bottom:20px;">
        GET IN TOUCH
      </div>
      ${[
        ['WEBSITE',    'durbolt.com'],
        ['SALES',      'sales@durbolt.com'],
        ['QUOTES',     'quotes@durbolt.com'],
        ['GENERAL',    'info@durbolt.com'],
      ].map(([label, val]) => `
        <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:10px;">
          <span style="font-family:${MONO};font-size:8px;color:#444;
            letter-spacing:0.18em;width:60px;text-align:right;">${label}</span>
          <span style="font-family:${MONO};font-size:11px;color:#E0E0E0;
            letter-spacing:0.08em;">${val}</span>
        </div>`).join('')}
    </div>

    <!-- Division summary -->
    <div style="display:flex;gap:2px;justify-content:center;">
      ${DIVISIONS.map(d => `
        <div style="
          padding:12px 16px;
          border:1px solid ${d.accentFrom}20;
          border-top:2px solid ${d.accentFrom};
          text-align:center;
          min-width:120px;
        ">
          <div style="font-family:${MONO};font-size:8px;color:${d.accentFrom};
            letter-spacing:0.14em;margin-bottom:4px;">DIV.${String(d.id).padStart(2,'0')}</div>
          <div style="font-family:${HEADING};font-size:9px;color:#888;
            line-height:1.4;">${e(d.name)}</div>
        </div>`).join('')}
    </div>

    <div style="width:60px;height:2px;background:${BRAND};margin:44px auto 0;
      box-shadow:0 0 20px ${BRAND};"></div>
  </div>

  <div style="
    position:absolute;bottom:36px;left:0;right:0;
    text-align:center;z-index:1;
  ">
    <div style="font-family:${MONO};font-size:8px;color:#333;letter-spacing:0.18em;">
      © 2025 DURBOLT POWER · ALL RIGHTS RESERVED · PRODUCT CATALOGUE EDITION 2025
    </div>
  </div>
</div>`;
}

// ─── Build HTML ───────────────────────────────────────────────────────────────

function buildHTML() {
  const pages = [];
  pages.push(coverPage());
  pages.push(aboutPage());

  let globalIdx = 0;
  for (const div of DIVISIONS) {
    pages.push(divisionDivider(div));
    div.products.forEach((product, i) => {
      pages.push(productPage(product, div, i + 1, div.products.length, globalIdx + 1));
      globalIdx++;
    });
  }
  pages.push(backCoverPage());

  const totalPages = pages.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Durbolt Power — Product Catalogue 2025</title>
  <style>${CSS}</style>
</head>
<body>

  <!-- Web viewer toolbar (hidden in print) -->
  <div id="viewer-bar">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:20px;height:2px;background:#E8631A;"></div>
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
        color:#fff;letter-spacing:0.18em;">DURBOLT <span style="color:#E8631A;">POWER</span></span>
      <div style="width:20px;height:2px;background:#E8631A;"></div>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#666;letter-spacing:0.2em;">
      PRODUCT CATALOGUE 2025 · ${totalPages} PAGES · ${ALL_PRODUCT_COUNT} PRODUCTS
    </div>
    <a href="durbolt-power-catalogue-2025.pdf"
       style="font-family:'JetBrains Mono',monospace;font-size:9px;
              background:#E8631A;color:#fff;padding:6px 14px;
              text-decoration:none;letter-spacing:0.14em;font-weight:700;">
      ↓ DOWNLOAD PDF
    </a>
  </div>

  <!-- Page spacer for fixed viewer bar -->
  <div style="height:48px;" class="no-print"></div>

  ${pages.join('\n\n')}

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Building HTML catalogue…');
  const html = buildHTML();
  const htmlPath = path.join(OUT, 'index.html');
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`✓  HTML written: ${htmlPath} (${(html.length / 1024).toFixed(0)} KB)`);

  const productCount = DIVISIONS.reduce((a, d) => a + d.products.length, 0);
  const pageCount = 1 + 1 + DIVISIONS.length + productCount + 1; // cover + about + dividers + products + back
  console.log(`   Pages: ${pageCount} (cover + about + ${DIVISIONS.length} dividers + ${productCount} products + back cover)`);

  console.log('\n🖨  Launching Playwright for PDF generation…');
  const PLAYWRIGHT = '/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
  const { chromium } = await import(PLAYWRIGHT);

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-web-security'] });
  const page = await browser.newPage();

  // Set viewport to A4 width
  await page.setViewportSize({ width: 794, height: 1123 });

  console.log('   Loading HTML…');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'load', timeout: 30000 });

  // Wait for fonts + images
  console.log('   Waiting for fonts and images…');
  await page.waitForTimeout(6000);

  // Check image load status
  const imgStats = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const loaded = imgs.filter(i => i.naturalWidth > 0).length;
    const failed = imgs.filter(i => i.naturalWidth === 0 && i.complete).length;
    return { total: imgs.length, loaded, failed };
  });
  console.log(`   Images: ${imgStats.loaded}/${imgStats.total} loaded, ${imgStats.failed} failed`);

  // Generate PDF
  const pdfPath = path.join(OUT, 'durbolt-power-catalogue-2025.pdf');
  console.log('   Generating PDF…');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  console.log(`✓  PDF written: ${pdfPath}`);

  // Take screenshots for reporting
  const screenshotsDir = path.join(OUT, 'screenshots');
  mkdirSync(screenshotsDir, { recursive: true });

  // Screenshot: Cover (page 1)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const pages_els = await page.$$('.page');

  if (pages_els[0]) {
    await pages_els[0].screenshot({ path: path.join(screenshotsDir, 'cover.png') });
    console.log('   Screenshot: cover.png');
  }

  // Screenshot: First division divider (page 3)
  if (pages_els[2]) {
    await pages_els[2].screenshot({ path: path.join(screenshotsDir, 'division-1-divider.png') });
    console.log('   Screenshot: division-1-divider.png');
  }

  // Screenshot: First product page (page 4)
  if (pages_els[3]) {
    await pages_els[3].screenshot({ path: path.join(screenshotsDir, 'product-1.png') });
    console.log('   Screenshot: product-1.png');
  }

  // Screenshot: A product from division 2
  if (pages_els[19]) {
    await pages_els[19].screenshot({ path: path.join(screenshotsDir, 'division-2-product.png') });
    console.log('   Screenshot: division-2-product.png');
  }

  await browser.close();

  // File size
  const { statSync } = await import('fs');
  const pdfSize = statSync(pdfPath).size;
  const htmlSize = statSync(htmlPath).size;

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  DURBOLT POWER — PRODUCT CATALOGUE 2025');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total pages:     ${pageCount}`);
  console.log(`  Products:        ${productCount} across ${DIVISIONS.length} divisions`);
  console.log(`  PDF size:        ${(pdfSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  HTML size:       ${(htmlSize / 1024).toFixed(0)} KB`);
  console.log(`  Images loaded:   ${imgStats.loaded}/${imgStats.total}`);
  console.log(`  Images failed:   ${imgStats.failed}`);
  console.log('───────────────────────────────────────────────────');
  console.log(`  PDF:  dist/catalogue/durbolt-power-catalogue-2025.pdf`);
  console.log(`  HTML: dist/catalogue/index.html`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => { console.error(err); process.exit(1); });
