import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Menu, X, Mail } from "lucide-react";
import { DIVISIONS } from "../data/divisions.js";
import { ARTICLES } from "../data/articles.js";
import { toSlug, usePageMeta } from "../utils/seo.js";
import ProductSpecSheet from "../components/ProductSpecSheet.jsx";
import FulfillmentSection from "../components/FulfillmentSection.jsx";

const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";
const HEADING = "'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

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

function buildDescription(product, division) {
  const name = product.name;
  const spec = product.spec;
  const divName = division.name;
  const keyword = name.toLowerCase();
  return `${name} — ${spec}. Durbolt Power supplies industrial ${keyword} direct to B2B buyers worldwide. Buy ${name} wholesale USA with factory-direct pricing from our global manufacturing network. Industrial ${keyword} supplier serving North America, the Middle East, and 50+ countries. ${name} for data centers, utilities, and critical infrastructure — B2B direct pricing, 24hr quote turnaround. Part of our ${divName} division — IEC/UL/ANSI certified, engineered to Durbolt specification. ${keyword} Middle East supplier with DDP fulfillment to UAE, Saudi Arabia, Egypt, and globally.`;
}

function PageNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8,14,22,0.97)" : "rgba(8,14,22,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(44,82,130,0.2)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ display: "block", width: "28px", height: "2px", background: "#E8631A", flexShrink: 0 }} />
          <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.18em", lineHeight: 1, color: "#FFFFFF" }}>
            DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
          </span>
          <span style={{ display: "block", width: "28px", height: "2px", background: "#E8631A", flexShrink: 0 }} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["About","/#about"],["Divisions","/#divisions"],["Products","/#products"],["Solutions","/solutions"],["Resources","/blog"],["How It Works","/#how-it-works"],["Contact","/#rfq"]].map(([label, href]) =>
            href.startsWith("/") && !href.startsWith("/#") ? (
              <Link key={href} to={href} className="text-xs font-semibold uppercase transition-colors duration-200" style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</Link>
            ) : (
              <a key={href} href={href} className="text-xs font-semibold uppercase transition-colors duration-200" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</a>
            )
          )}
          <a
            href="/#rfq"
            className="px-5 py-2 text-xs font-bold uppercase transition-all duration-200"
            style={{
              background: BRAND,
              color: "#fff",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              letterSpacing: "0.16em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
          >
            Request Quote
          </a>
        </div>

        <button
          className="md:hidden"
          style={{ color: "#fff" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 md:hidden"
            style={{ background: "rgba(0,0,0,0.6)", top: 0, zIndex: 40 }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-screen md:hidden flex flex-col"
            style={{
              width: "82%",
              maxWidth: 340,
              background: "rgba(8,14,22,0.98)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(232,99,26,0.2)",
              zIndex: 45,
            }}
          >
            <div className="px-6 pt-24 flex flex-col gap-6 flex-1">
              {[["About","/#about"],["Divisions","/#divisions"],["Products","/#products"],["Solutions","/solutions"],["Resources","/blog"],["How It Works","/#how-it-works"],["Contact","/#rfq"]].map(([label, href]) =>
                href.startsWith("/") && !href.startsWith("/#") ? (
                  <Link key={href} to={href} className="text-sm font-bold uppercase" style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }} onClick={() => setMobileOpen(false)}>{label}</Link>
                ) : (
                  <a key={href} href={href} className="text-sm font-bold uppercase" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }} onClick={() => setMobileOpen(false)}>{label}</a>
                )
              )}
            </div>
            <div className="p-6">
              <a
                href="/#rfq"
                className="block py-3 text-xs font-bold uppercase text-center"
                style={{ background: BRAND, color: "#fff", letterSpacing: "0.16em" }}
                onClick={() => setMobileOpen(false)}
              >
                Request a Quote
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="py-12 px-6" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(44,82,130,0.15)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ display: "block", width: "28px", height: "2px", background: "#E8631A", flexShrink: 0 }} />
              <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.18em", lineHeight: 1, color: "#FFFFFF" }}>
                DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
              </span>
              <span style={{ display: "block", width: "28px", height: "2px", background: "#E8631A", flexShrink: 0 }} />
            </Link>
            <p className="text-xs max-w-xs" style={{ color: "#C8C8C8" }}>
              Critical power and connectivity infrastructure. U.S.-based. B2B only.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[["About", "/#about"], ["Divisions", "/#divisions"], ["Products", "/#products"], ["Request Quote", "/#rfq"]].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-xs font-semibold uppercase transition-colors duration-150"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(44,82,130,0.1)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}>
            © 2026 DURBOLT POWER. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <Mail size={11} style={{ color: "#E0E0E0" }} />
            <a href="mailto:info@durbolt.com" className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO, textDecoration: "none" }}>info@durbolt.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ProductPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { slug } = useParams();
  const result = findProductBySlug(slug);

  if (!result) {
    return (
      <div style={{ background: "#080F1A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <PageNavbar />
        <p className="text-2xl font-black" style={{ fontFamily: HEADING }}>Product not found</p>
        <Link to="/" style={{ color: BRAND }}>← Back to Durbolt Power</Link>
      </div>
    );
  }

  const { product, division } = result;
  const divSlug = toSlug(division.name);
  const pageUrl = `https://durbolt.com/products/${slug}`;
  const pageTitle = `${product.name} | Durbolt Power — B2B Critical Power Infrastructure`;
  const pageDescription = `${product.name} — ${product.spec}. B2B supplier USA. Industrial ${product.name.toLowerCase()} supplier with factory-direct pricing. Global fulfillment. Middle East supplier.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.spec,
    "brand": { "@type": "Brand", "name": "Durbolt Power" },
    "url": pageUrl,
    "image": product.imageUrl,
    "manufacturer": { "@type": "Organization", "name": "Durbolt Power", "url": "https://durbolt.com" },
    "audience": { "@type": "BusinessAudience", "audienceType": "B2B" }
  };

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    canonical: pageUrl,
    jsonLd,
  });

  const description = buildDescription(product, division);
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ background: "#080F1A", minHeight: "100vh", color: "#fff" }}>
      <PageNavbar />

      {/* Hero */}
      <section
        style={{
          paddingTop: 96,
          background: `linear-gradient(180deg, rgba(5,8,15,0.92) 0%, rgba(8,14,22,0.98) 100%), url('/scene2-tower-storm.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Back link */}
          <a
            href="/#products"
            className="inline-flex items-center gap-2 mb-6 text-xs font-bold uppercase"
            style={{ color: "#888", letterSpacing: "0.16em", fontFamily: MONO }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <ArrowLeft size={12} /> Back to Products
          </a>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-xs" style={{ color: "#888", fontFamily: MONO, letterSpacing: "0.1em" }} aria-label="Breadcrumb">
            <Link to="/" style={{ color: "#888" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#888")}>Home</Link>
            <span>/</span>
            <Link to={`/divisions/${divSlug}`} style={{ color: "#888" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#888")}>{division.name}</Link>
            <span>/</span>
            <span style={{ color: "#E0E0E0" }}>{product.name}</span>
          </nav>

          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1 text-xs font-semibold uppercase"
            style={{ background: `${division.accentFrom}18`, border: `1px solid ${division.accentFrom}44`, color: division.accentFrom, fontFamily: MONO, letterSpacing: "0.16em" }}
          >
            DIV. {division.id.toString().padStart(2, "0")} — {division.name}
          </div>

          <h1
            className="font-black leading-tight mb-3"
            style={{ fontFamily: HEADING, fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            {product.name}
          </h1>

          {product.sku && (
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5"
              style={{ background: "rgba(232,99,26,0.06)", border: "1px solid rgba(232,99,26,0.2)", fontFamily: MONO }}
            >
              <span style={{ fontSize: "0.6rem", color: "#666", letterSpacing: "0.18em", textTransform: "uppercase" }}>PART NO.</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BRAND, letterSpacing: "0.14em" }}>{product.sku}</span>
            </div>
          )}

          <h2
            className="font-bold mb-2"
            style={{ fontFamily: HEADING, fontSize: "clamp(1rem,2vw,1.25rem)", color: "#C8C8C8", fontWeight: 500 }}
          >
            {division.name}
          </h2>

          <h3
            className="text-sm font-semibold mb-8"
            style={{ fontFamily: MONO, color: division.accentFrom, letterSpacing: "0.08em" }}
          >
            {product.spec}
          </h3>

          <div className="flex flex-wrap gap-4">
            <a
              href={`/?sku=${encodeURIComponent(product.sku || "")}&product=${encodeURIComponent(product.name)}#rfq`}
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase transition-all duration-200"
              style={{ background: BRAND, color: "#fff", clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", letterSpacing: "0.16em" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Request a Quote <ArrowRight size={16} />
            </a>
            <Link
              to={`/divisions/${divSlug}`}
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase transition-all duration-200"
              style={{ color: "#C8C8C8", border: "1px solid rgba(44,82,130,0.4)", letterSpacing: "0.16em" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = `${division.accentFrom}88`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#C8C8C8"; e.currentTarget.style.borderColor = "rgba(44,82,130,0.4)"; }}
            >
              View Division <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6" style={{ background: "rgba(8,14,22,0.98)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Product Image + Disclaimer */}
            <div>
              <div
                className="relative overflow-hidden"
                style={{ background: product.contain ? "#0a0a0a" : "#080F1A", border: `1px solid ${division.accentFrom}33`, minHeight: 320 }}
              >
                {!imgError ? (
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} - ${product.spec} - Durbolt Power`}
                    className={`w-full h-full ${product.contain ? "object-contain" : "object-cover"}`}
                    style={{ minHeight: 320, padding: product.contain ? "16px" : undefined }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      minHeight: 320,
                      background: "linear-gradient(135deg, #0D1520 0%, #111B2B 100%)",
                      backgroundImage: `linear-gradient(${division.accentFrom}0a 1px, transparent 1px), linear-gradient(90deg, ${division.accentFrom}0a 1px, transparent 1px)`,
                      backgroundSize: "28px 28px",
                    }}
                  >
                    <span className="text-xs font-semibold uppercase" style={{ color: division.accentFrom, fontFamily: MONO, letterSpacing: "0.16em" }}>
                      {product.name}
                    </span>
                  </div>
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3 text-xs font-semibold"
                  style={{ background: "rgba(8,14,22,0.85)", color: "#888", fontFamily: MONO, letterSpacing: "0.1em" }}
                >
                  {product.name} — Durbolt Power
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(232,99,26,0.28)", paddingTop: "10px", marginTop: "0" }}>
                <p style={{ fontFamily: MONO, fontSize: "0.62rem", color: "#777", fontStyle: "italic", letterSpacing: "0.05em", lineHeight: 1.55, margin: 0 }}>
                  Unit configuration, color, and finish may vary depending on project requirements and specifications.
                </p>
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-xs font-semibold uppercase mb-6" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
                TECHNICAL SPECIFICATIONS
              </p>

              <div
                className="p-5 mb-8"
                style={{ background: "rgba(232,99,26,0.05)", border: `1px solid ${division.accentFrom}33` }}
              >
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: division.accentFrom, fontFamily: MONO, letterSpacing: "0.16em" }}>Spec Range</p>
                <p className="font-bold text-lg" style={{ fontFamily: HEADING }}>{product.spec}</p>
              </div>

              <div className="mb-8">
                <p className="text-xs font-semibold uppercase mb-4" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
                  ABOUT THIS PRODUCT
                </p>
                <p className="leading-relaxed" style={{ color: "#C8C8C8", fontSize: "0.9rem", lineHeight: 1.8 }}>
                  {description}
                </p>
              </div>

              {/* Key facts */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  ...(product.sku ? [["Part No.", product.sku]] : []),
                  ["Division", division.name],
                  ["Certification", "IEC / UL / ANSI"],
                  ["Supply Model", "Factory-Direct B2B"],
                  ["Quote Turnaround", "24 Hours"],
                  ["Fulfillment", "DDP / FOB / CIF"],
                  ["Markets", "USA, UAE, SA, EG, Global"],
                ].map(([label, value]) => (
                  <div key={label} className="p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(44,82,130,0.15)" }}>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#666", fontFamily: MONO, letterSpacing: "0.12em" }}>{label}</p>
                    <p className="text-xs font-bold" style={{ color: "#E0E0E0", fontFamily: MONO }}>{value}</p>
                  </div>
                ))}
              </div>

              <a
                href={`/?sku=${encodeURIComponent(product.sku || "")}&product=${encodeURIComponent(product.name)}#rfq`}
                className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase w-full justify-center transition-all duration-200"
                style={{ background: BRAND, color: "#fff", clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
              >
                Request Quote for {product.name} <ArrowRight size={16} />
              </a>
              <p className="text-center text-xs mt-4" style={{ color: "#C8C8C8", letterSpacing: "0.04em" }}>
                Request a quote at{" "}
                <a href="mailto:quotes@durbolt.com" style={{ color: BRAND, textDecoration: "none" }}>quotes@durbolt.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spec Sheet */}
      <ProductSpecSheet product={product} division={division} />

      {/* Production & Fulfillment */}
      <FulfillmentSection product={product} division={division} />

      {/* Related products */}
      <section className="py-16 px-6" style={{ background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(44,82,130,0.1)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: division.accentFrom, letterSpacing: "0.22em", fontFamily: MONO }}>
            MORE FROM THIS DIVISION
          </p>
          <h2 className="font-black mb-10" style={{ fontFamily: HEADING, fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800 }}>
            {division.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {division.products
              .filter((p) => toSlug(p.name) !== slug)
              .slice(0, 8)
              .map((p) => (
                <Link
                  key={p.name}
                  to={`/products/${toSlug(p.name)}`}
                  className="block p-4 transition-all duration-200"
                  style={{ background: "rgba(8,8,8,0.92)", border: `1px solid ${division.accentFrom}22` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${division.accentFrom}66`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${division.accentFrom}22`; }}
                >
                  <p className="text-xs font-black mb-1" style={{ fontFamily: HEADING, lineHeight: 1.3 }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "#888", fontFamily: MONO }}>{p.spec.split(",")[0]}</p>
                  <p className="text-xs mt-2 font-semibold" style={{ color: division.accentFrom, letterSpacing: "0.1em", fontFamily: MONO }}>
                    VIEW →
                  </p>
                </Link>
              ))}
          </div>
          <div className="mt-8">
            <Link
              to={`/divisions/${divSlug}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase"
              style={{ color: division.accentFrom, letterSpacing: "0.16em" }}
            >
              <ArrowLeft size={12} /> All {division.products.length} {division.name} Products
            </Link>
          </div>
        </div>
      </section>

      {/* Related Reading */}
      {(() => {
        const related = ARTICLES.filter((a) =>
          a.relatedProductNames && a.relatedProductNames.some((n) => toSlug(n) === slug || n === product.name)
        ).slice(0, 2);
        if (related.length === 0) return null;
        return (
          <section className="py-14 px-6" style={{ background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(232,99,26,0.1)" }}>
            <div className="max-w-7xl mx-auto">
              <p className="text-xs font-semibold uppercase mb-6" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
                RELATED READING
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((article) => (
                  <Link key={article.slug} to={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      className="flex gap-4"
                      style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.2)", padding: "16px", transition: "border-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(232,99,26,0.5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(232,99,26,0.2)")}
                    >
                      <div style={{ width: 100, height: 70, overflow: "hidden", background: "#0A0A0A", flexShrink: 0 }}>
                        <img src={article.heroImg} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} loading="lazy" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: MONO, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: BRAND, textTransform: "uppercase", marginBottom: 6 }}>{article.category}</p>
                        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: "0.88rem", color: "#E0E0E0", lineHeight: 1.35, margin: 0 }}>{article.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      <PageFooter />
    </div>
  );
}
