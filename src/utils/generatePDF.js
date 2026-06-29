async function loadLogo() {
  try {
    const resp = await fetch('/logo.png');
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Square/near-square = app icon, not a wordmark — skip it
          const ratio = img.naturalWidth / img.naturalHeight;
          if (ratio < 1.8) { resolve(null); return; }
          resolve({ dataUrl: e.target.result, w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Draws the "— DURBOLT POWER —" wordmark matching the site navbar exactly.
// Navbar: 18px rule | 14px gap | text | 14px gap | 18px rule, font 1.15rem=18.4px,
//         alignItems:center, rule height 1.5px.  All ratios preserved below.
// onDark=true  → DURBOLT white, for cover page (black bg)
// onDark=false → DURBOLT dark gray, for inner pages (white bg)
// Returns the bottom Y after drawing.
function drawWordmark(doc, x, y, fontSize, onDark) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);

  const dur = 'DURBOLT';
  const pwr = ' POWER';
  const ORANGE_C = [232, 99, 26];
  const durColor = onDark ? [255, 255, 255] : [30, 30, 30];

  doc.setTextColor(...durColor);
  const durW = doc.getTextWidth(dur);
  doc.setTextColor(...ORANGE_C);
  const pwrW = doc.getTextWidth(pwr);

  // fontSize is in pt; jsPDF coords are mm. Convert: 1pt = 0.3528mm.
  const em  = fontSize * 0.3528;          // em-square height in mm
  const ruleLen = em * 0.978;             // navbar: 18px / 18.4px-em
  const gap     = em * 0.761;             // navbar: 14px / 18.4px-em
  const lw      = Math.max(0.4, em * 0.0815); // navbar: 1.5px / 18.4px-em (≈0.4mm)
  // Cap center: Helvetica cap-height ≈ 0.72em; center = 0.36em above baseline.
  const ruleY   = y - em * 0.36;

  let cx = x;

  doc.setDrawColor(...ORANGE_C);
  doc.setLineWidth(lw);
  doc.line(cx, ruleY, cx + ruleLen, ruleY);
  cx += ruleLen + gap;

  doc.setTextColor(...durColor);
  doc.text(dur, cx, y);
  cx += durW;

  doc.setTextColor(...ORANGE_C);
  doc.text(pwr, cx, y);
  cx += pwrW + gap;

  doc.setDrawColor(...ORANGE_C);
  doc.line(cx, ruleY, cx + ruleLen, ruleY);

  return y + fontSize * 0.15; // bottom edge
}

// Returns total width of the wordmark drawn by drawWordmark() at a given fontSize.
// Must stay in sync with the ruleLen/gap formulas above.
function wordmarkWidth(doc, fontSize) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  const em      = fontSize * 0.3528;
  const ruleLen = em * 0.978;
  const gap     = em * 0.761;
  doc.setTextColor(30, 30, 30);
  const durW = doc.getTextWidth('DURBOLT');
  doc.setTextColor(232, 99, 26);
  const pwrW = doc.getTextWidth(' POWER');
  return ruleLen + gap + durW + pwrW + gap + ruleLen;
}

const ORANGE = [232, 99, 26];
const W = 210;
const H = 297;
const ML = 20; // margin left
const MR = 20; // margin right
const CW = W - ML - MR; // content width = 180mm
const MB = 24;  // bottom reserved for footer+pagenumber

function addCoverPage(doc, article, logo) {
  // Black background
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, W, H, 'F');

  // Logo / wordmark — top left
  let logoBottomY = 15;
  if (logo) {
    // Wide PNG wordmark (aspect > 1.8 — real file, not an icon)
    const logoW = 56; // ~160px at 72dpi
    const logoH = (logoW * logo.h) / logo.w;
    doc.addImage(logo.dataUrl, 'PNG', ML, 12, logoW, logoH);
    logoBottomY = 12 + logoH + 4;
  } else {
    // Text wordmark — white "DURBOLT" + orange "POWER" + flanking rules
    const bottomEdge = drawWordmark(doc, ML, 21, 13, true);
    logoBottomY = bottomEdge + 4;
  }

  // Orange line below logo
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.35);
  doc.line(ML, logoBottomY, W - MR, logoBottomY);

  // Title — centered vertically at ~42% from top
  const titleY = H * 0.42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(article.title, W - ML - MR);
  const lineH = 11;
  const blockH = titleLines.length * lineH;
  titleLines.forEach((line, i) => {
    doc.text(line, W / 2, titleY - blockH / 2 + i * lineH, { align: 'center' });
  });

  // Category badge text below title
  const catY = titleY + blockH / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ORANGE);
  doc.text(article.category, W / 2, catY, { align: 'center' });

  // Bottom: "DURBOLT POWER · TECHNICAL BRIEF"
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...ORANGE);
  doc.text('DURBOLT POWER  ·  TECHNICAL BRIEF', W / 2, H - 14, { align: 'center' });

  // Date bottom right
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 100, 60);
  doc.text(today, W - MR, H - 14, { align: 'right' });
}

function addContentPageHeader(doc, article, logo) {
  // Orange top border
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.7);
  doc.line(0, 1, W, 1);

  // Logo / wordmark — top right
  if (logo) {
    const logoW = 28; // ~80px at 72dpi
    const logoH = (logoW * logo.h) / logo.w;
    doc.addImage(logo.dataUrl, 'PNG', W - MR - logoW, 4, logoW, logoH);
  } else {
    const totalW = wordmarkWidth(doc, 7);
    drawWordmark(doc, W - MR - totalW, 10, 7, false);
  }

  // Article title top-left
  const shortTitle = article.title.length > 65 ? article.title.slice(0, 62) + '...' : article.title;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(60, 60, 60);
  doc.text(shortTitle, ML, 10);

  // Thin separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.15);
  doc.line(ML, 15, W - MR, 15);
}

function addPageFooter(doc, pageNum, totalPages) {
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`Page ${pageNum} of ${totalPages}  ·  DURBOLT POWER`, W / 2, H - 9, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(170, 170, 170);
  doc.text('© 2026 Durbolt Power  ·  durbolt.com  ·  hello@durbolt.com', W / 2, H - 5, { align: 'center' });
}

function renderTextBlock(doc, text, x, y, maxW, fontSize, fontStyle, color, lineSpacing) {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', fontStyle);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxW);
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineSpacing);
  });
  return lines.length * lineSpacing;
}

export async function generateArticlePDF(article) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const logo = await loadLogo();

  // ===== COVER PAGE =====
  addCoverPage(doc, article, logo);

  // ===== CONTENT PAGES =====
  doc.addPage();

  // White background for content pages
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  addContentPageHeader(doc, article, logo);

  let y = 22; // start below header

  // Helper: check if we need a new page
  function ensureSpace(needed) {
    if (y + needed > H - MB) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, W, H, 'F');
      addContentPageHeader(doc, article, logo);
      y = 22;
    }
  }

  // Article title (big, dark)
  ensureSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  const titleLines = doc.splitTextToSize(article.title, CW);
  titleLines.forEach((line, i) => {
    doc.text(line, ML, y + i * 8);
  });
  y += titleLines.length * 8 + 4;

  // Category
  ensureSpace(8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text(article.category, ML, y);
  y += 10;

  // Orange divider
  ensureSpace(3);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.25);
  doc.line(ML, y, W - MR, y);
  y += 8;

  // Excerpt (italic intro paragraph)
  if (article.excerpt) {
    ensureSpace(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(70, 70, 70);
    const excerptLines = doc.splitTextToSize(article.excerpt, CW);
    excerptLines.forEach((line, i) => {
      ensureSpace(5.5);
      doc.text(line, ML, y);
      y += 5.5;
    });
    y += 4;

    // Thin gray divider after excerpt
    ensureSpace(3);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.15);
    doc.line(ML, y, W - MR, y);
    y += 8;
  }

  // ===== RENDER SECTIONS =====
  for (const section of article.sections || []) {
    switch (section.type) {
      case 'pullquote': {
        const quoteLines = doc.splitTextToSize(`"${section.body}"`, CW - 14);
        const blockH = (section.heading ? 8 : 0) + quoteLines.length * 5.5 + 12;
        ensureSpace(blockH);

        // Orange left border
        doc.setFillColor(232, 99, 26);
        doc.rect(ML, y - 1, 1.2, blockH - 4, 'F');

        // Heading
        if (section.heading) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...ORANGE);
          doc.text(section.heading.toUpperCase(), ML + 6, y + 4);
          y += 7;
        }

        // Quote text
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10.5);
        doc.setTextColor(90, 65, 45);
        quoteLines.forEach((line) => {
          ensureSpace(5.5);
          doc.text(line, ML + 6, y);
          y += 5.5;
        });
        y += 8;
        break;
      }

      case 'callout': {
        const calloutLines = doc.splitTextToSize(section.body, CW - 14);
        const blockH = (section.heading ? 8 : 0) + calloutLines.length * 5 + 12;
        ensureSpace(blockH);

        // Light orange background
        doc.setFillColor(255, 245, 238);
        doc.rect(ML, y - 1, CW, blockH - 2, 'F');
        // Orange left border
        doc.setFillColor(...ORANGE);
        doc.rect(ML, y - 1, 1.5, blockH - 2, 'F');

        if (section.heading) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...ORANGE);
          doc.text(section.heading.toUpperCase(), ML + 6, y + 5);
          y += 8;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        calloutLines.forEach((line) => {
          ensureSpace(5);
          doc.text(line, ML + 6, y);
          y += 5;
        });
        y += 8;
        break;
      }

      case 'bulletlist': {
        if (section.heading) {
          ensureSpace(12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(...ORANGE);
          doc.text(section.heading, ML, y);
          y += 8;
        }
        const bullets = (section.body || '').split('\n').filter((l) => l.trim());
        for (const bullet of bullets) {
          const text = bullet.replace(/^[-•▸]\s*/, '');
          const bulletLines = doc.splitTextToSize(text, CW - 7);
          ensureSpace(bulletLines.length * 5 + 3);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...ORANGE);
          doc.text('▸', ML, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          bulletLines.forEach((line, li) => {
            doc.text(line, ML + 5, y + li * 5);
          });
          y += bulletLines.length * 5 + 3;
        }
        y += 4;
        break;
      }

      case 'specbox': {
        if (section.heading) {
          ensureSpace(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...ORANGE);
          doc.text(section.heading.toUpperCase(), ML, y);
          y += 6;
        }
        const specLines = doc.splitTextToSize(section.body || '', CW - 4);
        const boxH = specLines.length * 4.5 + 8;
        ensureSpace(boxH);
        doc.setFillColor(245, 245, 245);
        doc.rect(ML, y - 2, CW, boxH, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.15);
        doc.rect(ML, y - 2, CW, boxH, 'S');
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        specLines.forEach((line) => {
          ensureSpace(4.5);
          doc.text(line, ML + 3, y + 2);
          y += 4.5;
        });
        y += 8;
        break;
      }

      default: {
        // paragraph
        if (section.heading) {
          ensureSpace(12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(...ORANGE);
          const headingLines = doc.splitTextToSize(section.heading, CW);
          headingLines.forEach((line) => {
            doc.text(line, ML, y);
            y += 6.5;
          });
          y += 2;
        }
        if (section.body) {
          const bodyLines = doc.splitTextToSize(section.body, CW);
          for (const line of bodyLines) {
            ensureSpace(5.5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(45, 45, 45);
            doc.text(line, ML, y);
            y += 5.5;
          }
          y += 5;
        }
      }
    }
  }

  // ===== SPEC TABLE =====
  if (article.specTable) {
    ensureSpace(20);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...ORANGE);
    doc.text('Specifications', ML, y);
    y += 7;

    const headers = article.specTable.headers || [];
    const rows = article.specTable.rows || [];
    const colW = CW / headers.length;
    const cellPad = 2.5;
    const headerH = 9;
    const rowH = 8;

    // Header row
    ensureSpace(headerH);
    doc.setFillColor(...ORANGE);
    doc.rect(ML, y, CW, headerH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    headers.forEach((h, i) => {
      doc.text(h, ML + i * colW + cellPad, y + 6);
    });
    y += headerH;

    // Data rows
    rows.forEach((row, ri) => {
      ensureSpace(rowH);
      if (ri % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(240, 240, 240);
      }
      doc.rect(ML, y, CW, rowH, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.rect(ML, y, CW, rowH, 'S');
      doc.setFont('helvetica', ri === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(40, 40, 40);
      row.forEach((cell, ci) => {
        const cellText = String(cell);
        const truncated = cellText.length > 40 ? cellText.slice(0, 37) + '...' : cellText;
        doc.text(truncated, ML + ci * colW + cellPad, y + 5.5);
      });
      y += rowH;
    });
    y += 8;
  }

  // ===== PULL QUOTES =====
  if (article.pullQuotes && article.pullQuotes.length > 0) {
    for (const q of article.pullQuotes) {
      const qLines = doc.splitTextToSize(`"${q}"`, CW - 12);
      const blockH = qLines.length * 5.5 + 10;
      ensureSpace(blockH);

      doc.setFillColor(232, 99, 26);
      doc.rect(ML, y, 1.2, blockH - 4, 'F');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(90, 65, 45);
      qLines.forEach((line) => {
        doc.text(line, ML + 6, y + 4);
        y += 5.5;
      });
      y += 8;
    }
  }

  // ===== INJECT PAGE NUMBERS =====
  const totalPages = doc.getNumberOfPages();
  const contentPages = totalPages - 1; // exclude cover
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i - 1, contentPages);
  }

  // ===== SAVE =====
  doc.save(`durbolt-${article.slug}-technical-brief.pdf`);
}
