import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Menu, X, Mail } from "lucide-react";
import { DIVISIONS } from "../data/divisions.js";
import { toSlug, usePageMeta } from "../utils/seo.js";

const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";
const HEADING = "'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

function findDivisionBySlug(slug) {
  return DIVISIONS.find((d) => toSlug(d.name) === slug) || null;
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
            style={{ background: BRAND, color: "#fff", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", letterSpacing: "0.16em" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
          >
            Request Quote
          </a>
        </div>

        <button className="md:hidden" style={{ color: "#fff" }} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 md:hidden" style={{ background: "rgba(0,0,0,0.6)", top: 0, zIndex: 40 }} onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 h-screen md:hidden flex flex-col" style={{ width: "82%", maxWidth: 340, background: "rgba(8,14,22,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(232,99,26,0.2)", zIndex: 45 }}>
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
              <a href="/#rfq" className="block py-3 text-xs font-bold uppercase text-center" style={{ background: BRAND, color: "#fff", letterSpacing: "0.16em" }} onClick={() => setMobileOpen(false)}>Request a Quote</a>
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
            <p className="text-xs max-w-xs" style={{ color: "#C8C8C8" }}>Critical power and connectivity infrastructure. U.S.-based. B2B only.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[["About", "/#about"], ["Divisions", "/#divisions"], ["Products", "/#products"], ["Request Quote", "/#rfq"]].map(([label, href]) => (
              <a key={href} href={href} className="text-xs font-semibold uppercase transition-colors duration-150" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(44,82,130,0.1)" }}>
          <p className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}>© 2026 DURBOLT POWER. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-2">
            <Mail size={11} style={{ color: "#E0E0E0" }} />
            <a href="mailto:info@durbolt.com" className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO, textDecoration: "none" }}>info@durbolt.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ProductCard({ product, division }) {
  const [imgError, setImgError] = useState(false);
  const slug = toSlug(product.name);

  return (
    <Link
      to={`/products/${slug}`}
      className="block transition-all duration-200"
      style={{ background: "rgba(8,8,8,0.92)", border: `1px solid ${division.accentFrom}33`, textDecoration: "none" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${division.accentFrom}88`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${division.accentFrom}33`; }}
    >
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 180, background: product.contain ? "#0a0a0a" : "#080F1A" }}>
        {!imgError ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} - ${product.spec} - Durbolt Power`}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full ${product.contain ? "object-contain" : "object-cover"}`}
            style={{ padding: product.contain ? "8px" : undefined }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D1520 0%, #111B2B 100%)" }}>
            <span className="text-xs" style={{ color: division.accentFrom, fontFamily: MONO, opacity: 0.6 }}>{product.name.split(" ").slice(0, 2).join(" ")}</span>
          </div>
        )}
        <div className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold uppercase" style={{ fontFamily: MONO, background: "rgba(10,10,10,0.85)", color: division.accentFrom, letterSpacing: "0.12em", border: `1px solid ${division.accentFrom}44` }}>
          DIV. {division.id.toString().padStart(2, "0")}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-black mb-1 leading-tight" style={{ fontFamily: HEADING, fontWeight: 800, color: "#fff" }}>{product.name}</h3>
        <p className="text-xs mb-2" style={{ color: "#888", fontFamily: MONO, lineHeight: 1.5 }}>{product.spec}</p>
        <p style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#555", fontStyle: "italic", letterSpacing: "0.03em", lineHeight: 1.45, marginBottom: "10px" }}>
          Unit configuration, color, and finish may vary depending on project requirements and specifications.
        </p>
        <span className="text-xs font-bold uppercase" style={{ color: division.accentFrom, letterSpacing: "0.14em", fontFamily: MONO }}>
          View Details →
        </span>
      </div>
    </Link>
  );
}

export default function DivisionPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { slug } = useParams();
  const division = findDivisionBySlug(slug);

  if (!division) {
    return (
      <div style={{ background: "#080F1A", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <PageNavbar />
        <p className="text-2xl font-black" style={{ fontFamily: HEADING }}>Division not found</p>
        <Link to="/" style={{ color: BRAND }}>← Back to Durbolt Power</Link>
      </div>
    );
  }

  const pageUrl = `https://durbolt.com/divisions/${slug}`;
  const pageTitle = `${division.name} | Durbolt Power — B2B Critical Power Infrastructure`;
  const pageDescription = `${division.name} — ${division.tagline} ${division.products.length} product lines. B2B supplier USA. Factory-direct pricing. Industrial power infrastructure. Global fulfillment.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": division.name,
    "description": division.description,
    "numberOfItems": division.products.length,
    "itemListElement": division.products.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.name,
      "url": `https://durbolt.com/products/${toSlug(p.name)}`,
    })),
  };

  usePageMeta({ title: pageTitle, description: pageDescription, canonical: pageUrl, jsonLd });

  return (
    <div style={{ background: "#080F1A", minHeight: "100vh", color: "#fff" }}>
      <PageNavbar />

      {/* Hero */}
      <section
        style={{
          paddingTop: 96,
          background: `linear-gradient(180deg, rgba(5,8,15,0.9) 0%, rgba(8,14,22,0.98) 100%), url('${division.headerBg || "/scene2-tower-storm.jpg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 mb-8 text-xs" style={{ color: "#888", fontFamily: MONO, letterSpacing: "0.1em" }} aria-label="Breadcrumb">
            <Link to="/" style={{ color: "#888" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#888")}>Home</Link>
            <span>/</span>
            <span style={{ color: "#E0E0E0" }}>Divisions</span>
            <span>/</span>
            <span style={{ color: "#E0E0E0" }}>{division.name}</span>
          </nav>

          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 text-xs font-semibold uppercase" style={{ background: `${division.accentFrom}18`, border: `1px solid ${division.accentFrom}44`, color: division.accentFrom, fontFamily: MONO, letterSpacing: "0.16em" }}>
            DIVISION {division.id.toString().padStart(2, "0")} — {division.products.length} PRODUCTS
          </div>

          <h1 className="font-black leading-tight mb-4" style={{ fontFamily: HEADING, fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            {division.name}
          </h1>
          <p className="text-sm font-bold mb-4 italic" style={{ color: division.accentFrom }}>{division.tagline}</p>
          <p className="max-w-2xl leading-relaxed" style={{ color: "#C8C8C8", fontSize: "0.9rem", lineHeight: 1.8 }}>{division.description}</p>

          <div className="mt-8">
            <a
              href="/#rfq"
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase transition-all duration-200"
              style={{ background: BRAND, color: "#fff", clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)", letterSpacing: "0.16em" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Request a Quote <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-20 px-6" style={{ background: "rgba(8,14,22,0.98)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
            {division.products.length} PRODUCT LINES
          </p>
          <h2 className="font-black mb-12" style={{ fontFamily: HEADING, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            {division.name} Products
          </h2>

          <div style={{ borderLeft: "3px solid #E8631A", background: "rgba(232,99,26,0.05)", padding: "10px 16px", marginBottom: "24px" }}>
            <p style={{ fontFamily: MONO, fontSize: "0.62rem", color: "#999", fontStyle: "italic", letterSpacing: "0.07em", lineHeight: 1.5, margin: 0 }}>
              NOTICE — Unit configuration, color, and finish may vary depending on project requirements and specifications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {division.products.map((product) => (
              <ProductCard key={product.name} product={product} division={division} />
            ))}
          </div>
        </div>
      </section>

      {/* Other divisions */}
      <section className="py-16 px-6" style={{ background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(44,82,130,0.1)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase mb-8" style={{ color: "#888", letterSpacing: "0.22em", fontFamily: MONO }}>OTHER DIVISIONS</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIVISIONS.filter((d) => d.id !== division.id).map((d) => (
              <Link
                key={d.id}
                to={`/divisions/${toSlug(d.name)}`}
                className="block p-6 transition-all duration-200"
                style={{ background: "rgba(8,8,8,0.92)", border: `1px solid ${d.accentFrom}33`, textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${d.accentFrom}88`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${d.accentFrom}33`; }}
              >
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: d.accentFrom, fontFamily: MONO, letterSpacing: "0.16em" }}>
                  DIV. {d.id.toString().padStart(2, "0")} — {d.products.length} PRODUCTS
                </p>
                <p className="font-black text-sm" style={{ fontFamily: HEADING, fontWeight: 800, color: "#fff" }}>{d.name}</p>
                <p className="text-xs mt-1" style={{ color: "#888" }}>{d.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
