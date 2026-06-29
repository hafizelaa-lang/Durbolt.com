import { Download } from "lucide-react";
import { PRODUCT_SPECS } from "../data/productSpecs.js";
import { toSlug } from "../utils/seo.js";

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const HEADING = "'Space Grotesk', sans-serif";
const BRAND = "#E8631A";

export default function ProductSpecSheet({ product, division }) {
  const specs = PRODUCT_SPECS[product.name];
  if (!specs) return null;

  const slug = toSlug(product.name);

  return (
    <section style={{ background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(44,82,130,0.15)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
              TECHNICAL DATASHEET
            </p>
            <h2 className="font-black" style={{ fontFamily: HEADING, fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800 }}>
              Engineering Specifications
            </h2>
          </div>
          <button
            onClick={() => window.open(`/datasheets/${slug}`, "_blank")}
            className="inline-flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase transition-all duration-200 flex-shrink-0"
            style={{ background: "rgba(232,99,26,0.1)", border: `1px solid ${BRAND}55`, color: BRAND, letterSpacing: "0.14em" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = BRAND; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(232,99,26,0.1)"; e.currentTarget.style.color = BRAND; e.currentTarget.style.borderColor = `${BRAND}55`; }}
          >
            <Download size={14} />
            Download Datasheet (PDF)
          </button>
        </div>

        {/* Spec tables */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {specs.categories.map((cat, idx) => (
            <div
              key={cat.title}
              style={{
                border: "1px solid rgba(44,82,130,0.2)",
                background: "rgba(8,14,22,0.6)",
                ...(specs.categories.length % 2 !== 0 && idx === specs.categories.length - 1
                  ? { gridColumn: "1 / -1" }
                  : {}),
              }}
            >
              <div className="px-4 py-2.5" style={{ background: `${division.accentFrom}12`, borderBottom: `1px solid ${division.accentFrom}33` }}>
                <p className="text-xs font-bold uppercase" style={{ color: division.accentFrom, letterSpacing: "0.18em", fontFamily: MONO }}>
                  {cat.title}
                </p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {cat.rows.map(([label, value], i) => (
                    <tr
                      key={label}
                      style={{ borderBottom: i < cat.rows.length - 1 ? "1px solid rgba(44,82,130,0.12)" : "none" }}
                    >
                      <td
                        className="text-xs font-semibold"
                        style={{ padding: "8px 14px", color: "#888", fontFamily: MONO, letterSpacing: "0.06em", width: "42%", verticalAlign: "top" }}
                      >
                        {label}
                      </td>
                      <td
                        className="text-xs font-medium"
                        style={{ padding: "8px 14px", color: "#E0E0E0", fontFamily: MONO, verticalAlign: "top" }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Certifications row */}
        <div style={{ border: "1px solid rgba(44,82,130,0.2)", background: "rgba(8,14,22,0.6)" }}>
          <div className="px-4 py-2.5" style={{ background: "rgba(44,82,130,0.08)", borderBottom: "1px solid rgba(44,82,130,0.15)" }}>
            <p className="text-xs font-bold uppercase" style={{ color: "#4A90D9", letterSpacing: "0.18em", fontFamily: MONO }}>
              CERTIFICATIONS & STANDARDS
            </p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {specs.certifications.map((cert) => (
              <span
                key={cert}
                className="text-xs font-bold px-3 py-1"
                style={{ background: "rgba(44,82,130,0.15)", border: "1px solid rgba(44,82,130,0.3)", color: "#A0C0E0", fontFamily: MONO, letterSpacing: "0.08em" }}
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Applications row */}
        <div className="mt-4" style={{ border: "1px solid rgba(44,82,130,0.2)", background: "rgba(8,14,22,0.6)" }}>
          <div className="px-4 py-2.5" style={{ background: `${division.accentFrom}0a`, borderBottom: `1px solid ${division.accentFrom}22` }}>
            <p className="text-xs font-bold uppercase" style={{ color: division.accentFrom, letterSpacing: "0.18em", fontFamily: MONO }}>
              TYPICAL APPLICATIONS
            </p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {specs.applications.map((app) => (
              <span
                key={app}
                className="text-xs font-semibold px-3 py-1"
                style={{ background: `${division.accentFrom}0d`, border: `1px solid ${division.accentFrom}33`, color: "#C8C8C8", fontFamily: MONO }}
              >
                {app}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
