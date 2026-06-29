import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DIVISIONS } from "../data/divisions.js";
import { PRODUCT_SPECS } from "../data/productSpecs.js";
import { getLeadTimeTier } from "../components/FulfillmentSection.jsx";
import { toSlug } from "../utils/seo.js";

const FULFILLMENT_TIERS = {
  standard: { label: "Standard Product Line", range: "4–6 Weeks", rangeNote: "from confirmed order" },
  mid:      { label: "Mid-Complexity System", range: "6–10 Weeks", rangeNote: "from confirmed order" },
  high:     { label: "High-Complexity System", range: "10–16 Weeks", rangeNote: "from confirmed order" },
  utility:  { label: "Utility / Grid-Scale", range: "Quoted Per Project", rangeNote: "based on configuration and scope" },
};

function findProductBySlug(slug) {
  for (const div of DIVISIONS) {
    for (const product of div.products) {
      if (toSlug(product.name) === slug) {
        return { product, division: div };
      }
    }
  }
  return null;
}

export default function DatasheetPage() {
  const { slug } = useParams();
  const result = findProductBySlug(slug);

  useEffect(() => {
    if (!result) return;
    document.title = `${result.product.name} — Technical Datasheet | Durbolt Power`;
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        <p>Product not found.</p>
      </div>
    );
  }

  const { product, division } = result;
  const specs = PRODUCT_SPECS[product.name];
  const today = new Date();
  const revDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const tierKey = getLeadTimeTier(product.name);
  const tier = FULFILLMENT_TIERS[tierKey];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #fff;
          color: #111;
          font-family: 'Space Grotesk', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .ds-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
        }

        /* Print: no-screen UI */
        .no-print { }

        @page {
          size: A4 portrait;
          margin: 15mm 18mm 18mm 18mm;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          .ds-page { max-width: 100%; padding: 0; }
          .ds-cover { page-break-after: always; break-after: page; }
          .ds-body { padding: 28px 44px 36px; overflow: hidden; }
          .ds-fulfill { break-inside: avoid; page-break-inside: avoid; }
          .ds-spec-grid { break-inside: avoid; page-break-inside: avoid; }
          .ds-footer { break-inside: avoid; page-break-inside: avoid; }
          * { max-width: 100%; }
        }

        /* ── Cover ── */
        .ds-cover {
          background: #0A0E18;
          color: #fff;
          padding: 48px 44px 44px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          position: relative;
          overflow: hidden;
        }
        .ds-cover-stripe {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #E8631A, #CC5816);
        }
        .ds-cover-watermark {
          position: absolute;
          right: -20px; bottom: -30px;
          font-size: 200px;
          font-weight: 900;
          font-family: 'Space Grotesk', sans-serif;
          opacity: 0.04;
          line-height: 1;
          color: #E8631A;
          pointer-events: none;
          user-select: none;
        }
        .ds-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
        }
        .ds-brand-bar {
          width: 24px;
          height: 2px;
          background: #E8631A;
        }
        .ds-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          font-size: 1.05rem;
          letter-spacing: 0.16em;
          color: #fff;
        }
        .ds-brand-name span { color: #E8631A; }
        .ds-doc-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: #E8631A;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .ds-product-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.4rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 10px;
        }
        .ds-division-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .ds-spec-banner {
          background: rgba(232,99,26,0.1);
          border: 1px solid rgba(232,99,26,0.35);
          padding: 16px 20px;
          margin-bottom: 32px;
          max-width: 480px;
        }
        .ds-spec-banner-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #E8631A;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .ds-spec-banner-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
        }
        .ds-cover-meta {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }
        .ds-meta-item label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .ds-meta-item span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #C8C8C8;
        }

        /* ── Body ── */
        .ds-body {
          padding: 40px 44px;
          background: #fff;
          border-top: 4px solid #E8631A;
        }

        /* Section block — keeps title glued to its content across page breaks */
        .ds-section-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .ds-section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #E8631A;
          text-transform: uppercase;
          margin-bottom: 14px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #E8631A;
        }

        /* Spec tables */
        .ds-spec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 22px;
        }
        .ds-spec-grid > *:last-child:nth-child(odd) {
          grid-column: span 2;
        }
        @media (max-width: 600px) {
          .ds-spec-grid { grid-template-columns: 1fr; }
          .ds-spec-grid > *:last-child:nth-child(odd) { grid-column: span 1; }
        }

        .ds-spec-table {
          border: 1px solid #E5E7EB;
          break-inside: avoid;
        }
        .ds-spec-table-header {
          padding: 7px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          border-bottom: 1px solid #E5E7EB;
        }
        .ds-spec-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .ds-spec-table tr {
          border-bottom: 1px solid #F3F4F6;
        }
        .ds-spec-table tr:last-child {
          border-bottom: none;
        }
        .ds-spec-table td {
          padding: 6px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          vertical-align: top;
          line-height: 1.4;
        }
        .ds-spec-table td:first-child {
          color: #6B7280;
          width: 44%;
          font-weight: 500;
        }
        .ds-spec-table td:last-child {
          color: #111827;
          font-weight: 600;
        }

        /* Certs & Applications */
        .ds-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .ds-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 4px 8px;
          border: 1px solid;
        }
        .ds-tag-cert {
          color: #1D4ED8;
          border-color: #BFDBFE;
          background: #EFF6FF;
        }
        .ds-tag-app {
          color: #374151;
          border-color: #E5E7EB;
          background: #F9FAFB;
        }

        /* QC Process */
        .ds-qc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 22px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .ds-qc-item {
          border: 1px solid #E5E7EB;
          padding: 10px;
          break-inside: avoid;
        }
        .ds-qc-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #E8631A;
          line-height: 1;
          margin-bottom: 4px;
        }
        .ds-qc-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 3px;
        }
        .ds-qc-body {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          color: #6B7280;
          line-height: 1.4;
        }

        /* Key facts */
        .ds-facts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #E5E7EB;
          border: 1px solid #E5E7EB;
          margin-bottom: 22px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .ds-fact {
          background: #fff;
          padding: 10px 12px;
        }
        .ds-fact-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 500;
          color: #9CA3AF;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .ds-fact-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #111;
        }

        /* Footer */
        .ds-footer {
          background: #0A0E18;
          color: #fff;
          padding: 18px 44px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .ds-footer-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.16em;
          color: #fff;
        }
        .ds-footer-brand span { color: #E8631A; }
        .ds-footer-info {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #666;
          letter-spacing: 0.08em;
          text-align: right;
        }

        /* Fulfillment addendum */
        .ds-fulfill {
          border: 1.5px solid #E8631A;
          margin-bottom: 22px;
          break-inside: avoid;
        }
        .ds-fulfill-header {
          background: #E8631A;
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: nowrap;
        }
        .ds-fulfill-header-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ds-fulfill-header-lead {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .ds-fulfill-cols {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .ds-fulfill-col {
          padding: 12px 14px;
          border-right: 1px solid #F3F4F6;
          min-width: 0;
        }
        .ds-fulfill-col:last-child { border-right: none; }
        .ds-fulfill-col-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #E8631A;
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 1px solid #FDEBD0;
        }
        .ds-fulfill-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .ds-fulfill-col li {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #374151;
          line-height: 1.6;
          padding-left: 10px;
          position: relative;
          word-break: break-word;
        }
        .ds-fulfill-col li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #E8631A;
          font-size: 8px;
        }
        .ds-fulfill-footer {
          background: #FFF7ED;
          border-top: 1px solid #FDEBD0;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .ds-fulfill-footer p {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #374151;
          line-height: 1.4;
        }
        .ds-fulfill-footer strong {
          font-weight: 700;
          color: #111;
        }

        /* Screen-only top bar */
        .ds-screen-bar {
          background: #0A0E18;
          border-bottom: 1px solid rgba(232,99,26,0.2);
          padding: 12px 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ds-screen-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #888;
        }
        .ds-print-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #fff;
          background: #E8631A;
          border: none;
          padding: 8px 18px;
          cursor: pointer;
          text-transform: uppercase;
        }
      `}</style>

      <div className="ds-page">
        {/* Screen-only bar */}
        <div className="ds-screen-bar no-print">
          <span className="ds-screen-hint">
            Datasheet preview — use your browser's Print dialog to save as PDF
          </span>
          <button className="ds-print-btn" onClick={() => window.print()}>
            Save as PDF ↓
          </button>
        </div>

        {/* ── COVER ── */}
        <div className="ds-cover">
          <div className="ds-cover-stripe" />
          <div className="ds-cover-watermark">DB</div>

          <div className="ds-brand">
            <div className="ds-brand-bar" />
            <span className="ds-brand-name">DURBOLT <span>POWER</span></span>
            <div className="ds-brand-bar" />
          </div>

          <div className="ds-doc-label">Technical Datasheet — {division.name}</div>

          <h1 className="ds-product-name">{product.name}</h1>
          <div className="ds-division-name">Division {division.id.toString().padStart(2, "0")} — {division.name}</div>

          <div className="ds-spec-banner">
            <div className="ds-spec-banner-label">Specification Range</div>
            <div className="ds-spec-banner-value">{product.spec}</div>
          </div>

          <div className="ds-cover-meta">
            <div className="ds-meta-item">
              <label>Document No.</label>
              <span>DB-DS-{division.id.toString().padStart(2, "0")}-{product.name.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6)}</span>
            </div>
            <div className="ds-meta-item">
              <label>Revision</label>
              <span>Rev. A</span>
            </div>
            <div className="ds-meta-item">
              <label>Date</label>
              <span>{revDate}</span>
            </div>
            <div className="ds-meta-item">
              <label>Issuing</label>
              <span>Durbolt Power — Engineering</span>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="ds-body">

          {/* Technical Specifications */}
          {specs && (
            <>
              <div className="ds-section-title">Technical Specifications</div>
              <div className="ds-spec-grid">
                {specs.categories.map((cat) => (
                  <div key={cat.title} className="ds-spec-table">
                    <div
                      className="ds-spec-table-header"
                      style={{ background: `${division.accentFrom}15`, color: division.accentFrom }}
                    >
                      {cat.title}
                    </div>
                    <table>
                      <tbody>
                        {cat.rows.map(([label, value]) => (
                          <tr key={label}>
                            <td>{label}</td>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Key Commercial Facts */}
          <div className="ds-facts-grid">
            {[
              ["Division", division.name],
              ["Supply Model", "Built-to-Order, No Warehouse Stock"],
              ["Quote Turnaround", "24 Hours"],
              ["Fulfillment Terms", "DDP / FOB / CIF"],
              ["Markets", "USA, UAE, SA, EG + 50 Countries"],
              ["Lead Time", tier.range],
            ].map(([label, value]) => (
              <div key={label} className="ds-fact">
                <div className="ds-fact-label">{label}</div>
                <div className="ds-fact-value" style={label === "Lead Time" ? { color: "#E8631A" } : {}}>{value}</div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          {specs && (
            <>
              <div className="ds-section-title">Certifications & Standards</div>
              <div className="ds-tags" style={{ marginBottom: 20 }}>
                {specs.certifications.map((cert) => (
                  <span key={cert} className="ds-tag ds-tag-cert">{cert}</span>
                ))}
              </div>
            </>
          )}

          {/* Applications */}
          {specs && (
            <>
              <div className="ds-section-title">Typical Applications</div>
              <div className="ds-tags" style={{ marginBottom: 24 }}>
                {specs.applications.map((app) => (
                  <span key={app} className="ds-tag ds-tag-app">{app}</span>
                ))}
              </div>
            </>
          )}

          {/* QC Process */}
          <div className="ds-section-title">Quality & Compliance</div>
          <div className="ds-qc-grid">
            {[
              ["01", "FACTORY AUDIT", "Tier-1 manufacturers audited against Durbolt Power standards before onboarding."],
              ["02", "IN-PROCESS QC", "Inspection at each production milestone with documented hold points."],
              ["03", "FAT", "Factory Acceptance Testing per IEC/UL protocols before shipment."],
              ["04", "DOCUMENTATION", "Full cert package: test reports, COC, IOM manuals, CE/UL declarations."],
            ].map(([num, label, body]) => (
              <div key={num} className="ds-qc-item">
                <div className="ds-qc-num">{num}</div>
                <div className="ds-qc-label">{label}</div>
                <div className="ds-qc-body">{body}</div>
              </div>
            ))}
          </div>

          {/* Fulfillment & Quality Assurance addendum — section-block keeps title + table together */}
          <div className="ds-section-block">
          <div className="ds-section-title">Fulfillment & Quality Assurance — How Your Order Ships</div>
          <div className="ds-fulfill">
            <div className="ds-fulfill-header">
              <span className="ds-fulfill-header-title">Production & Fulfillment — {tier.label}</span>
              <span className="ds-fulfill-header-lead">Est. Lead Time: {tier.range} ({tier.rangeNote})</span>
            </div>
            <div className="ds-fulfill-cols">
              <div className="ds-fulfill-col">
                <div className="ds-fulfill-col-title">Production Process</div>
                <ul>
                  <li>Built-to-order — no warehouse stock</li>
                  <li>Configuration locked on order confirmation</li>
                  <li>BOM generated, production slot reserved</li>
                  <li>Manufactured to Durbolt Power specification</li>
                  <li>Components sourced from audited supply chain</li>
                </ul>
              </div>
              <div className="ds-fulfill-col">
                <div className="ds-fulfill-col-title">QC Verification</div>
                <ul>
                  <li>In-process inspection at each milestone</li>
                  <li>Functional load test per IEC / UL protocol</li>
                  <li>Factory Acceptance Test (FAT) — standard</li>
                  <li>Test reports and certificate of conformance</li>
                  <li>IOM manuals and CE / UL declarations included</li>
                </ul>
              </div>
              <div className="ds-fulfill-col">
                <div className="ds-fulfill-col-title">Delivery Terms</div>
                <ul>
                  <li>DDP (Delivered Duty Paid) — standard</li>
                  <li>FOB and CIF available on request</li>
                  <li>Freight, customs, documentation managed</li>
                  <li>USA, UAE, SA, EG + 50 countries served</li>
                  <li>24hr quote turnaround from inquiry</li>
                </ul>
              </div>
            </div>
            <div className="ds-fulfill-footer">
              <p><strong>All Durbolt products ship DDP (Delivered Duty Paid) to your specified destination.</strong></p>
              <p>Factory Acceptance Test (FAT) documentation included with every order. Contact info@durbolt.com for project-specific procurement terms.</p>
            </div>
          </div>
          </div>{/* end ds-section-block */}

          {/* Disclaimer */}
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#9CA3AF", lineHeight: 1.5, marginTop: 8 }}>
            Specifications are representative of standard product configurations. Exact parameters may vary by order configuration,
            project requirements, and applicable standards. All specifications subject to change without notice. Contact Durbolt Power
            for project-specific engineering documentation and final datasheet prior to procurement.
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div className="ds-footer">
          <div>
            <div className="ds-footer-brand">DURBOLT <span>POWER</span></div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#666", marginTop: 3 }}>
              info@durbolt.com · durbolt.com
            </div>
          </div>
          <div className="ds-footer-info">
            <div>© {today.getFullYear()} Durbolt Power. All rights reserved.</div>
            <div style={{ marginTop: 2 }}>
              {product.name} · Rev. A · {revDate} · B2B Industrial Supply
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
